// models/WalletTransaction.js
const mongoose = require('mongoose');

const WalletTransactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['buy', 'sell'], required: true },
    points: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WalletTransaction', WalletTransactionSchema);
