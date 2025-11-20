const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexion a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado a MongoDB Atlas'))
  .catch(err => console.error('Error conectando a MongoDB:', err));

// Rutas
app.use('/api/auth', require('./routes/auth-route'));
app.use('/api/users', require('./routes/user-route'));
app.use('/api/projects', require('./routes/project-route'));
app.use('/api/reports', require('./routes/report-route'));
app.use('/api/vacations', require('./routes/vacation-route'));

// Ruta de prueba
app.get('/user', (req, res) => {
  res.json({ message: 'API de Rikimaka funcionando correctamente' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutandose en puerto ${PORT}`);
});