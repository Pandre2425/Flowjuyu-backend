// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from "express"

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error("Error:", err)
  res.status(500).json({ message: "Error interno del servidor" })
}
