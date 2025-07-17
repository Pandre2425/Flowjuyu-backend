// src/controllers/auth.controller.ts

import { Request, Response, NextFunction } from "express"
import bcrypt from "bcrypt"
import { User } from "../models/user.model"
import { VendedorPerfil } from "../models/VendedorPerfil"

// ─────────────────────────────────────────────
// Registro general (usado por compradores)
// ─────────────────────────────────────────────
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { nombre, correo, contraseña, rol } = req.body

    const usuarioExistente = await User.findOne({ where: { correo } })
    if (usuarioExistente) {
      res.status(409).json({ message: "El correo ya está registrado" })
      return
    }

    const hash = await bcrypt.hash(contraseña, 10)
    const nuevoUsuario = await User.create({
      nombre,
      correo,
      contraseña: hash,
      rol,
    })

    if (rol === "vendedor") {
      await VendedorPerfil.create({
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.correo,
        telefono: "",
        direccion: "",
        imagen_url: null,
      })
    }

    req.session.user = {
      id: nuevoUsuario.id,
      nombre: nuevoUsuario.nombre,
      correo: nuevoUsuario.correo,
      rol: nuevoUsuario.rol,
    }

    res.status(201).json({
      message: "Usuario registrado correctamente",
      user: req.session.user,
    })
  } catch (error) {
    console.error("Error en register:", error)
    res.status(500).json({ message: "Error al registrar" })
  }
}

// ─────────────────────────────────────────────
// Registro exclusivo para vendedores
// con imágenes y datos de comercio
// ─────────────────────────────────────────────
export const registerVendedor = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.body) {
      res.status(400).json({ message: "Cuerpo de solicitud vacío" })
      return
    }

    const {
      nombre,
      correo,
      contraseña,
      telefono,
      direccion,
      nombreComercio,
      telefonoComercio,
      departamento,
      municipio,
      descripcion,
      dpi,
    } = req.body

    if (!nombre || !correo || !contraseña) {
      res.status(400).json({ message: "Faltan campos obligatorios" })
      return
    }

    const usuarioExistente = await User.findOne({ where: { correo } })
    if (usuarioExistente) {
      res.status(409).json({ message: "El correo ya está registrado" })
      return
    }

    const hash = await bcrypt.hash(contraseña, 10)
    const nuevoUsuario = await User.create({
      nombre,
      correo,
      contraseña: hash,
      rol: "vendedor",
    })

    const files = req.files as {
      [key: string]: Express.Multer.File[] | undefined
    }

    const logo = files["logo"]?.[0]
    const fotoFrente = files["fotoDPIFrente"]?.[0]
    const fotoReverso = files["fotoDPIReverso"]?.[0]
    const selfie = files["selfieConDPI"]?.[0]

    await VendedorPerfil.create({
      id: nuevoUsuario.id,
      nombre: nombreComercio || nombre,
      email: correo,
      telefono: telefonoComercio || telefono || "",
      direccion: direccion || "",
      imagen_url: logo ? `/uploads/vendedores/${logo.filename}` : null,
      nombre_comercio: nombreComercio,
      telefono_comercio: telefonoComercio,
      departamento,
      municipio,
      descripcion,
      dpi,
      foto_dpi_frente: fotoFrente ? `/uploads/vendedores/${fotoFrente.filename}` : null,
      foto_dpi_reverso: fotoReverso ? `/uploads/vendedores/${fotoReverso.filename}` : null,
      selfie_con_dpi: selfie ? `/uploads/vendedores/${selfie.filename}` : null,
    })

    req.session.user = {
      id: nuevoUsuario.id,
      nombre: nuevoUsuario.nombre,
      correo: nuevoUsuario.correo,
      rol: "vendedor",
    }

    res.status(201).json({
      message: "Vendedor registrado correctamente",
      user: req.session.user,
    })
  } catch (error) {
    console.error("Error en registerVendedor:", error)
    res.status(500).json({ message: "Error al registrar vendedor" })
  }
}

// ─────────────────────────────────────────────
// Login
// ─────────────────────────────────────────────
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { correo, contraseña } = req.body

    const usuario = await User.findOne({ where: { correo } })
    if (!usuario) {
      res.status(401).json({ message: "Correo o contraseña incorrectos" })
      return
    }

    const contraseñaValida = await bcrypt.compare(contraseña, usuario.contraseña)
    if (!contraseñaValida) {
      res.status(401).json({ message: "Correo o contraseña incorrectos" })
      return
    }

    req.session.user = {
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
    }

    res.status(200).json({
      message: "Inicio de sesión exitoso",
      user: req.session.user,
    })
  } catch (error) {
    console.error("Error en login:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
}

// ─────────────────────────────────────────────
// Logout
// ─────────────────────────────────────────────
export const logout = (req: Request, res: Response): void => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ message: "Error al cerrar sesión" })
      return
    }
    res.clearCookie("connect.sid")
    res.status(200).json({ message: "Sesión cerrada correctamente" })
  })
}

// ─────────────────────────────────────────────
// Obtener sesión
// ─────────────────────────────────────────────
export const getSession = (req: Request, res: Response): void => {
  if (req.session.user) {
    res.status(200).json({ user: req.session.user })
  } else {
    res.status(401).json({ message: "No autenticado" })
  }
}
