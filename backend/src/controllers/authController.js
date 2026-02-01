const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Registrar nuevo usuario
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { nombre_completo, email, password } = req.body;

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'El usuario ya existe con ese email'
      });
    }

    // Crear usuario
    const user = await User.create({
      nombre_completo,
      email,
      password,
      status_pago: 'pendiente'
    });

    // Generar token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        nombre_completo: user.nombre_completo,
        email: user.email,
        rol: user.rol,
        status_pago: user.status_pago,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login de usuario
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validar email y password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor proporcione email y contraseña'
      });
    }

    // Buscar usuario y incluir password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Generar token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        nombre_completo: user.nombre_completo,
        email: user.email,
        rol: user.rol,
        status_pago: user.status_pago,
        foto_perfil: user.foto_perfil,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener usuario actual
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Subir comprobante de pago
// @route   POST /api/auth/upload-comprobante
// @access  Private
exports.uploadComprobante = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Por favor suba un comprobante'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        comprobante_url: `/uploads/${req.file.filename}`,
        status_pago: 'validando'
      },
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

// @desc    Actualizar contraseña
// @route   PUT /api/auth/update-password
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    // Verificar contraseña actual
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Contraseña actual incorrecta'
      });
    }

    user.password = newPassword;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      data: {
        token
      }
    });
  } catch (error) {
    next(error);
  }
};
