require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const path = require('path');

const db = require('./db'); // inicialización de tu DB
const authRoutes = require('./routes/auth');
const cryptoRoutes = require('./routes/crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(cors()); // permite cualquier origen (puedes restringir si quieres)

// rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/crypto', cryptoRoutes);

// Servir frontend
app.use(express.static(path.join(__dirname, 'public')));

// Fallback para SPA (index.html)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar server
app.listen(PORT, () => console.log(`Server corriendo en http://localhost:${PORT}`));
