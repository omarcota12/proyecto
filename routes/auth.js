// routes/auth.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10');
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Registro
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Faltan campos' });
    // Validaciones básicas (longitud & formato)
    if (password.length < 8) return res.status(400).json({ message: 'Contraseña muy corta (>=8)' });
    // hash
    const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const stmt = `INSERT INTO users(email, password_hash) VALUES (?, ?)`;
    db.run(stmt, [email, hash], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) return res.status(409).json({ message: 'Usuario ya existe' });
        console.error(err);
        return res.status(500).json({ message: 'Error en la base de datos' });
      }
      return res.status(201).json({ id: this.lastID, email });
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error interno' });
  }
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'Faltan campos' });
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) return res.status(500).json({ message: 'Error DB' });
    if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ message: 'Credenciales inválidas' });
    // emitir token
    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });
    res.json({ token });
  });
});

module.exports = router;
