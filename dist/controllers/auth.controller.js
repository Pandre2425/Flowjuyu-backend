"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_model_1 = require("../models/user.model");
const register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password || !role) {
            res.status(400).json({ message: "Todos los campos son obligatorios." });
            return;
        }
        const existingUser = await user_model_1.User.findOne({ where: { email } });
        if (existingUser) {
            res.status(409).json({ message: "El correo ya está registrado." });
            return;
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const newUser = await user_model_1.User.create({
            name,
            email,
            password: hashedPassword,
            role,
        });
        res.status(201).json({
            message: "Usuario registrado con éxito.",
            user: {
                id: newUser.id,
                email: newUser.email,
                role: newUser.role,
            },
        });
    }
    catch (error) {
        console.error("Error en registro:", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};
exports.register = register;
