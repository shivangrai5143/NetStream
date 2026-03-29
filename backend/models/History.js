const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
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
  progress: { type: Number, default: 0, min: 0, max: 100 }, // percentage watched
  watchedAt: { type: Date, default: Date.now },
  duration: { type: Number, default: 0 } // in seconds
}, { timestamps: true });

// Unique per profile + movie (upsert on re-watch)
historySchema.index({ profile: 1, movieId: 1 }, { unique: true });

module.exports = mongoose.model('History', historySchema);
