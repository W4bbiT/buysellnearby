// productRoutes.js
const express = require('express');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

const router = express.Router();
const Product = require('../models/products');
const { validationResult } = require('express-validator');
const passport = require('passport');
const multer = require('multer');
const sharp = require('sharp');

// Multer configuration
const storage = multer.memoryStorage();
const filter = (req, file, callback) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        callback(null, true);
    } else {
        callback(new Error('Only JPEG, PNG, and JPG images are allowed.'));
    }
};
const upload = multer({
    storage,
    fileFilter: filter
});

const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.BUCKET_ACCESS_KEY,
        secretAccessKey: process.env.BUCKET_SECRET_ACCESS_KEY,
    },
    region: process.env.BUCKET_REGION,
});
// Get all products with pagination
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const sort = req.query.sort || '-createdOn'; // Default sorting by descending creation date
        const filter = req.query.filter || '';
        const minPrice = parseFloat(req.query.minPrice) || 0;
        const maxPrice = parseFloat(req.query.maxPrice) || Number.MAX_SAFE_INTEGER;
        const totalCount = await Product.countDocuments();
        const totalPages = Math.ceil(totalCount / limit);
        const query = {
            $and: [
                {
                    $or: [
                        { productName: { $regex: filter, $options: 'i' } },
                        { category: { $regex: filter, $options: 'i' } },
                    ],
                },
                { price: { $gte: minPrice, $lte: maxPrice } },
            ],
        };
        const products = await Product.find(query)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit);
        res.json({
            products,
            totalCount,
            totalPages,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Search products by name
router.get('/search', async (req, res) => {
    const productName = req.query.name;
    if (!productName) {
        return res.status(400).json({ message: 'Invalid product name' });
    }
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const regex = new RegExp(productName, 'i'); // Case-insensitive search regex
        const products = await Product.find({ productName: regex })
            .skip((page - 1) * limit)
            .limit(limit);
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Search products by category and subcategories from URL parameter
router.get('/category-search/:categories', async (req, res) => {
    const combinedCategories = req.params.categories;
    const categories = combinedCategories.split('-').map(category => category.replace(/%20/g, ' '));
    if (categories.length === 0) {
        return res.status(400).json({ message: 'No categories provided' });
    }
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        // Build an array of regex patterns for each category
        const categoryRegexArray = categories.map(category => new RegExp(category, 'i'));
        // Query products that match all categories using $all
        const products = await Product.find({ category: { $in: categoryRegexArray } })
            .skip((page - 1) * limit)
            .limit(limit);
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a single product by ID
router.get('/:pId', getProduct, async (req, res) => {
    try {
        const product = res.product;
        await product.populate('details');
        res.json({ success: true, product: product });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Middleware to check if the user owns the product
const checkProductOwnership = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const productId = req.params.pId;
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        // Check if the logged-in user owns the product
        if (product.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You do not have permission to perform this action' });
        }
        res.product = product;
        next();
    } catch (err) {
        next(err);
    }
};

// Create a product (accessible only by logged-in users)
router.post('/create', upload.array('productImages'), passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { productName, category, price, description, inStock, featureProduct, details } = req.body;
        const { user } = req;
        const product = new Product({
            productName,
            category,
            price,
            description,
            inStock,
            featureProduct,
            details,
            owner: req.user._id,
        });
        // Process and save multiple images to S3 with sharp
        const totalImageCount = req.files.length;
        if (totalImageCount > 5) {
            throw new Error('Cannot upload more than 5 images per product.');
        }
        if (req.files && req.files.length > 0) {
            // Create an array to store processed images
            const processedImages = [];
            for (let index = 0; index < req.files.length; index++) {
                const file = req.files[index];
                const imageExtension = file.originalname.split('.').pop();
                const imageName = `${product._id}/${index + 1}.${imageExtension}`;
                const s3Params = {
                    Bucket: process.env.BUCKET_NAME,
                    Key: `productImages/${user._id}/${imageName}`,
                    Body: await sharp(file.buffer).resize({ width: 800 }).toBuffer(), // Use sharp for resizing
                    ContentType: file.mimetype,
                };
                // Upload image to S3
                try {
                    await s3.send(new PutObjectCommand(s3Params));
                    processedImages.push({
                        path: `https://${process.env.BUCKET_NAME}.s3.${process.env.BUCKET_REGION}.amazonaws.com/productImages/${user._id}/${imageName}`,
                    });
                } catch (uploadError) {
                    // Handle S3 upload error
                    console.error('S3 Upload Error:', uploadError.message);
                    throw new Error('Error uploading image to S3');
                }
            }
            // Store the processed images in the productImages array
            product.productImages = processedImages.map(({ path }) => ({ path }));
        }
        const newProduct = await product.save();
        res.status(201).json(newProduct);
    } catch (err) {
        console.error('Create Product Error:', err.message);
        res.status(400).json({ message: 'Error creating product', error: err.message });
    }
});


// Middleware to process and save product images to S3
async function processAndSaveProductImages(files, product, user, deletedImages) {
    try {
        // Ensure the product has a valid productImages array
        if (!product.productImages) {
            product.productImages = [];
        }
        // Remove deleted images from the productImages array
        if (deletedImages && deletedImages.length > 0) {
            product.productImages = product.productImages.filter((image, index) => !deletedImages.includes(index));
            // Delete old images from S3
            for (const deletedIndex of deletedImages) {
                await deleteProductImageS3(user._id, product._id, deletedIndex);
            }
        }
        // Ensure that the total number of images doesn't exceed the limit (5)
        const totalImageCount = product.productImages.length + files.length;
        if (totalImageCount > 5) {
            throw new Error('Cannot upload more than 5 images per product.');
        }
        // Process and save new images to S3
        const processedImages = [];
        for (let index = 0; index < files.length; index++) {
            const file = files[index];
            const imageExtension = file.originalname.split('.').pop();
            const imageName = `${product._id}/${index + 1}.${imageExtension}`;
            const s3Params = {
                Bucket: process.env.BUCKET_NAME,
                Key: `productImages/${user._id}/${imageName}`,
                Body: file.buffer,
                ContentType: file.mimetype,
            };
            // Upload image to S3
            await s3.send(new PutObjectCommand(s3Params));
            processedImages.push({
                path: `https://${process.env.BUCKET_NAME}.s3.${process.env.BUCKET_REGION}.amazonaws.com/productImages/${user._id}/${imageName}`,
            });
        }
        // Store the processed images in the productImages array
        product.productImages = [...product.productImages, ...processedImages];
    } catch (error) {
        throw error;
    }
}
// Edit a product (accessible only by the owner)
router.patch('/edit/:pId', upload.array('productImages'), passport.authenticate('jwt', { session: false }), checkProductOwnership, async (req, res) => {
    try {
        const { productName, category, price, description, inStock, featureProduct, details, deletedImages } = req.body;
        const { user } = req;
        const productId = req.params.pId;
        const product = await Product.findOne({ _id: productId, owner: user._id });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        // Process and update multiple images
        await processAndSaveProductImages(req.files, product, user, deletedImages);
        if (productName) {
            product.productName = productName;
        }
        if (category) {
            product.category = category;
        }
        if (price) {
            product.price = price;
        }
        if (description) {
            product.description = description;
        }
        if (inStock) {
            product.inStock = inStock;
        }
        if (featureProduct) {
            product.featureProduct = featureProduct;
        }
        if (details) {
            product.details = details;
        }
        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// New route to delete a specific image from a product
router.delete('/delete-image/:productId/:imageId', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { user } = req;
        const { productId, imageId } = req.params;
        const product = await Product.findOne({ _id: productId, owner: user._id });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        // Find the image by ID in the productImages array
        const image = product.productImages.find(img => img.id === imageId);
        if (!image || !image.path) {
            return res.status(404).json({ message: 'Image not found in the productImages array' });
        }
        // Delete the image file from S3
        const isS3DeletionSuccessful = await deleteProductImageS3(image.path);
        if (isS3DeletionSuccessful) {
            // Remove the image from the productImages array in the database
            product.productImages = product.productImages.filter(img => img.id !== imageId);
            await product.save();
            res.json({ message: 'Image deleted successfully' });
        } else {
            res.status(500).json({ message: 'Error deleting image from S3' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting image', error: error.message });
    }
});

async function deleteProductImageS3(imagePath) {
    try {
        const s3Key = imagePath.substring(imagePath.indexOf('productImages'));
        // Delete the image object from S3
        const deleteObjectParams = {
            Bucket: process.env.BUCKET_NAME,
            Key: s3Key,
        };
        // Proceed with deletion
        const response = await s3.send(new DeleteObjectCommand(deleteObjectParams));
        console.log('S3 Delete Response:', response);
        // Check if the deletion was successful
        return response && response.$metadata.httpStatusCode === 204;
    } catch (error) {
        console.error(`Error deleting image from S3: ${error.message}`);
        return false;
    }
}

// Delete a product (accessible only by the owner)
router.delete('/delete/:pId', passport.authenticate('jwt', { session: false }), checkProductOwnership, async (req, res) => {
    try {
        const { user } = req;
        const productId = req.params.pId;
        const product = await Product.findOneAndDelete({ _id: productId, owner: user._id });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        // Delete associated images from the S3 bucket
        if (product.productImages && product.productImages.length > 0) {
            for (const image of product.productImages) {
                await deleteProductImageS3(image.path);
            }
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/user-products/:userId', async (req, res) => {
    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    try {
        // Use the static method from the Product model to retrieve paginated user-specific products
        const userProducts = await Product.find({owner: userId})
        .skip(skip)
        .limit(limit)
        .sort('-createdOn')
        res.json(userProducts);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving paginated user products', error: error.message });
    }
});

// Error handling middleware
router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Something went wrong!' });
});

// getProduct middleware
async function getProduct(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const productId = req.params.pId;
        const product = await Product.findById(productId).populate('owner');
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.product = product;
        next();
    } catch (err) {
        next(err);
    }
}

module.exports = router;
