const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nombre_completo: {
    type: String,
    required: [true, 'El nombre completo es requerido'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: 6,
    select: false
  },
  rol: {
    type: String,
    enum: ['admin', 'estudiante'],
    default: 'estudiante'
  },
  status_pago: {
    type: String,
    enum: ['pendiente', 'validando', 'activo'],
    default: 'pendiente'
  },
  materias_acceso: {
    type: [String],
    default: []
  },
  comprobante_url: {
    type: String,
    default: null
  },
  foto_perfil: {
    type: String,
    default: null
  },
  fecha_registro: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Encriptar password antes de guardar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Método para comparar passwords
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
