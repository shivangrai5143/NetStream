const Watchlist = require('../models/Watchlist');

// GET /api/watchlist?profileId=xxx
const getWatchlist = async (req, res, next) => {
  try {
    const items = await Watchlist.find({
      user: req.user._id,
      profile: req.query.profileId
    }).sort({ addedAt: -1 });

    res.status(200).json({ success: true, items, count: items.length });
  } catch (error) { next(error); }
};

// POST /api/watchlist
const addToWatchlist = async (req, res, next) => {
  try {
    const { profileId, movieId, title, poster_path, backdrop_path, overview, vote_average, release_date, media_type, genre_ids } = req.body;

    const existing = await Watchlist.findOne({ profile: profileId, movieId });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Already in watchlist.' });
    }

    const item = await Watchlist.create({
      profile: profileId,
      user: req.user._id,
      movieId, title, poster_path, backdrop_path, overview, vote_average, release_date, media_type, genre_ids
    });

    res.status(201).json({ success: true, item });
  } catch (error) { next(error); }
};

// DELETE /api/watchlist/:movieId?profileId=xxx
const removeFromWatchlist = async (req, res, next) => {
  try {
    const deleted = await Watchlist.findOneAndDelete({
      profile: req.query.profileId,
      user: req.user._id,
      movieId: req.params.movieId
    });

    if (!deleted) return res.status(404).json({ success: false, message: 'Item not found in watchlist.' });
    res.status(200).json({ success: true, message: 'Removed from watchlist.' });
  } catch (error) { next(error); }
};

// GET /api/watchlist/check/:movieId?profileId=xxx
const checkWatchlist = async (req, res, next) => {
  try {
    const item = await Watchlist.findOne({
      profile: req.query.profileId,
      user: req.user._id,
      movieId: req.params.movieId
    });
    res.status(200).json({ success: true, inWatchlist: !!item });
  } catch (error) { next(error); }
};

module.exports = { getWatchlist, addToWatchlist, removeFromWatchlist, checkWatchlist };
