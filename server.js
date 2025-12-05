require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const path = require('path');

const db = require('./db'); // inicializa tu DB
const authRoutes = require('./routes/auth');
const cryptoRoutes = require('./routes/crypto');

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(cors());

// Rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de requests por IP
});
app.use(limiter);

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/crypto', cryptoRoutes);

// Servir frontend desde public/ (si tienes archivos estáticos)
app.use(express.static(path.join(__dirname, 'public')));

// Fallback para rutas no encontradas (SPA o API)
app.all('*', (req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    // Si es ruta API que no existe
    return res.status(404).json({ message: 'Ruta API no encontrada' });
  }
  // Si es cualquier otra ruta, servir index.html para SPA
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Manejo de errores generales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Error interno del servidor' });
});

// Iniciar servidor
app.listen(PORT, () => console.log(`Server corriendo en puerto ${PORT}`));
