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
const PORT = process.env.PORT || 8080;

// Indica que confíe en el proxy (necesario en Railway, Heroku, etc.)
app.set('trust proxy', 1);

// Middlewares
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(cors());

// Rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,                 // Máximo 100 requests por IP
  standardHeaders: true,    // Devuelve info de límite en headers
  legacyHeaders: false,     // Desactiva headers viejos
});
app.use(limiter);

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/crypto', cryptoRoutes);

// Servir frontend desde public/
app.use(express.static(path.join(__dirname, 'public')));

// Fallback para SPA: cualquier ruta que no sea API
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Server corriendo en puerto ${PORT}`);
  console.log(`Conectado a la DB SQLite: ${db.filename || '/app/database.sqlite'}`);
});
