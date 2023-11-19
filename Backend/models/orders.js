const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderDetails: {
        products: [{
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true,
            }
        }],
        total: {
            type: Number,
            required: true,
        }
    },
    orderDate: {
        type: Date,
        required: true,
        default: Date.now()
    },
    verified: {
        type: Boolean,
        default: false
    },
    trackingInfo: {
        type: String,
        default: "Order Placed"
    }


}, { versionKey: false });

module.exports = mongoose.model('Order', orderSchema);
