const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  uploadComprobante,
  updatePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const upload = require('../config/upload');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/upload-comprobante', protect, upload.single('comprobante'), uploadComprobante);
router.put('/update-password', protect, updatePassword);

module.exports = router;
