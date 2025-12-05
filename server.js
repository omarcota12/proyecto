// server.js
require('dotenv').config();
const express = require('express');
const app = express();
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const db = require('./db'); // solo para inicializar
const authRoutes = require('./routes/auth');
const cryptoRoutes = require('./routes/crypto');

const PORT = process.env.PORT || 4000;

// Middlewares
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(cors({ origin: 'http://127.0.0.1:5500' })); // ajusta el origen si usas live-server
// rate limit (ejemplo para endpoints auth)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/crypto', cryptoRoutes);

// ruta raíz simple
app.get('/', (req, res) => res.json({ message: 'API Encriptación activa' }));

app.listen(PORT, () => console.log(`Server corriendo en http://localhost:${PORT}`));
