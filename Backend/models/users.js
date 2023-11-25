const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    fName: String,
    lName: String,
    dob: Date,
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    profileImage: {
        type: String,
    },
    role: {
        type: String,
        default: "Customer"
    },
    phone: String,
    address: {
        streetAddress: String,
        city: String,
        state: String,
        zipcode: String
    },
    products: [
        {
            productId: {
                type : mongoose.Schema.Types.ObjectId,
                ref: 'Product'
            }
        }
    ],
    createdOn: {
        type: Date,
        default: Date.now
      },

}, { versionKey: false })

module.exports = mongoose.model('User', UserSchema)