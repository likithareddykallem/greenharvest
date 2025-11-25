// backend/src/config/database.js
const mongoose = require('mongoose');
const config = require('./env');

async function connectDB() {
  const uri = config.mongo.uri;
  try {
    console.log(`🔄 Connecting to MongoDB at ${uri} ...`);
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // no longer need useCreateIndex/useFindAndModify in modern mongoose
    });
    console.log('✅ MongoDB connected:', mongoose.connection.host);
  } catch (err) {
    console.error('🔥 MongoDB connection error:', err);
    throw err;
  }
}

module.exports = connectDB;