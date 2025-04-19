// server/models/Trip.js
const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  start: String,
  end: String,
  distance: String,
  date: Date,
});

module.exports = mongoose.model('Trip', tripSchema);
