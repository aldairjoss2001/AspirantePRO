const express = require('express');
const router = express.Router();
const {
  updateProfile,
  updatePhoto,
  getUserStats
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const upload = require('../config/upload');

router.put('/profile', protect, updateProfile);
router.put('/photo', protect, upload.single('foto'), updatePhoto);
router.get('/stats', protect, getUserStats);

module.exports = router;
