const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { hyperEncrypt, hyperDecrypt } = require('../algoritmo/hyper');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: 'No autorizado' });
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ message: 'Formato token inválido' });
  const token = parts[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Token inválido' });
    req.user = decoded;
    next();
  });
}

router.post('/encrypt', authMiddleware, (req, res) => {
  try {
    const { plain, password } = req.body || {};
    if (typeof plain !== 'string' || typeof password !== 'string' || password.length < 1) {
      return res.status(400).json({ message: 'Datos inválidos' });
    }
    const cipher = hyperEncrypt(plain, password);
    res.json({ cipher });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error al encriptar' });
  }
});

router.post('/decrypt', authMiddleware, (req, res) => {
  try {
    const { cipher, password } = req.body || {};
    if (typeof cipher !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Datos inválidos' });
    }
    let plain;
    try {
      plain = hyperDecrypt(cipher, password);
    } catch (err) {
      return res.status(400).json({ message: 'Desencriptación fallida' });
    }
    res.json({ plain });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error al desencriptar' });
  }
});

module.exports = router;

