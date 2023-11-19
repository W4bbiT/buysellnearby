// reviewRoutes.js
require('./passport')

const express = require('express');
const router = express.Router();
const Review = require('../models/reviews');
const Product = require('../models/products');
const Order = require('../models/orders');
const passport = require('passport')
const { validationResult } = require('express-validator');


router.use(express.urlencoded({ extended: true }));
router.use(express.json());
router.use(passport.initialize())

router.get('/get-top-reviews', async (req, res) => { 
    try{
        const reviews = await Review.find({
            rating: { $gt: 4.9 } // Using the $gt operator to find reviews with rating greater than 5
        });
        res.json(reviews);
    }catch (err){
        res.status(500).json({ message: err.message });
    }
})

// reviews post
router.post('/add-review/:pId', passport.authenticate('jwt', { session: false }), getProduct, async (req, res) => {
    try {
        const productId = res.product;
        const userId = req.user._id;
        const { rating, review } = req.body;
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        const orderedProduct = await Order.findOne({
            userId,
            'orderDetails.products.product': productId
        });
        if (!orderedProduct) {
            return res.status(400).json({ message: 'You have not ordered this product' });
        }
        const existingReview = await Review.findOne({
            user: userId,
            product: productId
        });
        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this product' });
        }

        // Create the new review object
        const newReview = new Review({
            user: userId,
            product: productId,
            rating: rating,
            review: review,
            reviewDate: Date.now()
        });

        // Save the new review
        await newReview.save();

        // Add the new review to the product's reviews array
        product.reviews.push(newReview);

        // Save the updated product
        await product.save();

        res.status(201).json({ message: 'Review added successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Edit review by review ID
router.put('/edit-review/:reviewId', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { rating, review } = req.body;
        const reviewId = req.params.reviewId;
        const userId = req.user._id;
        // Find the review by ID and user ID
        const existingReview = await Review.findOne({
            _id: reviewId,
            user: userId
        });
        if (!existingReview) {
            return res.status(404).json({ message: 'Review not found' });
        }
        // Update the review properties
        existingReview.rating = rating;
        existingReview.review = review;
        // Save the updated review
        await existingReview.save();
        res.status(200).json({ message: 'Review updated successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// getProduct middleware
async function getProduct(req, res, next) {
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
        res.product = product;
        next();
    } catch (err) {
        next(err);
    }
}

module.exports = router;
