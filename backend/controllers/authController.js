const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Login de usuario
const loginUser = async (req, res) => {
  try {
    const { userEmail, userPassword } = req.body;

    // Verificar si el usuario existe
    const user = await User.findOne({ userEmail, userIsActive: true });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales invalidas' });
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(userPassword, user.userPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciales invalidas' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { userId: user._id, userRole: user.userRole },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Respuesta sin contraseña
    const userResponse = user.toObject();
    delete userResponse.userPassword;

    res.json({
      message: 'Login exitoso',
      token,
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// Registro de usuario
const registerUser = async (req, res) => {
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

    // Crear nuevo usuario
    const newUser = new User({
      userName,
      userEmail,
      userPassword: hashedPassword,
      userRole,
      userFullName,
      userDepartment
    });

    const savedUser = await newUser.save();

    // Generar token JWT
    const token = jwt.sign(
      { userId: savedUser._id, userRole: savedUser.userRole },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Respuesta sin contraseña
    const userResponse = savedUser.toObject();
    delete userResponse.userPassword;

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: userResponse
    });
  } catch (error) {
    res.status(400).json({ message: 'Error registrando usuario', error: error.message });
  }
};

// Verificar token
const verifyToken = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-userPassword');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Error verificando token', error: error.message });
  }
};

module.exports = {
  loginUser,
  registerUser,
  verifyToken
};