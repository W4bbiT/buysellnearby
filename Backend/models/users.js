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
        default: "No Image"
    },
    role: {
        type: String,
        default: "Customer"
    },
    phone: String,
    address: {
        city: String,
        zipcode: String,
        country: String,
        location: {
            type: { type: String, default: 'Point' },
            coordinates: [Number], // Longitude (1st), Latitude (2nd)
        },
    },
    blocked: {
        type: Boolean,
        default: false,
    },
    createdOn: {
        type: Date,
        default: Date.now
      },

}, { versionKey: false })

UserSchema.index({ 'address.location': '2dsphere' });

module.exports = mongoose.model('User', UserSchema)