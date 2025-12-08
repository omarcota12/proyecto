import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";

import Usuario from "../models/Usuario.js";
import { registrarIntentoFallido } from "../utils/logger.js";

const router = Router();

// Seguridad
const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

// Rate limiter específico para login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // 10 intentos por IP
  message: { error: "Demasiados intentos. Intenta más tarde." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Función auxiliar para limpiar datos
const sanitize = (text) =>
  String(text).trim().replace(/[<>;]/g, "");

// -----------------------------------------------------
// REGISTER
// -----------------------------------------------------
router.post("/register", async (req, res) => {
  try {
    let { nombre, email, password } = req.body;

    if (!nombre || !email || !password)
      return res.status(400).json({ error: "Faltan campos" });

    nombre = sanitize(nombre);
    email = sanitize(email);

    const existe = await Usuario.findOne({ where: { email } });
    if (existe)
      return res.status(400).json({ error: "Correo ya registrado" });

    const hashed = await bcrypt.hash(password, rounds);

    const user = await Usuario.create({
      nombre,
      email,
      password: hashed,
    });

    res.status(201).json({
      message: "Usuario registrado",
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
      },
    });

  } catch (err) {
    console.error("❌ Error en REGISTER:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// -----------------------------------------------------
// LOGIN (con logging de fallos)
// -----------------------------------------------------
router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    const ip =
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress ||
      "unknown";

    if (!email || !password)
      return res.status(400).json({ error: "Faltan campos" });

    const cleanEmail = sanitize(email);

    const user = await Usuario.findOne({ where: { email: cleanEmail } });

    // → Correo no existe
    if (!user) {
      registrarIntentoFallido({
        correo: cleanEmail,
        ip,
        reason: "correo no encontrado",
      });

      return res
        .status(400)
        .json({ error: "Correo o contraseña incorrectos" });
    }

    // → Contraseña incorrecta
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      registrarIntentoFallido({
        correo: cleanEmail,
        ip,
        nombre: user.nombre,
        reason: "contraseña incorrecta",
      });

      return res
        .status(400)
        .json({ error: "Correo o contraseña incorrectos" });
    }

    // → Login correcto
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      message: "Login correcto",
      token,
      usuario: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
      },
    });

  } catch (err) {
    console.error("❌ Error en LOGIN:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;
