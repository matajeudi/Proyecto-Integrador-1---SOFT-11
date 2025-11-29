const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  projectName: {
    type: String,
    required: [true, 'El nombre del proyecto es requerido'],
    trim: true
  },
  projectDescription: {
    type: String,
    required: [true, 'La descripcion del proyecto es requerida']
  },
  projectBudget: {
    type: Number,
    required: [true, 'El presupuesto es requerido'],
    min: [0, 'El presupuesto debe ser mayor a 0']
  },
  projectEstimatedHours: {
    type: Number,
    default: 0,
    min: [0, 'Las horas estimadas deben ser mayor o igual a 0']
  },
  projectStartDate: {
    type: Date,
    required: [true, 'La fecha de inicio es requerida']
  },
  projectEndDate: {
    type: Date,
    required: [true, 'La fecha de finalizacion es requerida']
  },
  projectStatus: {
    type: String,
    enum: ['planning', 'active', 'completed', 'cancelled'],
    default: 'planning'
  },
  projectAssignedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  projectCreatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);