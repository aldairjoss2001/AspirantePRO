const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  qr_code_url: {
    type: String,
    default: null
  },
  qr_code_text: {
    type: String,
    default: 'Escanea este código QR para realizar el pago de 15 Bs.'
  },
  whatsapp_number: {
    type: String,
    default: '+59160572616'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);
