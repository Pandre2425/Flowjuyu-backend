// src/routes/vendedor.ts

import { Router, Request, Response } from "express"
import multer from "multer"
import path from "path"
import fs from "fs"
import { sequelize } from "../config/db"
import { QueryTypes } from "sequelize"


const router = Router()

// Configuración de multer para guardar archivos en uploads/vendedores
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, "../../uploads/vendedores"))
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true)
    else cb(new Error("Solo se permiten imágenes"))
  },
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
})

// Ruta: POST /vendedor/perfil
router.post("/perfil", upload.single("logo"), async (req: Request, res: Response) => {
  try {
    const { id, nombre, email, telefono, direccion } = req.body
    const archivo = req.file

    const [result]: any = await sequelize.query(
      "SELECT imagen_url FROM seller_profile WHERE id = $1",
      { bind: [id], type: QueryTypes.SELECT }
    )

    // Si existía imagen previa
    if (result?.imagen_url) {
      const ruta = path.join(__dirname, "../../uploads/vendedores", path.basename(result.imagen_url))
      if (fs.existsSync(ruta)) fs.unlinkSync(ruta)
    }

    const nuevaURL = archivo ? `/uploads/vendedores/${archivo.filename}` : null

    await sequelize.query(
      `INSERT INTO seller_profile (id, nombre, email, telefono, direccion, imagen_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET
         nombre = EXCLUDED.nombre,
         email = EXCLUDED.email,
         telefono = EXCLUDED.telefono,
         direccion = EXCLUDED.direccion,
         imagen_url = EXCLUDED.imagen_url,
         actualizado_en = CURRENT_TIMESTAMP`,
      { bind: [id, nombre, email, telefono, direccion, nuevaURL] }
    )

    res.status(200).json({ message: "Perfil actualizado correctamente." })
  } catch (error) {
    console.error("Error al guardar perfil vendedor:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
})

export default router
