import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    if (!nombre || !email || !password) return res.status(400).json({ error: "Faltan campos" });

    const existe = await Usuario.findOne({ where: { email } });
    if (existe) return res.status(400).json({ error: "Correo ya registrado" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await Usuario.create({ nombre, email, password: hashed });

    res.status(201).json({ message: "Usuario registrado", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Faltan campos" });

    const user = await Usuario.findOne({ where: { email } });
    if (!user) return res.status(400).json({ error: "Correo incorrecto" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ error: "Contraseña incorrecta" });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ message: "Login correcto", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno" });
  }
});

export default router;
