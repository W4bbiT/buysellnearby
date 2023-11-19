// productRoutes.js
const express = require('express');
const mongoose = require('mongoose'); // Import the mongoose module
const router = express.Router();
const Product = require('../models/products');
const Review = require('../models/reviews'); // Import the Review model
const { validationResult } = require('express-validator');

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

// Get top products
router.get('/top-products', async (req, res) => {
    try {
        const topRatedProducts = await Product.aggregate([
            {
                $lookup: {
                    from: 'reviews',
                    localField: 'reviews',
                    foreignField: '_id',
                    as: 'reviewDetails'
                }
            },
            {
                $unwind: '$reviewDetails' // Unwind the reviewDetails array
            },
            {
                $group: {
                    _id: '$_id',
                    productName: { $first: '$productName' },
                    category: { $first: '$category' },
                    price: { $first: '$price' },
                    discount: { $first: '$discount' },
                    description: { $first: '$description' },
                    productImage: { $first: '$productImage' },
                    createdOn: { $first: '$createdOn' },
                    inStock: { $first: '$inStock' },
                    featureProduct: { $first: '$featureProduct' },
                    details: { $first: '$details' },
                    averageRating: {
                        $avg: '$reviewDetails.rating' // Calculate the average rating
                    }
                }
            },
            {
                $match: {
                    averageRating: { $gte: 4.0 }
                }
            },
            {
                $limit: 10
            }
        ]);
        res.json(topRatedProducts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get featured products
router.get('/featured-products', async (req, res) => {
    try {
        const featuredProducts = await Product.find({ featureProduct: true })
            .limit(10); // Adjust the limit as per your requirement
        res.json(featuredProducts);
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


// getProductReviews middleware with limit, pagination, and average rating calculation
async function getProductReviews(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const productId = req.params.pId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        const reviewsQuery = Review.find({ product: productId })
            .populate({
                path: 'user',
                select: 'profileImage fName address.state',
            })
            .skip((page - 1) * limit)
            .limit(limit);
        const reviewsCountQuery = Review.countDocuments({ product: productId });
        const averageQuery = Review.aggregate([
            {
                $match: { product: mongoose.Types.ObjectId(productId) }
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" }
                }
            }
        ]);
        const [reviews, totalCount, averageRating] = await Promise.all([
            reviewsQuery.exec(),
            reviewsCountQuery.exec(),
            averageQuery.exec()
        ]);
        // Check if reviews exist and have at least one element
        if (!reviews || reviews.length === 0) {
            return res.status(404).json({ message: 'No reviews found' });
        }
        // Calculate the customers count
        const customersCount = reviews.reduce((count, review) => {
            if (!count.includes(review.user.toString())) {
                count.push(review.user.toString());
            }
            return count;
        }, []).length;
        const formattedAverageRating = averageRating[0] ? parseFloat(averageRating[0].averageRating.toFixed(2)) : 0.00;
        const totalPages = Math.ceil(totalCount / limit);
        res.json({
            reviews,
            totalCount,
            totalPages,
            averageRating: formattedAverageRating,
            customersCount // Include the customers count in the response
        });
    } catch (err) {
        next(err);
    }
}

module.exports = router;
