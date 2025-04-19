const express = require('express');
const router = express.Router();
const PointRequest = require('../models/PointRequest');
const User = require('../models/User');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');

// Employee submits a point request
router.post('/request', authenticate, authorize('employee'), async (req, res) => {
  const { option } = req.body;
  const pointValues = { car: 10, 'remote working': 20, other: 30 };
  const points = pointValues[option];

  if (!points) {
    return res.status(400).json({ message: 'Invalid option selected.' });
  }

  const newRequest = new PointRequest({
    employee: req.user.id,
    option,
    points,
  });

  await newRequest.save();
  res.status(201).json({ message: 'Point request submitted successfully.' });
});

// Employer views pending requests
router.get('/requests', authenticate, authorize('employer'), async (req, res) => {
  const requests = await PointRequest.find({ status: 'pending' }).populate('employee', 'email');
  res.json(requests);
});

// Employer approves or dismisses a request
router.post('/requests/:id/decision', authenticate, authorize('employer'), async (req, res) => {
  const { decision } = req.body; // 'approved' or 'dismissed'
  const request = await PointRequest.findById(req.params.id);

  if (!request || request.status !== 'pending') {
    return res.status(404).json({ message: 'Request not found or already processed.' });
  }

  request.status = decision;
  await request.save();

  if (decision === 'approved') {
    await User.findByIdAndUpdate(request.employee, { $inc: { points: request.points } });
  }

  res.json({ message: `Request ${decision} successfully.` });
});

module.exports = router;
