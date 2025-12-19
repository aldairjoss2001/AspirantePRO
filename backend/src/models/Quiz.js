const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  pregunta: {
    type: String,
    required: [true, 'La pregunta es requerida'],
    trim: true
  },
  opciones: {
    type: [String],
    required: [true, 'Las opciones son requeridas'],
    validate: {
      validator: function(v) {
        return v && v.length === 4;
      },
      message: 'Debe haber exactamente 4 opciones'
    }
  },
  respuesta_correcta: {
    type: Number,
    required: [true, 'La respuesta correcta es requerida'],
    min: 0,
    max: 3
  },
  explicacion: {
    type: String,
    required: [true, 'La explicación es requerida'],
    trim: true
  },
  categoria: {
    type: String,
    required: [true, 'La categoría es requerida'],
    trim: true
  },
  materia: {
    type: String,
    required: [true, 'La materia es requerida'],
    trim: true
  },
  dificultad: {
    type: String,
    enum: ['fácil', 'media', 'difícil'],
    default: 'media'
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Quiz', quizSchema);
