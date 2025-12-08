import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const LoginAttempt = sequelize.define("LoginAttempt", {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ip: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: false, // Ej: "contraseña incorrecta", "usuario no existe"
  }
}, {
  timestamps: true // guarda fecha y hora automáticamente
});

export default LoginAttempt;
