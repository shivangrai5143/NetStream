const Profile = require('../models/Profile');

// GET /api/profiles
const getProfiles = async (req, res, next) => {
  try {
    const profiles = await Profile.find({ user: req.user._id });
    res.status(200).json({ success: true, profiles });
  } catch (error) { next(error); }
};

// POST /api/profiles
const createProfile = async (req, res, next) => {
  try {
    const existing = await Profile.countDocuments({ user: req.user._id });
    if (existing >= 5) {
      return res.status(400).json({ success: false, message: 'Maximum 5 profiles allowed.' });
    }

    const { name, avatar, isKids, maturityRating } = req.body;
    const profile = await Profile.create({
      user: req.user._id,
      name,
      avatar: avatar || 'avatar1',
      isKids: isKids || false,
      maturityRating: maturityRating || 'ALL'
    });

    res.status(201).json({ success: true, profile });
  } catch (error) { next(error); }
};

// PUT /api/profiles/:id
const updateProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found.' });
    res.status(200).json({ success: true, profile });
  } catch (error) { next(error); }
};

// DELETE /api/profiles/:id
const deleteProfile = async (req, res, next) => {
  try {
    const count = await Profile.countDocuments({ user: req.user._id });
    if (count <= 1) {
      return res.status(400).json({ success: false, message: 'Cannot delete the last profile.' });
    }

    const profile = await Profile.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found.' });
    res.status(200).json({ success: true, message: 'Profile deleted.' });
  } catch (error) { next(error); }
};

module.exports = { getProfiles, createProfile, updateProfile, deleteProfile };
