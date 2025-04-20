const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const cookieParser = require('cookie-parser');
require('dotenv').config();

require('./config/passport'); // Load Passport Google OAuth strategy

const authRoutes = require('./routes/auth');
const pointRoutes = require('./routes/points');
const requestRoutes = require('./routes/requests');

const app = express();

// Middleware
app.use(cors({
  origin: 'https://carboncredits-frontend-1.onrender.com',
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Session for JWT + OAuth
app.use(session({
  name : "session_id",
  secret: process.env.SESSION_SECRET || 'your_default_secret',
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
    sameSite: 'None',
    secure: true
  }
}));

// Initialize Passport for OAuth
app.use(passport.initialize());
app.use(passport.session());

// Store role from Google OAuth login
app.use((req, res, next) => {
  if (req.query.role) {
    req.session.role = req.query.role;
  }
  next();
});
const tripRoutes = require('./routes/Trip');
 // adjust path if needed
app.use('/api/trip', tripRoutes);

// Routes
app.use('/auth', authRoutes);
app.use('/api/points', pointRoutes);
app.use('/api/requests', requestRoutes);
const walletRoutes = require('./routes/wallet');
app.use('/api/wallet', walletRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('✅ Connected to MongoDB');
  app.listen(process.env.PORT || 5000, () => {
    console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
  });
}).catch(err => {
  console.error('❌ Database connection error:', err);
});