const tmdb = require('../utils/tmdb.utils');

const handleTMDB = async (res, next, fn) => {
  try {
    const { data } = await fn();
    res.status(200).json({ success: true, ...data });
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: error.response.data?.status_message || 'TMDB API error'
      });
    }
    next(error);
  }
};

const getTrending = (req, res, next) =>
  handleTMDB(res, next, () => tmdb.getTrending(req.query.type || 'movie', req.query.window || 'week', req.query.page));

const getPopular = (req, res, next) =>
  handleTMDB(res, next, () => tmdb.getPopular(req.query.type || 'movie', req.query.page));

const getTopRated = (req, res, next) =>
  handleTMDB(res, next, () => tmdb.getTopRated(req.query.type || 'movie', req.query.page));

const getUpcoming = (req, res, next) =>
  handleTMDB(res, next, () => tmdb.getUpcoming(req.query.page));

const getNowPlaying = (req, res, next) =>
  handleTMDB(res, next, () => tmdb.getNowPlaying(req.query.page));

const getMovieDetails = (req, res, next) =>
  handleTMDB(res, next, () => tmdb.getMovieDetails(req.params.id));

const getTVDetails = (req, res, next) =>
  handleTMDB(res, next, () => tmdb.getTVDetails(req.params.id));

const searchMovies = (req, res, next) => {
  if (!req.query.q) {
    return res.status(400).json({ success: false, message: 'Search query required.' });
  }
  handleTMDB(res, next, () => tmdb.search(req.query.q, req.query.page));
};

const getVideos = (req, res, next) =>
  handleTMDB(res, next, () => tmdb.getVideos(req.params.id, req.query.type || 'movie'));

const getGenres = (req, res, next) =>
  handleTMDB(res, next, () => tmdb.getGenres(req.query.type || 'movie'));

const discoverByGenre = (req, res, next) =>
  handleTMDB(res, next, () => tmdb.discoverByGenre(req.params.genreId, req.query.type || 'movie', req.query.page));

module.exports = {
  getTrending, getPopular, getTopRated, getUpcoming, getNowPlaying,
  getMovieDetails, getTVDetails, searchMovies, getVideos, getGenres, discoverByGenre
};
