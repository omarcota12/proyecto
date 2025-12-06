import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./config/db.js";
import authRoutes from "./routes/auth.js";
import cryptoRoutes from "./routes/crypto.js";
import path from "path";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir frontend desde la carpeta public
app.use(express.static("public"));

// Rutas API
app.use("/api/auth", authRoutes);
app.use("/api/crypto", cryptoRoutes);

// Fallback para SPA (React/Angular o HTML simple)
app.get("*", (req, res) => {
  res.sendFile(path.resolve("public/index.html"));
});

// Iniciar servidor
const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Conectado a PostgreSQL.");

    // Sincronizar modelos (Usuarios, etc.)
    await sequelize.sync({ alter: true });
    console.log("Modelos sincronizados.");

    app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
  } catch (err) {
    console.error("Error al iniciar:", err);
  }
})();
