// routes/auth.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10');
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// contraseña fuerte: min 8, mayúscula, minúscula, número y símbolo
const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.,;:_\-]).{8,}$/;

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Faltan campos' });

    if (!strongRegex.test(password)) {
      return res.status(400).json({
        message: 'Contraseña inválida. Debe tener mínimo 8 caracteres, mayúscula, minúscula, número y símbolo.'
      });
    }

    const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const insert = `INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email`;
    const { rows } = await db.query(insert, [email, hash]);

    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ message: 'Usuario ya existe' });
    console.error(err);
    res.status(500).json({ message: 'Error interno' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Faltan campos' });

    const q = 'SELECT * FROM users WHERE email = $1 LIMIT 1';
    const { rows } = await db.query(q, [email]);
    const user = rows[0];
    if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ message: 'Credenciales inválidas' });

    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });
    res.json({ token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error interno' });
  }
});

module.exports = router;


