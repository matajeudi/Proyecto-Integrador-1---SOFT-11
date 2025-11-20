const express = require('express');
const router = express.Router();
const { loginUser, registerUser, verifyToken } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// POST - Login de usuario
router.post('/login', loginUser);

// POST - Registro de usuario
router.post('/register', registerUser);

// GET - Verificar token
router.get('/verify', authenticateToken, verifyToken);

module.exports = router;