const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: [true, 'El título es requerido'],
    trim: true
  },
  mensaje: {
    type: String,
    required: [true, 'El mensaje es requerido'],
    trim: true
  },
  tipo: {
    type: String,
    enum: ['info', 'warning', 'success', 'error'],
    default: 'info'
  },
  activo: {
    type: Boolean,
    default: true
  },
  fecha_creacion: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
