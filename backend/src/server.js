require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/error');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const contentRoutes = require('./routes/contentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const publicRoutes = require('./routes/publicRoutes');
const simulacroRoutes = require('./routes/simulacroRoutes');

// Conectar a la base de datos
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Montar rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api', contentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/simulacros', simulacroRoutes);

// Ruta de prueba
app.get('/api', (req, res) => {
  res.json({ 
    message: 'API de AspirantePro funcionando',
    version: '1.0.0'
  });
});

// Manejador de errores
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Servidor corriendo en modo ${process.env.NODE_ENV} en el puerto ${PORT}`);
});

// Manejar rechazos de promesas no manejadas
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;
