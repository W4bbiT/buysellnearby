// productRoutes.js
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const sharp = require('sharp');
const router = express.Router();
const Product = require('../models/products');
const { validationResult } = require('express-validator');
const passport = require('passport');
const path = require('path');
const fs = require('fs');

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
        const totalCount = await Product.countDocuments();
        const totalPages = Math.ceil(totalCount / limit);
        const products = await Product.find()
            .skip((page - 1) * limit)
            .limit(limit);
        res.json({
            products,
            totalCount,
            totalPages
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

// Get all reviews for a specific product
router.get('/:pId/reviews', getProductReviews, (req, res) => {
    try {
        res.json(res.reviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a product (accessible only by logged-in users)
router.post('/create', passport.authenticate('jwt', { session: false }), upload.array('productImages'), async (req, res) => {
    try {
        const { productName, category, price, discount, description, inStock, featureProduct, details } = req.body;
        const { user } = req;
        const product = new Product({
            productName,
            category,
            price,
            discount,
            description,
            inStock,
            featureProduct,
            details,
            owner: user._id,
        });
        // Process and save multiple images
        if (req.files && req.files.length > 0) {
            // Use sharp to resize the images and keep them below 2MB
            const processedImages = await Promise.all(
                req.files.map(async (file) => {
                    if (file.size > 1024 * 1024) {
                        const resizedImage = await sharp(file.buffer)
                            .resize({ width: 800 }) // Adjust the width as needed
                            .toBuffer();
                        return {
                            filename: `${user._id}_${product._id}_${Date.now()}.jpg`,
                            buffer: resizedImage,
                        };
                    } else {
                        return {
                            filename: `${user._id}_${product._id}_${Date.now()}.jpg`,
                            buffer: file.buffer,
                        };
                    }
                })
            );
            // Check if the number of processed images exceeds 5
            if (processedImages.length > 5) {
                return res.status(400).json({ message: 'Cannot upload more than 5 images per product.' });
            }
            product.productImages = processedImages.map(({ filename }) => ({ filename }));
        }
        const newProduct = await product.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Edit a product (accessible only by the owner)
router.patch('/edit/:pId', passport.authenticate('jwt', { session: false }), upload.array('productImages'), checkProductOwnership, async (req, res) => {
    try {
        const { productName, category, price, discount, description, inStock, featureProduct, details } = req.body;
        const { user } = req;
        const productId = req.params.pId;
        const product = await Product.findOne({ _id: productId, owner: user._id });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        // Delete existing product images from the database
        if (product.productImages && product.productImages.length > 0) {
            product.productImages.forEach((image) => {
                // Remove image from database or perform any other necessary deletion logic
                // For example: Image.deleteOne({ _id: image._id });
            });
        }
        product.productName = productName;
        product.category = category;
        product.price = price;
        product.discount = discount;
        product.description = description;
        product.inStock = inStock;
        product.featureProduct = featureProduct;
        product.details = details;
        // Process and update multiple images
        if (req.files && req.files.length > 0) {
            const processedImages = await Promise.all(
                req.files.map(async (file) => {
                    if (file.size > 1024 * 1024) {
                        const resizedImage = await sharp(file.buffer)
                            .resize({ width: 800 }) // Adjust the width as needed
                            .toBuffer();
                        return {
                            filename: `${user._id}_${product._id}_${Date.now()}.jpg`,
                            buffer: resizedImage,
                        };
                    } else {
                        return {
                            filename: `${user._id}_${product._id}_${Date.now()}.jpg`,
                            buffer: file.buffer,
                        };
                    }
                })
            );
            // Check if the number of processed images exceeds 5
            if (processedImages.length > 5) {
                return res.status(400).json({ message: 'Cannot upload more than 5 images per product.' });
            }
            product.productImages = processedImages.map(({ filename }) => ({ filename }));
        }
        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
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
        if (product.productImages && product.productImages.length > 0) {
            product.productImages.forEach(async (image) => {
                // Remove image from database or perform any other necessary deletion logic
                // For example: Image.deleteOne({ _id: image._id });
                // Also, delete the image file from the server if needed
                const imagePath = path.join(__dirname, 'uploads', 'productImages', image.filename);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            });
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

module.exports = router;
