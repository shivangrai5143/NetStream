const express = require('express');
const router = express.Router();
const {
  getTrending, getPopular, getTopRated, getUpcoming, getNowPlaying,
  getMovieDetails, getTVDetails, searchMovies, getVideos, getGenres, discoverByGenre
} = require('../controllers/movie.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/trending', getTrending);
router.get('/popular', getPopular);
router.get('/top-rated', getTopRated);
router.get('/upcoming', getUpcoming);
router.get('/now-playing', getNowPlaying);
router.get('/search', searchMovies);
router.get('/genres', getGenres);
router.get('/genre/:genreId', discoverByGenre);
router.get('/movie/:id', getMovieDetails);
router.get('/tv/:id', getTVDetails);
router.get('/:id/videos', getVideos);

module.exports = router;
