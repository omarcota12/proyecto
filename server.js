const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const sequelize = require("./config/db.js");

const authRoutes = require("./routes/auth.js");
const cryptoRoutes = require("./routes/crypto.js");

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir carpeta public
app.use(express.static(path.join(__dirname, "public")));

// API routes
app.use("/auth", authRoutes);
app.use("/crypto", cryptoRoutes);

// Fallback para SPA
app.get("*", (req, res) => {
  if (req.path.startsWith("/auth") || req.path.startsWith("/crypto")) {
    return res.status(404).json({ error: "Ruta no encontrada" });
  }
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// PORT para Railway
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("Conectado a PostgreSQL correctamente.");

    await sequelize.sync({ alter: true });
    console.log("Modelos sincronizados.");

    app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
  } catch (error) {
    console.error("Error al iniciar:", error);
  }
}

startServer();
