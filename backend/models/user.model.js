const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: [true, 'El nombre de usuario es requerido'],
    unique: true,
    trim: true
  },
  userEmail: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email invalido']
  },
  userPassword: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [6, 'La contraseña debe tener minimo 6 caracteres']
  },
  userRole: {
    type: String,
    enum: ['admin', 'worker', 'it'],
    required: [true, 'El rol es requerido']
  },
  userFullName: {
    type: String,
    required: [true, 'El nombre completo es requerido']
  },
  userDepartment: {
    type: String,
    required: true
  },
  userHireDate: {
    type: Date,
    default: Date.now
  },
  userIsActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);