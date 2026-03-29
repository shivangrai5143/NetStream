const express = require('express');
const router = express.Router();
const { getProfiles, createProfile, updateProfile, deleteProfile } = require('../controllers/profile.controller');
const { protect } = require('../middleware/auth.middleware');
const { validateProfile } = require('../middleware/validate.middleware');

router.use(protect);
router.get('/', getProfiles);
router.post('/', validateProfile, createProfile);
router.put('/:id', updateProfile);
router.delete('/:id', deleteProfile);

module.exports = router;
