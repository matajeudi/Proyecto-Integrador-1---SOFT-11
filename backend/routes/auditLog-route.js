const express = require('express');
const router = express.Router();
const AuditLog = require('../models/auditLog.model');

// GET - Obtener logs
router.get('/', async (req, res) => {
  try {
    const { limit = 100, action, resource, userId } = req.query;
    
    const filter = {};
    if (action) filter.logAction = action;
    if (resource) filter.logResource = resource;
    if (userId) filter.logUser = userId;
    
    const logs = await AuditLog.find(filter)
      .populate('logUser', 'userName userFullName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      logs: logs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo logs',
      error: error.message
    });
  }
});

module.exports = router;
