require('dotenv').config()
require('./configs/database');
const User = require('./models/users');
const ChatMessage = require('./models/chatMessage');

const express = require('express')
const app = express()
const cors = require('cors');
const passport = require('passport');
const http = require('http');
const socketIo = require('socket.io');

app.use(passport.initialize());
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, HEAD, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "http://localhost:8100" },
});

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth;
    console.log('Token:', token);
    const authenticatePromise = () => {
      return new Promise((resolve, reject) => {
        passport.authenticate('jwt', { session: false }, async (err, user) => {
          if (err) {
            console.error('Authentication error:', err);
            reject('Authentication error');
            return;
          }
          if (!user) {
            console.error('User not found');
            reject('User not found');
            return;
          }
          try {
            socket.user = await User.findById(user._id);
            console.log('User authenticated:', socket.user._id);
            resolve();
          } catch (err) {
            reject(err);
          }
        })(socket.handshake, {}, (err) => {
          if (err) {
            console.error('Error during Passport authenticate:', err);
            reject('Error during Passport authenticate');
          }
        });
      });
    };
    await authenticatePromise();
    next();
  } catch (error) {
    console.error('Error during authentication:', error);
    return next(new Error('Authentication error'));
  }
});

// Socket.IO connection event
const connectedSockets = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.user ? socket.user._id : 'Not authenticated');
  // Store the socket in the Map when a user connects
  if (socket.user) {
    connectedSockets.set(socket.user._id.toString(), socket);
  }
  // Handle chat messages
  socket.on('sendMessage', async (data) => {
    try {
      // Access the sender using socket.user
      const sender = socket.user;
      console.log('Sender:', sender);
      // Access the recipient using data.recipient
      const recipient = await User.findById(data.recipient);
      console.log('Recipient:', recipient);
      // Get the recipient socket from the Map
      const recipientSocket = connectedSockets.get(recipient._id.toString());
      if (!recipientSocket) {
        console.error('Recipient not found');
        throw new Error('Recipient not found');
      }
      // Create a new ChatMessage instance
      const newMessage = new ChatMessage({
        sender: sender._id,
        receiver: recipient._id,
        message: data.message,
      });
      console.log('New message:', newMessage);
      // Save the message to the database
      await newMessage.save();
      // Emit events to the sender and recipient sockets
      io.to(socket.id).emit('messageSent', { message: 'Your message was sent successfully!' });
      io.to(recipientSocket.id).emit('newMessage', { message: newMessage });
    } catch (error) {
      console.error('Error sending message:', error.message);
      io.to(socket.id).emit('messageError', { error: 'Error sending message' });
    }
  });
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.user ? socket.user._id : 'Not authenticated');
    
    // Remove the socket from the Map when a user disconnects
    if (socket.user) {
      connectedSockets.delete(socket.user._id.toString());
    }
  });
});

//routes
const AdminRoute = require('./routes/admin')
app.use('/api/admin', AdminRoute)

const usersRouter = require('./routes/users')
app.use('/api/user', usersRouter)

const productsRouter = require('./routes/products')
app.use('/api/product', productsRouter)

const chatRouter = require('./routes/chatRoute')
app.use('/api/chat', chatRouter)

// Serve files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

server.listen(process.env.PORT, () => console.log('server started'))