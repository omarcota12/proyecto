require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

require('./config/db'); // <-- Importa conexión PostgreSQL

const authRoutes = require('./routes/auth');
const cryptoRoutes = require('./routes/crypto');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(cors({ origin: '*' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200
});
app.use(limiter);

app.use('/api/auth', authRoutes);
app.use('/api/crypto', cryptoRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API Encriptación activa con PostgreSQL' });
});

app.listen(PORT, () =>
  console.log(`Server corriendo en http://localhost:${PORT}`)
);
