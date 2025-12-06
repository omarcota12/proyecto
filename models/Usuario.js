import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Usuarios = sequelize.define(
  "Usuarios",
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
    tableName: "Usuarios",
    timestamps: true,
  }
);

export default Usuarios;
