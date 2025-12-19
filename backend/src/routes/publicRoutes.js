const express = require('express');
const router = express.Router();
const {
  getPublicSettings,
  getPublicMaterias
} = require('../controllers/publicController');

// Rutas públicas (no requieren autenticación)
router.get('/settings', getPublicSettings);
router.get('/materias', getPublicMaterias);

module.exports = router;
