const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

// Login
router.post('/login', async (req, res) => {
    try {
        const { userEmail, userPassword } = req.body;

        // Validar que vengan los datos
        if (!userEmail || !userPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email y contraseña son requeridos' 
            });
        }

        // Buscar usuario por email
        const user = await User.findOne({ userEmail: userEmail.toLowerCase() });

        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Credenciales invalidas' 
            });
        }

        // Verificar contraseña con bcrypt
        const isPasswordValid = await bcrypt.compare(userPassword, user.userPassword);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                success: false, 
                message: 'Credenciales invalidas' 
            });
        }

        // Verificar que el usuario este activo
        if (!user.userIsActive) {
            return res.status(403).json({ 
                success: false, 
                message: 'Usuario inactivo' 
            });
        }

        // Login exitoso
        res.status(200).json({
            success: true,
            message: 'Login exitoso',
            user: {
                id: user._id,
                userName: user.userName,
                userEmail: user.userEmail,
                userRole: user.userRole,
                userFullName: user.userFullName,
                userDepartment: user.userDepartment
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error en el servidor' 
        });
    }
});

module.exports = router;
