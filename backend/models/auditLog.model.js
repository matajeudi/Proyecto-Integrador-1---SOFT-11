const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  logUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  logAction: {
    type: String,
    enum: ['LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT'],
    required: true
  },
  logResource: {
    type: String,
    required: true
  },
  logResourceId: {
    type: String
  },
  logDetails: {
    type: String
  },
  logIpAddress: {
    type: String
  },
  logUserAgent: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
