// src/routes/auth.routes.ts

import { Router } from "express"
import {
  register,
  login,
  logout,
  getSession,
  registerVendedor,
} from "../controllers/auth.controller"
import { upload } from "../middleware/multerConfig" 

const router = Router()

// ───── Rutas de autenticación ─────
router.post("/register", register)

// Registro de vendedor con imagen (logo)
router.post(
  "/register/seller",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "fotoDPIFrente", maxCount: 1 },
    { name: "fotoDPIReverso", maxCount: 1 },
    { name: "selfieConDPI", maxCount: 1 },
  ]),
  registerVendedor
)

router.post("/login", login)
router.post("/logout", logout)
router.get("/session", getSession)

export default router
