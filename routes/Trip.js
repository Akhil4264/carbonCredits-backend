// server/routes/trip.js
const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');

router.post('/log', async (req, res) => {
  try {
    const { userId, start, end, distance, date } = req.body;

    const trip = new Trip({ userId, start, end, distance, date });
    await trip.save();

    res.status(201).json({ message: 'Trip logged successfully', trip });
  } catch (error) {
    res.status(500).json({ message: 'Error saving trip', error });
  }
});


// GET trips by employee ID
router.get('/employee/:userId', async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.params.userId }).sort({ date: -1 });
    res.json(trips);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching trips', error: err });
  }
});




module.exports = router;
