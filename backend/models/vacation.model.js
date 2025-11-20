const mongoose = require('mongoose');

const vacationSchema = new mongoose.Schema({
  vacationUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El usuario es requerido']
  },
  vacationStartDate: {
    type: Date,
    required: [true, 'La fecha de inicio es requerida']
  },
  vacationEndDate: {
    type: Date,
    required: [true, 'La fecha de finalizacion es requerida']
  },
  vacationDays: {
    type: Number,
    required: true
  },
  vacationReason: {
    type: String,
    required: [true, 'La razon de la solicitud es requerida']
  },
  vacationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  vacationApprovedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  vacationApprovalDate: {
    type: Date
  },
  vacationComments: {
    type: String
  }
}, {
  timestamps: true
});

// Calcular dias de vacaciones antes de guardar
vacationSchema.pre('save', function(next) {
  if (this.vacationStartDate && this.vacationEndDate) {
    const timeDiff = this.vacationEndDate.getTime() - this.vacationStartDate.getTime();
    this.vacationDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  }
  next();
});

module.exports = mongoose.model('Vacation', vacationSchema);