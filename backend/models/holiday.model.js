const mongoose = require('mongoose');

// Esquema de feriados para la base de datos
const holidaySchema = new mongoose.Schema({
  holidayDate: {
    type: Date,
    required: [true, 'La fecha es requerida'],
    unique: true // No permite fechas duplicadas
  },
  holidayName: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true // Elimina espacios al inicio y final del string
  },
  holidayDescription: {
    type: String,
    trim: true // Elimina espacios al inicio y final del string
  },
  holidayIsActive: {
    type: Boolean,
    default: true // Permite soft delete (no eliminar fisicamente)
  }
}, {
  timestamps: true // Agrega createdAt y updatedAt automaticamente
});

module.exports = mongoose.model('Holiday', holidaySchema);
