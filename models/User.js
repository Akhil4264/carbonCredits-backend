const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, sparse: true },
  fullName: String,
  email: { type: String, unique: true },
  password: String, // Optional for OAuth users
  role: { type: String, enum: ['employee', 'employer'], default: 'employee' },
  employerName: String,
  points: { type: Number, default: 0 },
  homeLocation: {
    lat: Number,
    lng: Number
  },
  officeLocation: {
    lat: Number,
    lng: Number
  }
  
});

module.exports = mongoose.model('User', userSchema);
