const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// ✅ Register (Employee or Employer) and Replace if Exists
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, role, employerName } = req.body;

    const allowedRoles = ['employee', 'employer'];
    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!email || !password || !fullName || !role) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }

    if (role === 'employee') {
      if (!employerName) {
        return res.status(400).json({ message: 'Employer name is required for employees.' });
      }

      const employerExists = await User.findOne({ fullName: employerName, role: 'employer' });
      if (!employerExists) {
        return res.status(404).json({ message: 'Specified employer does not exist.' });
      }
    }

    if (role === 'employer') {
      const employerNameExists = await User.findOne({ fullName, role: 'employer' });
      if (employerNameExists) {
        return res.status(409).json({ message: 'Employer name is already taken.' });
      }
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email is already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      fullName,
      email,
      password: hashedPassword,
      role,
      points: 0,
      ...(role === 'employee' && { employerName })
    };

    await User.create(userData);
    res.status(201).json({ message: 'User registered successfully' });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Internal server error. Please try again later.' });
  }
});



// ✅ JWT Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.cookie('token', token, {
      domain : 'carboncredits-backend.onrender.com',
      httpOnly: true,
      sameSite: 'None',
      secure: true,
    });

    res.json({ message: 'Login successful', role: user.role });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Get Authenticated User (for frontend dashboard)
router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
});

// ✅ Update Authenticated User (Edit Profile)
router.put('/me', auth, async (req, res) => {
  try {
    const { fullName, email, employerName } = req.body;

    const updates = { fullName, email };
    const currentUser = await User.findById(req.user.id);

    if (currentUser.role === 'employee') {
      updates.employerName = employerName;
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
    res.json(updatedUser);
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  return res.status(200).json({ message: 'Logged out' });
});

// ✅ Google OAuth Login
router.get('/google', (req, res, next) => {
  req.session.role = req.query.role;
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

// ✅ Google OAuth Callback
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  async (req, res) => {
    const { profile, user } = req.user;

    if (!user) {
      return res.redirect(`https://carboncredits-frontend-1.onrender.com?error=notregistered&email=${profile.emails[0].value}`);
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.cookie('token', token, {
      domain : 'carboncredits-backend.onrender.com',
      httpOnly: true,
      sameSite: 'None',
      secure: true,
    });

    const redirectUrl = `https://carboncredits-frontend-1.onrender.com/${user.role}/dashboard/`;
    res.redirect(redirectUrl);
  }
);

module.exports = router;
