const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Middleware de autenticacion
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Token de acceso requerido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-userPassword');
    
    if (!user || !user.userIsActive) {
      return res.status(401).json({ message: 'Usuario no valido' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token invalido' });
  }
};

// Middleware para verificar roles
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    if (!roles.includes(req.user.userRole)) {
      return res.status(403).json({ message: 'No tiene permisos para esta accion' });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles
};