const express = require('express');
const router = express.Router();
const { getHistory, addToHistory, removeFromHistory, clearHistory } = require('../controllers/history.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/', getHistory);
router.post('/', addToHistory);
router.delete('/clear', clearHistory);
router.delete('/:movieId', removeFromHistory);

module.exports = router;
