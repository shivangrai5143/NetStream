const User = require('../models/User');
const Profile = require('../models/Profile');
const { sendTokenResponse } = require('../utils/jwt.utils');

// POST /api/auth/signup
const signup = async (req, res, next) => {
  try {
    const { email, password, username } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    const user = await User.create({ email, password, username });

    // Auto-create default profile
    await Profile.create({ user: user._id, name: username, avatar: 'avatar1' });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/logout
const logout = async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
};

// GET /api/auth/me
const getMe = async (req, res) => {
  const profiles = await Profile.find({ user: req.user._id });
  res.status(200).json({
    success: true,
    user: req.user,
    profiles
  });
};

module.exports = { signup, login, logout, getMe };
