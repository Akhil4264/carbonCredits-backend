const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  const email = profile.emails[0].value;
  const user = await User.findOne({ email }); // 🔍 Check only by email

  // Either user exists or not, pass info to callback
  return done(null, { profile, user });
}));

passport.serializeUser((userObj, done) => {
  done(null, userObj.profile.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findOne({ googleId: id });
  done(null, user);
});
