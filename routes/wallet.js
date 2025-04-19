// routes/wallet.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const WalletTransaction = require('../models/WalletTransaction');
const auth = require('../middleware/auth'); // must attach user to req.user

// POST /api/wallet
router.post('/', auth, async (req, res) => {
  const { action, points } = req.body;

  if (!['buy', 'sell'].includes(action) || typeof points !== 'number' || points <= 0) {
    return res.status(400).json({ message: 'Invalid action or points' });
  }

  try {
    const user = await User.findById(req.user.id);

    if (!user || user.role !== 'employee') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (action === 'sell' && user.points < points) {
      return res.status(400).json({ message: 'Insufficient points' });
    }

    user.points += action === 'buy' ? points : -points;
    await user.save();

    // Record the transaction
    // Remove manual timestamp field
const transaction = new WalletTransaction({
    userId: user._id,
    type: action,
    points
  });
  await transaction.save();
  

    res.status(200).json({ message: 'Transaction successful', points: user.points });
  } catch (err) {
    console.error('Wallet API error:', err);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// GET /api/wallet/history
router.get('/history', auth, async (req, res) => {
  try {
    const transactions = await WalletTransaction.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    console.error('Error fetching transaction history:', err);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

module.exports = router;
