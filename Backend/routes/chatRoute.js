//chatRoute.js
const express = require('express');
const router = express.Router();
const passport = require('passport');
const ChatMessage = require('../models/chatMessage');
// const Product = require('../models/products');
// const User = require('../models/users');

router.use(express.json());
router.use(passport.initialize());

// Create a new chat message
// router.post('/send', passport.authenticate('jwt', { session: false }), async (req, res) => {
//   try {
//     const { receiverId, productId, message } = req.body;
//     const senderId = req.user._id;
//     // Check if the sender is the owner of the product
//     const product = await Product.findOne({ _id: productId, owner: senderId });
//     if (!product) {
//       return res.status(403).json({ message: 'You do not have permission to send messages for this product.' });
//     }
//     // Save the chat message
//     const chatMessage = new ChatMessage({
//       sender: senderId,
//       receiver: receiverId,
//       product: productId,
//       message: message,
//     });
//     const savedMessage = await chatMessage.save();
//     io.emit('chat', savedMessage);
//     res.status(201).json(savedMessage);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// Get all chat messages for the logged-in user
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const userId = req.user._id;
    const chatMessages = await ChatMessage.aggregate([
      {
        $match: {
          $or: [
            { sender: userId },
            { receiver: userId },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          sender: 1,
          receiver: 1,
          message: 1,
          timestamp: 1,
          // Add a new field 'partner' with the ID of the other participant (sender or receiver)
          partner: {
            $cond: {
              if: { $eq: ['$sender', userId] },
              then: '$receiver',
              else: '$sender',
            },
          },
        },
      },
      {
        $group: {
          _id: '$partner',
          messages: {
            $push: {
              _id: '$_id',
              sender: '$sender',
              receiver: '$receiver',
              message: '$message',
              timestamp: '$timestamp',
            },
          },
        },
      },
    ]);
    res.json(chatMessages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get chat messages for a product
// router.get('/product/:productId', passport.authenticate('jwt', { session: false }), async (req, res) => {
//   try {
//     const productId = req.params.productId;
//     const userId = req.user._id;
//     // Check if the user is the owner of the product or the sender/receiver in any chat message
//     const product = await Product.findOne({ _id: productId, owner: userId });
//     if (!product) {
//       return res.status(403).json({ message: 'You do not have permission to view messages for this product.' });
//     }
//     const chatMessages = await ChatMessage.find({
//       $or: [
//         { product: productId, sender: userId },
//         { product: productId, receiver: userId },
//       ],
//     });
//     res.json(chatMessages);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

module.exports = router;
