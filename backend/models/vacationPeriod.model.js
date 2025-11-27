const mongoose = require('mongoose');

const vacationPeriodSchema = new mongoose.Schema({
  periodName: {
    type: String,
    required: [true, 'El nombre del periodo es requerido']
  },
  periodStartDate: {
    type: Date,
    required: [true, 'La fecha de inicio es requerida']
  },
  periodEndDate: {
    type: Date,
    required: [true, 'La fecha de fin es requerida']
  },
  periodDescription: {
    type: String
  },
  periodIsActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('VacationPeriod', vacationPeriodSchema);
