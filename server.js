require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const path = require('path');

// Inicializar DB
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db'); // crea DB local si no existe

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
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/crypto', cryptoRoutes);

// Servir frontend
app.use(express.static(path.join(__dirname, 'public')));

// Fallback SPA Express 5
app.get('/:pathMatch(.*)*', (req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ message: 'Ruta API no encontrada' });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Manejo de errores globales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Ocurrió un error en el servidor' });
});

// Iniciar servidor
app.listen(PORT, () => console.log(`Server corriendo en puerto ${PORT}`));
