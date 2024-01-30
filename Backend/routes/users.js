//userRoute.js
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
require('dotenv').config();

const express = require('express');
const router = express.Router();
const User = require('../models/users');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const Product = require('../models/products');

const sharp = require('sharp');
const fs = require('fs');
const path = require('path')
const multer = require('multer');

const bName = process.env.BUCKET_NAME
const bRegion = process.env.BUCKET_REGION
const bAccessKey = process.env.BUCKET_ACCESS_KEY
const bSecret = process.env.BUCKET_SECRET_ACCESS_KEY

const s3 = new S3Client({
  credentials: {
    accessKeyId: bAccessKey,
    secretAccessKey: bSecret,
  },
  region: bRegion,
})

const storage = multer.memoryStorage();

const filter = (req, file, callback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new Error('Only JPEG, PNG, and JPG images are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter: filter
});

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
};

router.use(express.urlencoded({ extended: true }));
router.use(express.json());
router.use(passport.initialize());
router.use(errorHandler);
// Getting the user info

async function getGeolocation(address) {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
    const data = await response.json();
    if (data && Array.isArray(data) && data.length > 0) {
      const firstResult = data[0];
      return {
        latitude: parseFloat(firstResult.lat),
        longitude: parseFloat(firstResult.lon),
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching geolocation data:', error);
    return null;
  }
}

router.get('/profile', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Creating one
router.post('/signup', async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const emailExist = await User.findOne({ email: req.body.email });
    if (emailExist) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    const user = new User({
      fName: req.body.fName,
      lName: req.body.lName,
      email: req.body.email,
      phone: req.body.phone,
      password: hashedPassword,
      createDate: Date.now(),
      address: {
        city: req.body.city,
        zipcode: req.body.zipcode,
        country: req.body.country
      }
    });
    const addressString = `${req.body.zipcode}, ${req.body.country}`;
    const geoData = await getGeolocation(addressString);
    if (geoData) {
      // Update the location field properly
      user.address.location = {
        type: 'Point',
        coordinates: [geoData.longitude, geoData.latitude],
      };
    } else {
      return res.status(400).json({ message: 'Invalid coordinates from geolocation data' });
    }
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Login
router.post('/signin', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    const payload = {
      _id: user._id,
      email: user.email,
      role: user.role
    };
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: 24 * 60 * 60, // 1 day in seconds
    });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET);
    res.status(200).json({
      accessToken: "Bearer " + accessToken,
      refreshToken: refreshToken,
      username: user.fName,
      role: user.role,
      expiresIn: 24 * 60 * 60 // 1 day in seconds
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});


// Updating one
router.patch('/update-user', upload.single('profileImage'), passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    if (req.body.fName) {
      req.user.fName = req.body.fName;
    }
    if (req.body.lName) {
      req.user.lName = req.body.lName;
    }
    if (req.body.dob) {
      req.user.dob = req.body.dob;
    }
    if (req.body.city) {
      req.user.address.city = req.body.city;
    }
    if (req.body.zipcode) {
      req.user.address.zipcode = req.body.zipcode;
    }
    if (req.body.country) {
      req.user.address.country = req.body.country;
    }
    // Update user's location (longitude and latitude) based on the provided address
    const addressString = `${req.user.address.zipcode}, ${req.user.address.country}`;
    const geoData = await getGeolocation(addressString);
    if (geoData) {
      // Update the location field properly
      req.user.address.location = {
        type: 'Point',
        coordinates: [geoData.longitude, geoData.latitude],
      };
    } else {
      return res.status(400).json({ message: 'Invalid coordinates from geolocation data' });
    }
    if (req.body.phone) {
      req.user.phone = req.body.phone;
    }
    if (req.body.email) {
      req.user.email = req.body.email;
      const emailExist = await User.findOne({ email: req.body.email });
      if (emailExist) {
        return res.send('Email already exists');
      }
    }
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      req.user.password = hashedPassword;
    }
    const directory = './uploads/profileImage';
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
    if (req.file) {
      const optimizedImageBuffer = await sharp(req.file.buffer)
        .resize(300, 300) 
        .toBuffer();
      const s3Params = {
        Bucket: bName,
        Key: `profileImages/${req.user._id}.${req.file.mimetype.split('/')[1]}`,
        Body: optimizedImageBuffer,
        ContentType: req.file.mimetype,
      };
      const command = new PutObjectCommand(s3Params)
      const uploadResult = await s3.send(command);
      if (uploadResult) {
        req.user.profileImage = `https://${bName}.s3.${bRegion}.amazonaws.com/profileImages/${req.user._id}.${req.file.mimetype.split('/')[1]}`;
      } else {
        return res.status(500).json({ message: 'Failed to upload optimized image to S3' });
      }
    }
    const updatedUser = await req.user.save();
    console.log(updatedUser);
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({
      message: err.message
    });
  }
});

router.get('/nearby', passport.authenticate('jwt', { session: false }), async (req, res) => {
  // nearby?radius=50 for a 50 km radius.
  const { coordinates } = req.user.address.location;
  const radius = parseInt(req.query.radius) || 100; // Default radius is 100 kilometers
  if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
    return res.status(400).json({ message: 'Invalid user coordinates' });
  }
  const filter = req.query.filter || '';
  const minPrice = parseFloat(req.query.minPrice) || 0;
  const sort = req.query.sort || '-createdOn'; // Default sorting by descending creation date
  const maxPrice = parseFloat(req.query.maxPrice) || Number.MAX_SAFE_INTEGER;
  const excludeLoggedInUser = req.query.excludeLoggedInUser === 'true';
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  try {
    let nearbySellers;
    if (excludeLoggedInUser) {
      nearbySellers = await User.find({
        _id: { $ne: req.user._id }, // Exclude the logged-in user
        'address.location': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: coordinates,
            },
            $maxDistance: radius * 1000, // Convert radius to meters
          },
        },
      }).select('_id');
    } else {
      nearbySellers = await User.find({
        'address.location': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: coordinates,
            },
            $maxDistance: radius * 1000, // Convert radius to meters
          },
        },
      }).select('_id');
    }
    if (nearbySellers.length === 0) {
      return res.json({ message: 'No nearby sellers found' });
    }
    const sellerIds = nearbySellers.map(seller => seller._id);
    // Find products from nearby sellers with additional filters, pagination, and limit
    const nearbyProducts = await Product.find({
      owner: { $in: sellerIds },
      $or: [
        { productName: { $regex: filter, $options: 'i' } },
        { category: { $regex: filter, $options: 'i' } },
      ],
      price: { $gte: minPrice, $lte: maxPrice },
    })
      .populate('owner', 'fName')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);
    if (nearbyProducts.length === 0) {
      return res.json({ message: 'No products found from nearby sellers' });
    }
    res.json(nearbyProducts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Refresh Access Token
router.post('/refresh-token', async (req, res) => {
  try {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token is required' });
    }
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid refresh token' });
      }
      const payload = {
        _id: user._id,
        email: user.email,
        role: user.role
      };
      const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: 24 * 60 * 60, // 1 day in seconds
      });
      res.status(200).json({
        accessToken: "Bearer " + accessToken,
        expiresIn: 24 * 60 * 60 // 1 day in seconds
      });
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
