require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors');
const passport = require('passport');

require('./configs/database');
require('./models/users');

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

const AdminRoute = require('./routes/admin')
app.use('/api/admin', AdminRoute)

const usersRouter = require('./routes/users')
app.use('/api/user', usersRouter)

const productsRouter = require('./routes/products')
app.use('/api/product', productsRouter)

const cartRouter = require('./routes/cart')
app.use('/api/user', cartRouter)

const orderRouter = require('./routes/orders')
app.use('/api/user', orderRouter)

const reviewRouter = require('./routes/review')
app.use('/api/user/review', reviewRouter)

app.listen(process.env.PORT, () => console.log('server started'))