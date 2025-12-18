const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Proteger rutas - verificar token JWT
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No autorizado para acceder a esta ruta'
    });
  }

  try {
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

// Autorizar roles específicos
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({
        success: false,
        message: `El rol ${req.user.rol} no está autorizado para acceder a esta ruta`
      });
    }
    next();
  };
};

// Verificar si el usuario tiene acceso activo (ha pagado)
exports.checkActiveAccess = async (req, res, next) => {
  if (req.user.status_pago !== 'activo' && req.user.rol !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acceso restringido. Por favor complete el pago para acceder al contenido.'
    });
  }
  next();
};
