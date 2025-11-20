const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

// GET - Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const users = await User.find({ userIsActive: true }).select('-userPassword');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo usuarios', error: error.message });
  }
});

// GET - Obtener usuario por ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-userPassword');
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo usuario', error: error.message });
  }
});

// POST - Crear nuevo usuario
router.post('/', async (req, res) => {
  try {
    const { userName, userEmail, userPassword, userRole, userFullName, userDepartment } = req.body;
    
    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ 
      $or: [{ userEmail }, { userName }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Usuario o email ya existe' });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(userPassword, 10);

    const newUser = new User({
      userName,
      userEmail,
      userPassword: hashedPassword,
      userRole,
      userFullName,
      userDepartment
    });

    const savedUser = await newUser.save();
    const userResponse = savedUser.toObject();
    delete userResponse.userPassword;
    
    res.status(201).json(userResponse);
  } catch (error) {
    res.status(400).json({ message: 'Error creando usuario', error: error.message });
  }
});

// PUT - Actualizar usuario
router.put('/:id', async (req, res) => {
  try {
    const { userPassword, ...updateData } = req.body;
    
    if (userPassword) {
      updateData.userPassword = await bcrypt.hash(userPassword, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-userPassword');

    if (!updatedUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: 'Error actualizando usuario', error: error.message });
  }
});

// DELETE - Desactivar usuario (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { userIsActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario desactivado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error desactivando usuario', error: error.message });
  }
});

module.exports = router;