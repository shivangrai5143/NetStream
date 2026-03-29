const express = require('express');
const router = express.Router();
const { getWatchlist, addToWatchlist, removeFromWatchlist, checkWatchlist } = require('../controllers/watchlist.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/', getWatchlist);
router.post('/', addToWatchlist);
router.get('/check/:movieId', checkWatchlist);
router.delete('/:movieId', removeFromWatchlist);

module.exports = router;
