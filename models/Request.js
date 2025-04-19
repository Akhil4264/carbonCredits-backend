const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employerName: {
    type: String,
    required: true
  },
  mode: {
    type: String,
    enum: ['car', 'bus', 'bike'],
    required: true
  },
  points: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  distance: {
    type: Number,
    required: true
  },
  // Primary location (optional - use endLocation for consistency)
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  // NEW: Start location (geoJSON)
  startLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  // NEW: End location (geoJSON)
  endLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Geospatial indexes
requestSchema.index({ location: '2dsphere' });
requestSchema.index({ startLocation: '2dsphere' });
requestSchema.index({ endLocation: '2dsphere' });

module.exports = mongoose.model('Request', requestSchema);
