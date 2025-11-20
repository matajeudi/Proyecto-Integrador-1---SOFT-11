const mongoose = require('mongoose');

const dailyReportSchema = new mongoose.Schema({
  reportDate: {
    type: Date,
    required: [true, 'La fecha del reporte es requerida'],
    default: Date.now
  },
  reportUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El usuario es requerido']
  },
  reportActivities: [{
    activityProject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    activityDescription: {
      type: String,
      required: [true, 'La descripcion de la actividad es requerida']
    },
    activityHours: {
      type: Number,
      required: [true, 'Las horas dedicadas son requeridas'],
      min: [0.5, 'Minimo 0.5 horas'],
      max: [24, 'Maximo 24 horas']
    },
    activityStatus: {
      type: String,
      enum: ['completed', 'in-progress', 'blocked'],
      required: true
    }
  }],
  reportTotalHours: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calcular total de horas antes de guardar
dailyReportSchema.pre('save', function(next) {
  this.reportTotalHours = this.reportActivities.reduce((total, activity) => {
    return total + activity.activityHours;
  }, 0);
  next();
});

module.exports = mongoose.model('DailyReport', dailyReportSchema);