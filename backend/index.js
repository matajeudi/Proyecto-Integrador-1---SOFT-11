// Dependencias
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Importacion de rutas
const authRoute = require('./routes/auth-route');
const userRoute = require('./routes/user-route');
const projectRoute = require('./routes/project-route');
const reportRoute = require('./routes/report-route');
const vacationRoute = require('./routes/vacation-route');


app.use(express.json()); //Habilita el manejo de JSON en las peticiones
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json()); //Habilita el anÃ¡lisis de JSON en las peticiones 
app.use(multer().none()); // Handle multipart/form-data
app.use(cors());

// Conexion a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB Atlas conectado'))
.catch(error => console.log('Ocurrio un error al conectarse con MongoDB: ', error));

// Rutas
app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);
app.use('/api/projects', projectRoute);
app.use('/api/reports', reportRoute);
app.use('/api/vacations', vacationRoute);

app.get('/', (req, res) => {
    res.send('Servidor de Rikimaka en funcionamiento');
});

app.listen(PORT, () => {
    console.log('Servidor corriendo en http://localhost:' + PORT);
});