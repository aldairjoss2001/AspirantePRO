const User = require('../models/User');
const Content = require('../models/Content');
const Quiz = require('../models/Quiz');
const Notification = require('../models/Notification');
const Settings = require('../models/Settings');
const { MATERIAS_ESFM } = require('../constants/materias');
const bcrypt = require('bcryptjs');

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

// @desc    Actualizar rol de usuario
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res, next) => {
  try {
    const { rol } = req.body;

    if (!['admin', 'estudiante'].includes(rol)) {
      return res.status(400).json({
        success: false,
        message: 'Rol inválido'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { rol },
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

// ============ CONFIGURACIÓN / SETTINGS ============

// @desc    Obtener configuración general
// @route   GET /api/admin/settings
// @access  Private/Admin
exports.getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    
    // Si no existe configuración, crear una por defecto
    if (!settings) {
      settings = await Settings.create({
        qr_code_url: null,
        qr_code_text: 'Escanea este código QR para realizar el pago de 15 Bs.',
        whatsapp_number: '+59160572616'
      });
    }

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Actualizar configuración general
// @route   PUT /api/admin/settings
// @access  Private/Admin
exports.updateSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create(req.body);
    } else {
      settings = await Settings.findOneAndUpdate(
        {},
        req.body,
        { new: true, runValidators: true }
      );
    }

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener lista de materias ESFM
// @route   GET /api/admin/materias
// @access  Private/Admin
exports.getMaterias = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: MATERIAS_ESFM
    });
  } catch (error) {
    next(error);
  }
};

// ============ REPORTES Y ANALÍTICAS ============

// @desc    Obtener reporte de registros de usuarios
// @route   GET /api/admin/reports/users
// @access  Private/Admin
exports.getReportUsers = async (req, res, next) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    
    let filter = {};
    if (fecha_inicio && fecha_fin) {
      filter.fecha_registro = {
        $gte: new Date(fecha_inicio),
        $lte: new Date(fecha_fin + 'T23:59:59')
      };
    }

    const users = await User.find(filter).sort('-fecha_registro');
    
    // Estadísticas por estado
    const byStatus = await User.aggregate([
      { $match: filter },
      { $group: { _id: '$status_pago', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: users,
      stats: {
        total: users.length,
        byStatus: byStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener reporte de pagos
// @route   GET /api/admin/reports/payments
// @access  Private/Admin
exports.getReportPayments = async (req, res, next) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    
    let filter = { status_pago: { $in: ['validando', 'activo'] } };
    if (fecha_inicio && fecha_fin) {
      filter.fecha_registro = {
        $gte: new Date(fecha_inicio),
        $lte: new Date(fecha_fin + 'T23:59:59')
      };
    }

    const payments = await User.find(filter).sort('-fecha_registro');
    const activePaid = payments.filter(u => u.status_pago === 'activo').length;
    const totalRevenue = activePaid * 15; // 15 Bs por usuario

    res.status(200).json({
      success: true,
      data: payments,
      stats: {
        total: payments.length,
        activos: activePaid,
        validando: payments.length - activePaid,
        ingresos_bs: totalRevenue
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener reporte de contenido
// @route   GET /api/admin/reports/content
// @access  Private/Admin
exports.getReportContent = async (req, res, next) => {
  try {
    const { fecha_inicio, fecha_fin, tipo } = req.query;
    
    let filter = {};
    if (fecha_inicio && fecha_fin) {
      filter.createdAt = {
        $gte: new Date(fecha_inicio),
        $lte: new Date(fecha_fin + 'T23:59:59')
      };
    }
    if (tipo) {
      filter.tipo = tipo;
    }

    const content = await Content.find(filter).sort('-createdAt');
    
    // Estadísticas por tipo y materia
    const byType = await Content.aggregate([
      { $match: filter },
      { $group: { _id: '$tipo', count: { $sum: 1 } } }
    ]);

    const byMateria = await Content.aggregate([
      { $match: filter },
      { $group: { _id: '$materia', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: content,
      stats: {
        total: content.length,
        byType: byType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byMateria: byMateria.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener reporte de quizzes
// @route   GET /api/admin/reports/quizzes
// @access  Private/Admin
exports.getReportQuizzes = async (req, res, next) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    
    let filter = {};
    if (fecha_inicio && fecha_fin) {
      filter.createdAt = {
        $gte: new Date(fecha_inicio),
        $lte: new Date(fecha_fin + 'T23:59:59')
      };
    }

    const quizzes = await Quiz.find(filter).sort('-createdAt');
    
    // Estadísticas por dificultad y materia
    const byDificultad = await Quiz.aggregate([
      { $match: filter },
      { $group: { _id: '$dificultad', count: { $sum: 1 } } }
    ]);

    const byMateria = await Quiz.aggregate([
      { $match: filter },
      { $group: { _id: '$materia', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: quizzes,
      stats: {
        total: quizzes.length,
        byDificultad: byDificultad.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byMateria: byMateria.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener reporte de accesos por materia
// @route   GET /api/admin/reports/access
// @access  Private/Admin
exports.getReportAccess = async (req, res, next) => {
  try {
    const users = await User.find({ status_pago: 'activo' });
    
    // Contar usuarios por materia
    const accessByMateria = {};
    users.forEach(user => {
      if (user.materias_acceso && user.materias_acceso.length > 0) {
        user.materias_acceso.forEach(materia => {
          accessByMateria[materia] = (accessByMateria[materia] || 0) + 1;
        });
      }
    });

    res.status(200).json({
      success: true,
      data: accessByMateria,
      stats: {
        totalUsers: users.length,
        materiasPopulares: Object.entries(accessByMateria)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([materia, count]) => ({ materia, count }))
      }
    });
  } catch (error) {
    next(error);
  }
};

// ============ PERFIL DE ADMIN ============

// @desc    Cambiar contraseña de admin
// @route   PUT /api/admin/profile/change-password
// @access  Private/Admin
exports.changeAdminPassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;

    // Obtener usuario con contraseña
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar contraseña actual
    const isMatch = await bcrypt.compare(current_password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña actual es incorrecta'
      });
    }

    // Actualizar contraseña
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(new_password, salt);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener todas las preguntas
// @route   GET /api/admin/all-questions
// @access  Private/Admin
exports.getAllQuestions = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find().sort('-createdAt');

    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes
    });
  } catch (error) {
    next(error);
  }
};

