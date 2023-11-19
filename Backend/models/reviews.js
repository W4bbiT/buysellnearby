//reviewModel
const mongoose = require('mongoose');
const ReviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    rating: {
        type: Number,
        required: true,
    },
    review: {
        type: String,
        required: true,
    },
    reviewDate: {
        type: Date,
        required: true,
        default: Date.now()
    }
}, { versionKey: false });

const Review = mongoose.model('Review', ReviewSchema);
module.exports = Review;
