import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./config/db.js";
import authRoutes from "./routes/auth.js";
import cryptoRoutes from "./routes/crypto.js";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir frontend (carpeta public)
app.use(express.static("public"));

// Rutas de API
app.use("/auth", authRoutes);
app.use("/crypto", cryptoRoutes);

// Fallback para SPA (sirve index.html para cualquier ruta no API)
app.get("*", (req, res) => {
  if (req.path.startsWith("/auth") || req.path.startsWith("/crypto")) {
    return res.status(404).json({ error: "Ruta no encontrada" });
  }
  res.sendFile("index.html", { root: "public" });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("Conectado a PostgreSQL correctamente.");

    await sequelize.sync({ alter: true });
    console.log("Modelos sincronizados.");

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
    });
  } catch (error) {
    console.error("Error al iniciar:", error);
  }
}

startServer();
