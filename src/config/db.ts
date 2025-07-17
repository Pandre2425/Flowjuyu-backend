// src/config/db.ts
import dotenv from "dotenv"
dotenv.config() 

import { Sequelize } from "sequelize"

console.log("🔍 DB_PASSWORD:", process.env.DB_PASSWORD, typeof process.env.DB_PASSWORD)

export const sequelize = new Sequelize(
  process.env.DB_NAME || "",
  process.env.DB_USER || "",
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    dialect: "postgres",
    logging: false,
  }
)
