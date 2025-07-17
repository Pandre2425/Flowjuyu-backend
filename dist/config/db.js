"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
console.log("🔍 DB_PASSWORD:", process.env.DB_PASSWORD, typeof process.env.DB_PASSWORD);
exports.sequelize = new sequelize_1.Sequelize(process.env.DB_NAME || "", process.env.DB_USER || "", process.env.DB_PASSWORD || "", {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    dialect: "postgres",
    logging: false,
});
