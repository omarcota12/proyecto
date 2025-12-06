import express from "express";
const router = express.Router();

router.post("/encrypt", (req, res) => {
  const { texto } = req.body;
  if (!texto) return res.status(400).json({ error: "Texto requerido" });

  const text = texto.split("").reverse().join("");
  res.json({ original: texto, encrypted: text });
});

export default router;

