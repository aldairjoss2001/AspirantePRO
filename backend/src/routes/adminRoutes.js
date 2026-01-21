const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  updatePaymentStatus,
  toggleUserAccess,
  updateUserRole,
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
  getMaterias,
  getReportUsers,
  getReportPayments,
  getReportContent,
  getReportQuizzes,
  getReportAccess,
  changeAdminPassword,
  getAllQuestions
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
router.put('/users/:id/role', updateUserRole);

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
router.get('/all-questions', getAllQuestions);

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

// Rutas de perfil
router.put('/profile/change-password', changeAdminPassword);

// Rutas de materias
router.get('/materias', getMaterias);

// Rutas de reportes
router.get('/reports/users', getReportUsers);
router.get('/reports/payments', getReportPayments);
router.get('/reports/content', getReportContent);
router.get('/reports/quizzes', getReportQuizzes);
router.get('/reports/access', getReportAccess);

module.exports = router;
