const mongoose = require('mongoose');

const simulacroSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: [true, 'El título es requerido'],
    trim: true
  },
  descripcion: {
    type: String,
    trim: true
  },
  materia: {
    type: String,
    required: [true, 'La materia es requerida'],
    trim: true
  },
  numero_preguntas: {
    type: Number,
    required: [true, 'El número de preguntas es requerido'],
    min: 1
  },
  duracion_minutos: {
    type: Number,
    required: [true, 'La duración es requerida'],
    min: 1
  },
  preguntas: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz'
  }],
  publicado: {
    type: Boolean,
    default: false
  },
  fecha_inicio: {
    type: Date,
    default: null
  },
  fecha_expiracion: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Virtual para verificar si el simulacro está activo
simulacroSchema.virtual('isActive').get(function() {
  if (!this.publicado) return false;
  
  const now = new Date();
  
  if (this.fecha_inicio && now < this.fecha_inicio) {
    return false;
  }
  
  if (this.fecha_expiracion && now > this.fecha_expiracion) {
    return false;
  }
  
  return true;
});

// Configurar virtuals para incluir en JSON
simulacroSchema.set('toJSON', { virtuals: true });
simulacroSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Simulacro', simulacroSchema);
