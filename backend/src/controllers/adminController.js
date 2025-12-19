const User = require('../models/User');
const Content = require('../models/Content');
const Quiz = require('../models/Quiz');
const Notification = require('../models/Notification');

// ============ GESTIÓN DE USUARIOS ============

// @desc    Obtener todos los usuarios
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort('-fecha_registro');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Actualizar estado de pago y materias de usuario
// @route   PUT /api/admin/users/:id/payment-status
// @access  Private/Admin
exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { status_pago, materias_acceso } = req.body;
    
    const updateData = { status_pago };
    if (materias_acceso !== undefined) {
      updateData.materias_acceso = materias_acceso;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Activar/Desactivar usuario
// @route   PUT /api/admin/users/:id/toggle-access
// @access  Private/Admin
exports.toggleUserAccess = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    user.status_pago = user.status_pago === 'activo' ? 'pendiente' : 'activo';
    await user.save();

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// ============ GESTIÓN DE CONTENIDO ============

// @desc    Subir archivo local
// @route   POST /api/admin/content/upload
// @access  Private/Admin
exports.uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Por favor suba un archivo'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        filename: req.file.filename,
        path: `/uploads/${req.file.filename}`,
        originalname: req.file.originalname
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Crear contenido
// @route   POST /api/admin/content
// @access  Private/Admin
exports.createContent = async (req, res, next) => {
  try {
    const content = await Content.create(req.body);

    res.status(201).json({
      success: true,
      data: content
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Actualizar contenido
// @route   PUT /api/admin/content/:id
// @access  Private/Admin
exports.updateContent = async (req, res, next) => {
  try {
    const content = await Content.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Contenido no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: content
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Eliminar contenido
// @route   DELETE /api/admin/content/:id
// @access  Private/Admin
exports.deleteContent = async (req, res, next) => {
  try {
    const content = await Content.findByIdAndDelete(req.params.id);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Contenido no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// ============ GESTIÓN DE QUIZZES ============

// @desc    Obtener un quiz específico
// @route   GET /api/admin/quizzes/:id
// @access  Private/Admin
exports.getQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: quiz
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Crear pregunta de quiz
// @route   POST /api/admin/quizzes
// @access  Private/Admin
exports.createQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.create(req.body);

    res.status(201).json({
      success: true,
      data: quiz
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Actualizar pregunta de quiz
// @route   PUT /api/admin/quizzes/:id
// @access  Private/Admin
exports.updateQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: quiz
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Eliminar pregunta de quiz
// @route   DELETE /api/admin/quizzes/:id
// @access  Private/Admin
exports.deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// ============ REPORTES Y ESTADÍSTICAS ============

// @desc    Obtener estadísticas del dashboard
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    // Usuarios totales
    const totalUsers = await User.countDocuments();
    
    // Usuarios activos (pagaron)
    const activeUsers = await User.countDocuments({ status_pago: 'activo' });
    
    // Usuarios pendientes
    const pendingUsers = await User.countDocuments({ status_pago: 'pendiente' });
    
    // Usuarios validando
    const validatingUsers = await User.countDocuments({ status_pago: 'validando' });
    
    // Contenido total
    const totalContent = await Content.countDocuments();
    
    // Quizzes totales
    const totalQuizzes = await Quiz.countDocuments();
    
    // Registros por día (últimos 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentRegistrations = await User.find({
      fecha_registro: { $gte: thirtyDaysAgo }
    }).select('fecha_registro');
    
    // Ingresos totales (15 Bs por usuario activo)
    const totalRevenue = activeUsers * 15;

    res.status(200).json({
      success: true,
      data: {
        usuarios: {
          total: totalUsers,
          activos: activeUsers,
          pendientes: pendingUsers,
          validando: validatingUsers
        },
        contenido: {
          total: totalContent
        },
        quizzes: {
          total: totalQuizzes
        },
        ingresos: {
          total: totalRevenue,
          moneda: 'Bs.'
        },
        registrosRecientes: recentRegistrations.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// ============ NOTIFICACIONES ============

// @desc    Crear notificación global
// @route   POST /api/admin/notifications
// @access  Private/Admin
exports.createNotification = async (req, res, next) => {
  try {
    const notification = await Notification.create(req.body);

    res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Actualizar notificación
// @route   PUT /api/admin/notifications/:id
// @access  Private/Admin
exports.updateNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Eliminar notificación
// @route   DELETE /api/admin/notifications/:id
// @access  Private/Admin
exports.deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
