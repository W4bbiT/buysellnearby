// productRoutes.js
const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();
const Product = require('../models/products');
const { validationResult } = require('express-validator');
const passport = require('passport');
const path = require('path');
const fs = require('fs');
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


// Get all products with pagination
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
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
        const limit = parseInt(req.query.limit) || 10;
        // Build an array of regex patterns for each category
        const categoryRegexArray = categories.map(category => new RegExp(category, 'i'));
        // Query products that match all categories using $all
        const products = await Product.find({ category: { $all: categoryRegexArray } })
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
        res.json({ success: true, data: product });
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
        // Process and save multiple images
        if (req.files && req.files.length > 0) {
            const directory = `./uploads/productImage/${req.user._id}`;
            if (!fs.existsSync(directory)) {
                fs.mkdirSync(directory, { recursive: true });
            }
            // Create an array to store processed images
            const processedImages = [];
            for (let index = 0; index < req.files.length; index++) {
                const file = req.files[index];
                const imageExtension = file.originalname.split('.').pop();
                const imagePath = `${directory}/${product._id}_${index + 1}.${imageExtension}`;
                if (file.size > 2 * 1024 * 1024) {
                    // Use sharp's asynchronous methods
                    const resizedImage = await sharp(file.buffer)
                        .resize({ width: 800 }) // Adjust the width as needed
                        .toBuffer();
                    // Write the resized buffer to the file
                    fs.writeFileSync(imagePath, resizedImage);
                    processedImages.push({ path: imagePath });
                } else {
                    // Write the original buffer to the file
                    fs.writeFileSync(imagePath, file.buffer);
                    processedImages.push({ path: imagePath });
                }
            }
            // Check if the number of processed images exceeds 5
            if (processedImages.length > 5) {
                return res.status(400).json({ message: 'Cannot upload more than 5 images per product.' });
            }
            // Store the processed images in the productImages array
            product.productImages = processedImages.map(({ path }) => ({ path }));
        }
        const newProduct = await product.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

async function processAndSaveProductImages(files, product, user, deletedImages) {
    try {
        // Ensure the product has a valid productImages array
        if (!product.productImages) {
            product.productImages = [];
        }
        // Remove deleted images from the productImages array
        if (deletedImages && deletedImages.length > 0) {
            product.productImages = product.productImages.filter((image, index) => !deletedImages.includes(index));
            // Delete old images from the server
            const deletedIndex = deletedImages[0]; // Assuming deletedImages is an array
            const imageExtension = product.productImages[deletedIndex].path.split('.').pop();
            const deletedImagePath = `./uploads/productImage/${user._id.toString()}/${product._id}_${deletedIndex + 1}.${imageExtension}`;
            try {
                if (fs.existsSync(deletedImagePath)) {
                    await new Promise((resolve, reject) => {
                        fs.unlink(deletedImagePath, (error) => {
                            if (error) {
                                console.error(`Error deleting image: ${deletedImagePath}`, error);
                                reject(error);
                            } else {
                                resolve();
                            }
                        });
                    });
                }
            } catch (error) {
                console.error(`Error deleting image: ${deletedImagePath}`, error);
            }
        }
        // Ensure that the total number of images doesn't exceed the limit (5)
        const totalImageCount = product.productImages.length + files.length;
        if (totalImageCount > 5) {
            throw new Error('Cannot upload more than 5 images per product.');
        }
        // Process and save new images
        const directory = `./uploads/productImage/${user._id}`;
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
        }
        const processedImages = [];
        for (let index = 0; index < files.length; index++) {
            const file = files[index];
            const imageExtension = file.originalname.split('.').pop();
            const imagePath = `${directory}/${product._id}_${index + 1}.${imageExtension}`;
            if (file.size > 2 * 1024 * 1024) {
                // Use sharp's asynchronous methods
                const resizedImage = await sharp(file.buffer)
                    .resize({ width: 800 }) // Adjust the width as needed
                    .toBuffer();
                // Write the resized buffer to the file
                fs.writeFileSync(imagePath, resizedImage);
                processedImages.push({ path: imagePath });
            } else {
                // Write the original buffer to the file
                fs.writeFileSync(imagePath, file.buffer);
                processedImages.push({ path: imagePath });
            }
        }
        // Store the processed images in the productImages array
        product.productImages = [...product.productImages, ...processedImages];
        // Save the updated product with new images
        const updatedProduct = await product.save();
        return updatedProduct;
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

// Add this function to your routes file
const deleteProductImage = async (userId, productId, imageIndex, product) => {
    try {
        const image = product.productImages[imageIndex];
        const imagePath = `${image.path}`; // Add a dot at the beginning to make it a relative path
        console.log('Deleting image at path:', imagePath);
        // Check if the file exists before attempting to delete
        const fileExists = await fs.promises.access(imagePath)
            .then(() => true)
            .catch(() => false);
        if (fileExists) {
            // Delete the image file
            await fs.promises.unlink(imagePath);          
            // Optional: Remove the image entry from the productImages array
            product.productImages.splice(imageIndex, 1);
            await product.save();        
            console.log(`Image deleted successfully: ${imagePath}`);
        } else {
            console.log(`File not found: ${imagePath}`);
            // Handle the case where the file doesn't exist
        }
    } catch (error) {
        console.error(`Error deleting image: ${error.message}`);
        throw error;
    }
};

// New route to delete a specific image from a product
router.delete('/delete/:productId/:imageIndex', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { user } = req;
        const { productId, imageIndex } = req.params;
        // Retrieve the product from the database
        const product = await Product.findOne({ _id: productId, owner: user._id });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        // Delete the image file
        await deleteProductImage(user._id, productId, imageIndex, product);
        // Remove the image from the productImages array in the database
        product.productImages.splice(imageIndex, 1);
        await product.save();
        res.json({ message: 'Image deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting image', error: error.message });
    }
});

// Delete a product (accessible only by the owner)
router.delete('/delete/:pId', passport.authenticate('jwt', { session: false }), checkProductOwnership, async (req, res) => {
    try {
        const { user } = req;
        const productId = req.params.pId;
        const product = await Product.findOneAndDelete({ _id: productId, owner: user._id });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        // Delete associated images from the database
        // Delete associated images from the database and file system
        if (product.productImages && product.productImages.length > 0) {
            for (let index = 0; index < product.productImages.length; index++) {
                await deleteProductImage(user._id, productId, index, product);
            }
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
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
        const product = await Product.findById(productId).populate('details');
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
