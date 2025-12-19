const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  updatePaymentStatus,
  toggleUserAccess,
  uploadFile,
  createContent,
  updateContent,
  deleteContent,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getDashboardStats,
  createNotification,
  updateNotification,
  deleteNotification,
  getSettings,
  updateSettings,
  getMaterias
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../config/upload');

// Proteger todas las rutas y requerir rol de admin
router.use(protect);
router.use(authorize('admin'));

// Rutas de gestión de usuarios
router.get('/users', getAllUsers);
router.put('/users/:id/payment-status', updatePaymentStatus);
router.put('/users/:id/toggle-access', toggleUserAccess);

// Rutas de gestión de contenido
router.post('/content/upload', upload.single('archivo'), uploadFile);
router.post('/content', createContent);
router.put('/content/:id', updateContent);
router.delete('/content/:id', deleteContent);

// Rutas de gestión de quizzes
router.get('/quizzes/:id', getQuiz);
router.post('/quizzes', createQuiz);
router.put('/quizzes/:id', updateQuiz);
router.delete('/quizzes/:id', deleteQuiz);

// Rutas de estadísticas
router.get('/stats', getDashboardStats);

// Rutas de notificaciones
router.post('/notifications', createNotification);
router.put('/notifications/:id', updateNotification);
router.delete('/notifications/:id', deleteNotification);

// Rutas de configuración
router.get('/settings', getSettings);
router.put('/settings', updateSettings);
router.post('/settings/qr', upload.single('qr'), uploadFile);

// Rutas de materias
router.get('/materias', getMaterias);

module.exports = router;
