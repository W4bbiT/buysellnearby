//these are admin specific
require('dotenv').config()
require('./passport')
const express = require('express')
const router = express.Router()
const Product = require('../models/products')
const passport = require('passport')

router.use(express.urlencoded({ extended: true }));
router.use(express.json());
router.use(passport.initialize())

const admin = process.env.ADMIN_KEY


// Get all users with pagination
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        if (req.user.role !== admin) {
            res.json({ message: 'You are not authorized to access this page!' });
        } else {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            const users = await User.find()
                .skip((page - 1) * limit)
                .limit(limit);

            res.json(users);
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Route to delete a user
router.delete('/deleteuser/:userId', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        // Check if the user is an admin
        if (req.user.role !== admin) {
            return res.status(403).json({ message: 'You are not authorized to access this page!' });
        }
        // Find the user by ID
        const userToDelete = await User.findById(req.params.userId);
        if (!userToDelete) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Prevent deletion of admin users
        if (userToDelete.role === admin) {
            return res.status(400).json({ message: 'Cannot delete admin user' });
        }
        // Delete the user
        await userToDelete.remove();
        return res.json({ message: 'User deleted successfully' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

// Route to block a user
router.put('/blockuser/:userId', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        // Check if the user is an admin
        if (req.user.role !== admin) {
            return res.status(403).json({ message: 'You are not authorized to access this page!' });
        }
        // Find the user by ID
        const userToBlock = await User.findById(req.params.userId);
        if (!userToBlock) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Prevent blocking of admin users
        if (userToBlock.role === admin) {
            return res.status(400).json({ message: 'Cannot block admin user' });
        }
        // Update the user's status to blocked
        userToBlock.blocked = true;
        await userToBlock.save();
        return res.json({ message: 'User blocked successfully' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});


// Route to delete a product
router.delete('/deleteproduct/:id', passport.authenticate('jwt', { session: false }), getProduct, async (req, res) => {
    try {
        if (req.user.role !== admin) {
            return res.status(403).json({ message: 'You are not authorized to access this page!' });
        }
        await res.product.remove();
        return res.json({ message: 'Product deleted!' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

async function getProduct(req, res, next) {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Couldn\'t find product' });
        }
        res.product = product;
        next();
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports = router