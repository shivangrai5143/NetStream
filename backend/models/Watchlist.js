const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  movieId: { type: Number, required: true },
  title: { type: String, required: true },
  poster_path: { type: String },
  backdrop_path: { type: String },
  overview: { type: String },
  vote_average: { type: Number },
  release_date: { type: String },
  media_type: { type: String, enum: ['movie', 'tv'], default: 'movie' },
  genre_ids: [{ type: Number }],
  addedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Unique per profile + movie
watchlistSchema.index({ profile: 1, movieId: 1 }, { unique: true });

module.exports = mongoose.model('Watchlist', watchlistSchema);
