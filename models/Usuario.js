// /models/Usuario.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

// Definimos el modelo y forzamos que use la tabla 'usuarios' en la DB
const Usuario = sequelize.define(
  "Usuario",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "Usuarios", // nombre exacto de la tabla en Railway
    timestamps: true,      // opcional, si quieres createdAt y updatedAt
  }
);

export default Usuario;
