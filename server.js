import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./config/db.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";

import authRoutes from "./routes/auth.js";
import cryptoRoutes from "./routes/crypto.js";

dotenv.config();

const app = express();

// Seguridad y middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Limiter global (puedes ajustar)
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 200,            // 200 requests por IP por minuto
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// Servir frontend (carpeta public)
app.use(express.static(path.resolve("public")));

// Rutas API
app.use("/api/auth", authRoutes);
app.use("/api/crypto", cryptoRoutes);

// Fallback para SPA / index
app.get("*", (req, res) => {
  res.sendFile(path.resolve("public/index.html"));
});

// Iniciar servidor
const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Conectado a PostgreSQL.");
    await sequelize.sync({ alter: true });
    console.log("Modelos sincronizados.");
    app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
  } catch (err) {
    console.error("Error al iniciar:", err);
  }
})();
