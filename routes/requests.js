const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const User = require('../models/User');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// 🧑‍💼 Employee submits a request
router.post('/', auth, role('employee'), async (req, res) => {
  console.log('🔐 Authenticated user:', req.user);
  console.log('📦 Request body:', req.body);

  const { mode, distance, location } = req.body;

  // Validate presence of required fields
  if (
    !mode ||
    distance === undefined ||
    !location ||
    typeof location.latitude !== 'number' ||
    typeof location.longitude !== 'number'
  ) {
    return res.status(400).json({ message: 'Invalid request payload' });
  }

  const pointValues = { car: 10, bus: 20, bike: 30 };
  const points = (pointValues[mode] || 0) * distance;

  const user = await User.findById(req.user.id);

  const newRequest = new Request({
    employeeId: user._id,
    employerName: user.employerName,
    mode,
    points,
    distance,
    location: {
      type: 'Point',
      coordinates: [req.body.endLocation.longitude, req.body.endLocation.latitude], // optional, for map view
    },
    startLocation: {
      type: 'Point',
      coordinates: [req.body.startLocation.longitude, req.body.startLocation.latitude],
    },
    endLocation: {
      type: 'Point',
      coordinates: [req.body.endLocation.longitude, req.body.endLocation.latitude],
    }
  });
  

  await newRequest.save();
  res.status(201).json({ message: 'Request submitted successfully' });
});

// ✅ Get employee's own requests
// routes/requests.js

router.get('/employee', auth, role('employee'), async (req, res) => {
  try {
    const requests = await Request.find({ employeeId: req.user.id }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error('Error fetching employee requests:', err);
    res.status(500).json({ message: 'Server error' });
  }
});



// ✅ Employer views requests by their employees
// Employer views pending requests
// ✅ Employer views requests by their employees
router.get('/employer', auth, role('employer'), async (req, res) => {
  try {
    const employer = await User.findById(req.user.id);
    const requests = await Request.find({
      employerName: employer.fullName, // or .employerName if you're matching differently
      status: 'pending'
    }).populate('employeeId', 'fullName'); // 👈 populate only fullName of employee

    res.json(requests);
  } catch (err) {
    console.error('Error fetching employer requests:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// DELETE a request
router.delete('/:id', auth, role('employee'), async (req, res) => {
  const request = await Request.findById(req.params.id);
  if (!request) return res.status(404).json({ message: 'Request not found' });
  if (request.status === 'approved') {
    return res.status(400).json({ message: 'Cannot delete approved request' });
  }

  await Request.findByIdAndDelete(req.params.id);
  res.json({ message: 'Request dismissed' });
});

// ✅ Employer approves or rejects
router.put('/:id', auth, role('employer'), async (req, res) => {
  const { status } = req.body;
  const request = await Request.findById(req.params.id);
  if (!request) return res.status(404).json({ message: 'Request not found' });

  request.status = status;
  await request.save();

  if (status === 'approved') {
    await User.findByIdAndUpdate(request.employeeId, {
      $inc: { points: request.points },
    });
  }

  res.json({ message: `Request ${status}` });
});

module.exports = router;