// routes/crypto.js
import express from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware para verificar token
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: "Token requerido" });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: "Token requerido" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Token inválido" });
  }
}

// Encriptar
router.post("/encrypt", authMiddleware, (req, res) => {
  const { plain, password } = req.body;
  if (!plain || !password) return res.status(400).json({ error: "Texto y contraseña requeridos" });

  try {
    const key = crypto.scryptSync(password, 'salt', 32); // Derivar clave de 32 bytes
    const iv = crypto.randomBytes(16); // Vector de inicialización aleatorio
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

    let encrypted = cipher.update(plain, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    res.json({ cipher: iv.toString('hex') + ':' + encrypted });
  } catch (err) {
    res.status(500).json({ error: "Error al encriptar" });
  }
});

// Desencriptar
router.post("/decrypt", authMiddleware, (req, res) => {
  const { cipher, password } = req.body;
  if (!cipher || !password) return res.status(400).json({ error: "Criptograma y contraseña requeridos" });

  try {
    const [ivHex, encrypted] = cipher.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const key = crypto.scryptSync(password, 'salt', 32);

    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    res.json({ plain: decrypted });
  } catch (err) {
    res.status(400).json({ error: "Contraseña incorrecta o datos corruptos" });
  }
});

export default router;


