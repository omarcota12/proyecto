import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";

const router = express.Router();

// Registrar
router.post("/register", async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    const existe = await Usuario.findOne({ where: { email } });
    if (existe) return res.status(400).json({ error: "El correo ya existe" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await Usuario.create({
      nombre,
      email,
      password: hashed
    });

    res.json({ message: "Usuario registrado", user });
  } catch (error) {
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Usuario.findOne({ where: { email } });

    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Contraseña incorrecta" });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d"
    });

    res.json({
      message: "Login correcto",
      token
    });
  } catch (error) {
    res.status(500).json({ error: "Error en el servidor" });
  }
});

export default router;

