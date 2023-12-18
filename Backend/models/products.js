//Product Model

const mongoose = require('mongoose');
const ProductSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  productName: {
      type: String,
      index:true,
  },
  category: {
    type: [String],
  },
  price: {
    type: Number,
  },
  discount:  {
    type: Number,
  },
  description: {
    type: String,
  },
  productImages: [
    {
      filename: {
        type: String,
        required: true,
      },
    }
  ],
  createdOn: {
    type: Date,
    default: Date.now
  },
  inStock: {
    type: Number,
  },
  featureProduct: {
    type: Boolean,
    default: false
  },
  details: {
    size: String,
    color: String,
    info: String,
  }
  
}, { versionKey: false });

module.exports = mongoose.model('Product', ProductSchema)