require('./passport');
const express = require('express');
const router = express.Router();
const Cart = require('../models/cart');
const Product = require('../models/products');
const passport = require('passport');

router.use(express.urlencoded({ extended: true }));
router.use(express.json());
router.use(passport.initialize());

// Get all items in the cart
router.get('/cart', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const cart = await Cart.findOne({ userId: req.user._id })
            .populate({
                path: 'products.productId',
                options: {
                    skip: (page - 1) * limit,
                    limit: limit
                }
            })
            .exec();

        res.json(cart);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a product to the cart
router.post('/addtocart/:pId', passport.authenticate('jwt', { session: false }), getItem, async (req, res) => {
    const userId = req.user._id;
    const quantity = 1;
    try {
        const cart = await Cart.findOne({ userId });
        const item = res.item;
        if (!item) {
            return res.status(404).send({ message: 'Item not found' });
        }
        const productId = item;
        const price = item.price;
        const discount = item.discount;
        const inStock = item.inStock;
        if (inStock < quantity) {
            return res.status(400).send({ message: 'Insufficient stock' });
        }
        if (cart) {
            const itemIndex = cart.products.findIndex((p) => {
                return p.productId._id.toString() === productId._id.toString();
            });

            if (itemIndex > -1) {
                let product = cart.products[itemIndex];
                const newQuantity = product.quantity + quantity;

                if (inStock < newQuantity) {
                    return res.status(400).send({ message: 'Insufficient stock' });
                }

                product.quantity = newQuantity;
                cart.products[itemIndex] = product;
            } else {
                cart.products.push({ productId, quantity, price, discount });
            }

            cart.total = calculateCartTotal(cart.products);

            await cart.save();
            res.status(200).send(cart);
        } else {
            if (inStock < quantity) {
                return res.status(400).send({ message: 'Insufficient stock' });
            }

            const total = calculateTotal(quantity, price, discount);
            const newCart = await Cart.create({
                userId,
                products: [{ productId, discount, quantity, price }],
                total: parseFloat(total),
            });
            res.status(201).send(newCart);
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Something went wrong');
    }
});

// Update a product in the cart
router.patch('/editcart/:pId', passport.authenticate('jwt', { session: false }), getItem, async (req, res) => {
    const userId = req.user._id;

    try {
        const cart = await Cart.findOne({ userId });
        const item = res.item;
        if (!item) {
            return res.status(404).send({ message: 'Item not found' });
        }
        const productId = item;
        const inStock = item.inStock;
        if (!cart) {
            return res.status(404).send({ message: 'Cart not found' });
        }
        const itemIndex = cart.products.findIndex((p) => {
            return p.productId._id.toString() === productId._id.toString();
        });
        if (itemIndex > -1) {
            let product = cart.products[itemIndex];
            const newQuantity = req.body.products[itemIndex].quantity;
            if (inStock < newQuantity) {
                return res.status(400).send({ message: 'Insufficient stock' });
            }

            product.quantity = newQuantity;
            cart.products[itemIndex] = product;
            cart.total = calculateCartTotal(cart.products);

            await cart.save();
            res.status(200).send(cart);
        } else {
            res.status(404).send({ message: 'Product not found in cart' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Something went wrong');
    }
});

// Delete a product from the cart
router.delete('/delete-item/:pId', passport.authenticate('jwt', { session: false }), getItem, async (req, res) => {
    const userId = req.user._id;
    const productId = res.item ? res.item._id : null;

    try {
        let cart = await Cart.findOne({ userId });
        let itemIndex = -1;

        if (productId) {
            itemIndex = cart.products.findIndex((p) => {
                return p.productId._id.toString() === productId.toString();
            });
        }

        if (itemIndex > -1) {
            let item = cart.products[itemIndex];
            cart.total -= calculateItemTotal(item);

            if (cart.total < 0) {
                cart.total = 0;
            }

            cart.products.splice(itemIndex, 1);
        }

        cart.total = calculateCartTotal(cart.products);

        cart = await cart.save();
        res.status(200).send(cart);
    } catch (error) {
        console.log(error);
        res.status(400).send();
    }
});

// Empty the cart
router.delete('/empty-cart', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const userId = req.user._id;

    try {
        let cart = await Cart.findOne({ userId });

        if (cart) {
            cart.products = [];
            cart.total = 0;
            cart = await cart.save();
            res.status(200).send(cart);
        } else {
            res.status(404).send('Cart not found');
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Something went wrong');
    }
});


async function getItem(req, res, next) {
    let item;
    try {
        item = await Product.findById(req.params.pId);
        if (item == null) {
            return res.status(404).json({ message: "Couldn't find Product" });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
    res.item = item;
    next();
}

function calculateTotal(quantity, price, discount) {
    const discountedPrice = price - (discount / 100) * price;
    const total = quantity * discountedPrice;
    return total.toFixed(2);
}

function calculateItemTotal(item) {
    const price = item.price;
    const discount = item.discount;
    const quantity = item.quantity;
    const discountedPrice = price - (discount / 100) * price;
    const itemTotal = quantity * discountedPrice;
    return itemTotal;
}

function calculateCartTotal(products) {
    const cartTotal = products.reduce((acc, curr) => {
        const itemTotal = calculateItemTotal(curr);
        return acc + itemTotal;
    }, 0);
    return cartTotal.toFixed(2);
}

module.exports = router;
