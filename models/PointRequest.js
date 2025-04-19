const mongoose = require('mongoose');

const pointRequestSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  option: { type: String, enum: ['car', 'remote working', 'other'], required: true },
  points: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'approved', 'dismissed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PointRequest', pointRequestSchema);
