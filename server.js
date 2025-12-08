import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./config/db.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.js";
import cryptoRoutes from "./routes/crypto.js";

dotenv.config();

const app = express();

// Necesario para express-rate-limit en Railway
app.set("trust proxy", 1);

// Crear __dirname manualmente (ESM fix)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares de seguridad
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting global
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// Servir frontend
app.use(express.static(path.join(__dirname, "public")));

// Rutas API
app.use("/api/auth", authRoutes);
app.use("/api/crypto", cryptoRoutes);

// Fallback frontend (pero ignorar APIs)
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Iniciar servidor
const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Conectado a PostgreSQL.");
    await sequelize.sync({ alter: true });
    console.log("Modelos sincronizados.");
    app.listen(PORT, () =>
      console.log(`Servidor corriendo en puerto ${PORT}`)
    );
  } catch (err) {
    console.error("Error al iniciar:", err);
  }
})();
