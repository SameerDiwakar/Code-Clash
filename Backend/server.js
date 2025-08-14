const express = require('express')
const appRoute = require('./routes/route')
const app = express()
const port = 4000
const cors = require('cors')
const cookieParser = require('cookie-parser')
const mongoose = require("mongoose");
require("dotenv").config();


// MongoDB Connection
// Enable autoIndex during development to ensure indexes are created
if (process.env.NODE_ENV !== 'production') {
  mongoose.set('autoIndex', true);
}
mongoose.connect(process.env.MONGO_URL)
.then(async () => {
    console.log('Connected to MongoDB successfully');
    try {
      // Ensure indexes for battle collection are in place (unique normalizedTitle, etc.)
      const Battle = require('./models/battle');
      // 1) Backfill normalizedTitle for legacy documents
      try {
        const backfill = await Battle.updateMany(
          { normalizedTitle: { $exists: false } },
          [ { $set: { normalizedTitle: { $toLower: '$title' } } } ]
        );
        if (backfill?.modifiedCount) {
          console.log(`Backfilled normalizedTitle for ${backfill.modifiedCount} battle(s).`);
        }
      } catch (bfErr) {
        console.warn('Backfill normalizedTitle failed (non-fatal):', bfErr?.message || bfErr);
      }

      // 2) Detect duplicates by case-insensitive title before creating unique index
      const dups = await Battle.aggregate([
        { $project: { norm: { $toLower: '$title' } } },
        { $group: { _id: '$norm', count: { $sum: 1 } } },
        { $match: { count: { $gt: 1 } } }
      ]);
      if (Array.isArray(dups) && dups.length) {
        console.warn('Duplicate battle titles detected (case-insensitive). Please resolve before uniqueness can be enforced:');
        dups.slice(0, 10).forEach(d => console.warn(` - "${d._id}" has ${d.count} duplicates`));
        if (dups.length > 10) console.warn(`...and ${dups.length - 10} more`);
        console.warn('Unique index on normalizedTitle will be skipped until duplicates are resolved.');
      } else {
        await Battle.syncIndexes();
        console.log('Battle indexes synchronized');
      }
    } catch (e) {
      console.error('Failed to sync battle indexes:', e?.message || e);
    }
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
app.use('/api', appRoute)

// Start server and initialize scheduler
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
})

