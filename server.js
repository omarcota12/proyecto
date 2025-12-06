import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./config/db.js";
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir frontend
app.use(express.static("public"));

// Rutas
app.use("/auth", authRoutes);

// Fallback SPA
app.get("*", (req, res) => {
  res.sendFile("index.html", { root: "public" });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
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
