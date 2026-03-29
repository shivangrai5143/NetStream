const History = require('../models/History');

// GET /api/history?profileId=xxx
const getHistory = async (req, res, next) => {
  try {
    const items = await History.find({
      user: req.user._id,
      profile: req.query.profileId
    }).sort({ watchedAt: -1 }).limit(50);

    res.status(200).json({ success: true, items });
  } catch (error) { next(error); }
};

// POST /api/history (upsert)
const addToHistory = async (req, res, next) => {
  try {
    const { profileId, movieId, title, poster_path, backdrop_path, overview, vote_average, release_date, media_type, progress, duration } = req.body;

    const item = await History.findOneAndUpdate(
      { profile: profileId, user: req.user._id, movieId },
      {
        title, poster_path, backdrop_path, overview, vote_average,
        release_date, media_type, progress, duration, watchedAt: Date.now()
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, item });
  } catch (error) { next(error); }
};

// DELETE /api/history/:movieId?profileId=xxx
const removeFromHistory = async (req, res, next) => {
  try {
    await History.findOneAndDelete({
      profile: req.query.profileId,
      user: req.user._id,
      movieId: req.params.movieId
    });
    res.status(200).json({ success: true, message: 'Removed from history.' });
  } catch (error) { next(error); }
};

// DELETE /api/history?profileId=xxx (clear all)
const clearHistory = async (req, res, next) => {
  try {
    await History.deleteMany({ profile: req.query.profileId, user: req.user._id });
    res.status(200).json({ success: true, message: 'History cleared.' });
  } catch (error) { next(error); }
};

module.exports = { getHistory, addToHistory, removeFromHistory, clearHistory };
