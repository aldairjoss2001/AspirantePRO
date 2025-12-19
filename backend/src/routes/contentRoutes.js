const express = require('express');
const router = express.Router();
const {
  getAllContent,
  getContent,
  getQuizzes,
  checkQuizAnswers,
  getNotifications,
  getCategories,
  getMaterias
} = require('../controllers/contentController');
const { protect, checkActiveAccess } = require('../middleware/auth');

router.get('/content/categories', protect, getCategories);
router.get('/content/materias', protect, getMaterias);
router.get('/content', protect, checkActiveAccess, getAllContent);
router.get('/content/:id', protect, checkActiveAccess, getContent);
router.get('/quizzes', protect, checkActiveAccess, getQuizzes);
router.post('/quizzes/check', protect, checkActiveAccess, checkQuizAnswers);
router.get('/notifications', protect, getNotifications);

module.exports = router;
