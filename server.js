require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const path = require('path');

const db = require('./db'); // Inicializa tu DB
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
  max: 100, // máximo 100 requests por IP
});
app.use(limiter);

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/crypto', cryptoRoutes);

// Servir frontend desde la carpeta public/
app.use(express.static(path.join(__dirname, 'public')));

// Fallback SPA: todas las rutas que no sean API van al index.html
app.get('*', (req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    // Si es ruta API inválida, respondemos con 404 JSON
    return res.status(404).json({ message: 'Ruta API no encontrada' });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => console.log(`Server corriendo en puerto ${PORT}`));
