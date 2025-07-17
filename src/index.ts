import express from "express"
import cors from "cors"
import helmet from "helmet"
import session from "express-session"
import pgSession from "connect-pg-simple"
import { sequelize } from "./config/db"
import authRoutes from "./routes/auth.routes"
import vendedorRoutes from "./routes/vendedor" 
import dotenv from "dotenv"
import { Pool } from "pg"
import { errorHandler } from "./middleware/errorHandler"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 8800

const PgSession = pgSession(session)

app.use(cors({ origin: "http://localhost:3000", credentials: true }))
app.use(helmet())
app.use(express.json())
app.use("/vendedor", vendedorRoutes)


// Sesiones con pg
app.use(
  session({
    store: new PgSession({
      pool: new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: Number(process.env.DB_PORT),
      }),
      tableName: "sessions",
    }),
    secret: process.env.JWT_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 día
      secure: false,
      httpOnly: true,
      sameSite: "lax",
    },
  })
)

app.use("/api", authRoutes)
app.use("/api/vendedor", vendedorRoutes) // ✅ integrar aquí

sequelize
  .authenticate()
  .then(() => {
    console.log(" Conectado a la base de datos")
    app.listen(PORT, () => {
      console.log(` Servidor corriendo en http://localhost:${PORT}`)
    })
  })
  .catch((err) => {
    console.error(" Error de conexión a la base de datos:", err)
  })

app.use(errorHandler)
