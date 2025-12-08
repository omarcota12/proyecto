import { Router } from "express";
import { hyperEncrypt, hyperDecrypt } from "../algoritmo/hyper.js";
import jwt from "jsonwebtoken";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

// Middleware para verificar token
function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "Token requerido" });
  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token requerido" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}

// Encriptar (requiere autenticación)
router.post("/encrypt", authMiddleware, (req, res) => {
  const { plain, password } = req.body;
  if (!plain || !password) return res.status(400).json({ error: "Texto y contraseña requeridos" });

  try {
    const cipher = hyperEncrypt(plain, password);
    res.json({ cipher });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al encriptar" });
  }
});

// Desencriptar (requiere autenticación)
router.post("/decrypt", authMiddleware, (req, res) => {
  const { cipher, password } = req.body;
  if (!cipher || !password) return res.status(400).json({ error: "Criptograma y contraseña requeridos" });

  try {
    const plain = hyperDecrypt(cipher, password);
    res.json({ plain });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Contraseña incorrecta o datos corruptos" });
  }
});

export default router;
