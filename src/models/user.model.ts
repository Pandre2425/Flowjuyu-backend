// src/models/user.model.ts
import { DataTypes, Model, Optional } from "sequelize"
import { sequelize } from "../config/db"

interface UserAttributes {
  id: number
  nombre: string
  correo: string
  contraseña: string
  rol: "comprador" | "vendedor" | "admin"
}

interface UserCreationAttributes extends Optional<UserAttributes, "id"> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number
  public nombre!: string
  public correo!: string
  public contraseña!: string
  public rol!: "comprador" | "vendedor" | "admin"
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    correo: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    contraseña: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rol: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "comprador",
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "usuarios",
    timestamps: false,
  }
)
