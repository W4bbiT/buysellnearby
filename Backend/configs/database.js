const mongoose = require('mongoose');

require('dotenv').config();

/**
 * -------------- DATABASE ----------------
 */

/**
 * Connect to MongoDB Server using the connection string in the `.env` file.  To implement this, place the following
 * string into the `.env` file
 * 
 * DB_STRING=mongodb://<user>:<password>@localhost:27017/database_name
 * DB_STRING_PROD=<your production database string>
 */

const devConnection = process.env.DB_STRING;
const prodConnection = process.env.DB_STRING_PROD;

// Connect to the correct environment database
if (process.env.NODE_ENV === 'production') {
    mongoose.connect(prodConnection,
        {
            //autoIndex: false, // Don't build indexes
            //maxPoolSize: 10, // Maintain up to 10 socket connections
           // serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
            //socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            family: 4 // Use IPv4, skip trying IPv6
        }
    )
        .then((res) => {
            console.log("AWS Database connected");
        }).catch(error => {
            console.log(error);
        });
} else {
    mongoose.connect(devConnection)
        .then((res) => {
            console.log("Database connected");
        }).catch(error => {
            console.log(error);
        });
}
