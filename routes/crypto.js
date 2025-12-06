import express from "express";
import { hyperEncrypt, hyperDecrypt } from "../algoritmo/hyper.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware JWT simple
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Token requerido" });
  const token = authHeader.split(" ")[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido" });
  }
}

// Encriptar
router.post("/encrypt", authMiddleware, (req, res) => {
  const { plain, password } = req.body;
  if (!plain || !password) return res.status(400).json({ error: "Texto y clave requeridos" });
  try {
    const cipher = hyperEncrypt(plain, password);
    res.json({ cipher });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al encriptar" });
  }
});

// Desencriptar
router.post("/decrypt", authMiddleware, (req, res) => {
  const { cipher, password } = req.body;
  if (!cipher || !password) return res.status(400).json({ error: "Criptograma y clave requeridos" });
  try {
    const plain = hyperDecrypt(cipher, password);
    res.json({ plain });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al desencriptar" });
  }
});

export default router;


