const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  tipo: {
    type: String,
    enum: ['libro', 'examen_pasado', 'tip'],
    required: [true, 'El tipo de contenido es requerido']
  },
  titulo: {
    type: String,
    required: [true, 'El título es requerido'],
    trim: true
  },
  url_archivo: {
    type: String,
    required: [true, 'La URL del archivo es requerida']
  },
  categoria: {
    type: String,
    required: [true, 'La categoría es requerida'],
    trim: true
  },
  descripcion: {
    type: String,
    default: ''
  },
  visible: {
    type: Boolean,
    default: true
  },
  fecha_subida: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Content', contentSchema);
