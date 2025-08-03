const express = require('express')
const appRoute = require('./routes/route')
const app = express()
const port = 4000
const cors = require('cors')
const cookieParser = require('cookie-parser')
const mongoose = require("mongoose");
require("dotenv").config();


// MongoDB Connection
mongoose.connect(process.env.MONGO_URL)
.then(() => {
    console.log('Connected to MongoDB successfully');
})
.catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:8080",
     "http://localhost:3000"
    ];
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Serve static files for uploaded images
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/', appRoute)

// Start server and initialize scheduler
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
})

