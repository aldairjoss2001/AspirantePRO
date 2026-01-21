const express = require('express');
const router = express.Router();
const simulacroController = require('../controllers/simulacroController');
const { protect, authorize } = require('../middleware/auth');

// Student routes (protected)
router.get(
  '/',
  protect,
  simulacroController.getAvailableSimulacros
);

router.get(
  '/history',
  protect,
  simulacroController.getUserHistory
);

router.get(
  '/:id/preview',
  protect,
  simulacroController.getSimulacroPreview
);

router.get(
  '/:id/start',
  protect,
  simulacroController.startSimulacro
);

router.post(
  '/:id/submit',
  protect,
  simulacroController.submitSimulacro
);

router.get(
  '/:id/history',
  protect,
  simulacroController.getSimulacroHistory
);

router.get(
  '/attempts/:attemptId',
  protect,
  simulacroController.getAttemptDetails
);

// Admin routes (protected + admin only)
router.get(
  '/admin/all',
  protect,
  authorize('admin'),
  simulacroController.getAllSimulacros
);

router.post(
  '/admin/create',
  protect,
  authorize('admin'),
  simulacroController.createSimulacro
);

router.get(
  '/admin/:id',
  protect,
  authorize('admin'),
  simulacroController.getSimulacroById
);

router.put(
  '/admin/:id',
  protect,
  authorize('admin'),
  simulacroController.updateSimulacro
);

router.delete(
  '/admin/:id',
  protect,
  authorize('admin'),
  simulacroController.deleteSimulacro
);

module.exports = router;
