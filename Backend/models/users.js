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
    profileImage: String,
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
    createDate: Date

}, { versionKey: false })

module.exports = mongoose.model('User', UserSchema)