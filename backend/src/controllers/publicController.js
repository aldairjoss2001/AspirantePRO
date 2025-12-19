const Settings = require('../models/Settings');
const { MATERIAS_ESFM } = require('../constants/materias');

// @desc    Obtener configuración pública (QR code, WhatsApp)
// @route   GET /api/public/settings
// @access  Public
exports.getPublicSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create({
        qr_code_url: null,
        qr_code_text: 'Escanea este código QR para realizar el pago de 15 Bs.',
        whatsapp_number: '+59160572616'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        qr_code_url: settings.qr_code_url,
        qr_code_text: settings.qr_code_text,
        whatsapp_number: settings.whatsapp_number
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener lista de materias ESFM
// @route   GET /api/public/materias
// @access  Public
exports.getPublicMaterias = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: MATERIAS_ESFM
    });
  } catch (error) {
    next(error);
  }
};
