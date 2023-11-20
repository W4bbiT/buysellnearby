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

const admin = "STAR"


//Gettign all users 
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        if (req.user.role != admin) {
            res.send("You don't have admin acces!")
        } else {
            res.send("You are admin!")
        }
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// Get all users with pagination
router.get('/gau', passport.authenticate('jwt', { session: false }), async (req, res) => {
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

//deleting one
router.delete('/du', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        if (req.user.role != admin) {
            res.send.json({ message: 'you are not authorized to access this page!' })
        } else {
            await req.user.remove()
            res.json({ message: 'User deleted!' })
        }
    }
    catch (err) {
        res.status(500).json({ message: err.message })
    }
})

//creating a product listing
router.post('/ap', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const product = new Product({
        productName: req.body.productName,
        category: req.body.category,
        price: req.body.price,
        inStock: req.body.inStock,
        description: req.body.description,
        discount: req.body.discount,
        productImage: req.body.productImage,
        createdOn: Date.now(),
        details: req.body.details,
        featureProduct: req.body.featureProduct
    })
    try {
        if (req.user.role != admin) {

            res.send.json({ message: 'you are not authorized to access this page!' })
        } else {
            const newProduct = await product.save()
            res.status(201).json(newProduct)
        }
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

//updating a product
router.patch('/up/:id', passport.authenticate('jwt', { session: false }), getProduct, async (req, res) => {
    if (req.body.productName != null) {
        res.product.productName = req.body.productName
    }
    if (req.body.category != null) {
        res.product.category = req.body.category
    }
    if (req.body.price != null) {
        res.product.price = req.body.price
    }
    if (req.body.discount != null) {
        res.product.discount = req.body.discount
    }
    if (req.body.description != null) {
        res.product.description = req.body.description
    }
    if (req.body.inStock != null) {
        res.product.inStock = req.body.inStock
    }
    if (req.body.productImage != null) {
        res.product.productImage = req.body.productImage
    }
    if (req.body.featureProduct != null) {
        res.product.featureProduct = req.body.featureProduct
    }
    if (req.body.details != null) {
        res.product.details = req.body.details
    }
    try {
        if (req.user.role != admin) {
            res.send.json({ message: 'you are not authorized to access this page!' })
        } else {
            const updatedProduct = await res.product.save()
            res.json(updatedProduct)
        }
    } catch (err) {
        res.status(400).json({
            message: err.message
        })
    }
})

//deleting a product
router.delete('/dp/:id', passport.authenticate('jwt', { session: false }), getProduct, async (req, res) => {
    try {
        if (req.user.role != admin) {
            res.send.json({ message: 'you are not authorized to access this page!' })
        } else {
            await res.product.remove()
            res.json({ message: 'Product deleted!' })
        }
    }
    catch (err) {
        res.status(500).json({ message: err.message })
    }

})

async function getProduct(req, res, next) {
    let product
    try {
        product = await Product.findById(req.params.id)
        if (product == null) {
            return res.status(404).json({ message: 'Couldn\'t find product' })
        }
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
    res.product = product

    next()
}


module.exports = router