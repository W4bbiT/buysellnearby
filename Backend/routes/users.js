require('dotenv').config();

const express = require('express');
const router = express.Router();
const User = require('../models/users');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');

const sharp = require('sharp');
const fs = require('fs');
const path = require('path')
const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    const uploadPath = './uploads/profileImage/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    callback(null, uploadPath);
  },
  filename: function (req, file, callback) {
    console.log(file)
    const fileName = file.originalname;
    callback(null, fileName);
  }
});
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, callback) {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedMimes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error('Invalid file type. Only JPEG and PNG are allowed.'));
    }
  },
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
router.get('/profile', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Creating one
router.post('/signup', upload.single('profileImage'), async (req, res) => {
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
      profileImage: req.file.path,
      email: req.body.email,
      password: hashedPassword,
      createDate: Date.now(),
      address: {
        streetAddress: "N/A",
        city: "N/A",
        state: "N/A",
        zipcode: "N/A",
      }
    });

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

    const passwordMatch = await bcrypt.compare(req.body.password, user.password);

    if (passwordMatch) {
      const payload = {
        _id: user._id,
        email: user.email,
        role: user.role
      };

      const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: 24 * 60 * 60, // 1 day in seconds
      });

      console.log("Bearer " + accessToken);

      res.status(200).json({
        accessToken: "Bearer " + accessToken,
        username: user.fName,
        role: user.role,
        expiresIn: 24 * 60 * 60 // 1 day in seconds
      });
    } else {
      res.send('Please sign in!');
    }
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
    if (req.body.address) {
      if (req.body.address.streetAddress) {
        req.user.address.streetAddress = req.body.address.streetAddress;
      }
      if (req.body.address.city) {
        req.user.address.city = req.body.address.city;
      }
      if (req.body.address.state) {
        req.user.address.state = req.body.address.state;
      }
      if (req.body.address.zipcode) {
        req.user.address.zipcode = req.body.address.zipcode;
      }
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
    if (req.file) {
      console.log(req.file);
      console.log(req.file.path);

      req.user.profileImage = req.file.path;
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

module.exports = router;
