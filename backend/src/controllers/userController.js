const User = require('../models/User');

// @desc    Actualizar perfil de usuario
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { nombre_completo } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { nombre_completo },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Actualizar foto de perfil
// @route   PUT /api/users/photo
// @access  Private
exports.updatePhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Por favor suba una foto'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { foto_perfil: `/uploads/${req.file.filename}` },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener estadísticas del usuario
// @route   GET /api/users/stats
// @access  Private
exports.getUserStats = async (req, res, next) => {
  try {
    // Aquí puedes agregar lógica para calcular estadísticas del usuario
    // como progreso en simulacros, contenido visto, etc.
    
    res.status(200).json({
      success: true,
      data: {
        usuario: req.user.nombre_completo,
        status_pago: req.user.status_pago,
        fecha_registro: req.user.fecha_registro
      }
    });
  } catch (error) {
    next(error);
  }
};
