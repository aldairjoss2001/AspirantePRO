const mongoose = require('mongoose');

const simulacroAttemptSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  simulacro: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Simulacro',
    required: true
  },
  respuestas: [{
    pregunta: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true
    },
    respuesta_seleccionada: {
      type: Number,
      required: true,
      min: 0,
      max: 3
    },
    es_correcta: {
      type: Boolean,
      required: true
    }
  }],
  puntaje: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  tiempo_tomado_minutos: {
    type: Number,
    required: true,
    min: 0
  },
  completado: {
    type: Boolean,
    default: true
  },
  fecha_inicio: {
    type: Date,
    required: true
  },
  fecha_finalizacion: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Índice para búsquedas rápidas por usuario y simulacro
simulacroAttemptSchema.index({ usuario: 1, simulacro: 1, createdAt: -1 });

module.exports = mongoose.model('SimulacroAttempt', simulacroAttemptSchema);
