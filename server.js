// Cargar variables de entorno
require("dotenv").config()

const express = require("express")
const path = require("path")
const cookieParser = require("cookie-parser")
const fs = require("fs")
const { testConnection } = require("./config/database")
const { getCurrentUser } = require("./middleware/auth")

const app = express()
const PORT = process.env.PORT || 3000

// Crear directorios necesarios para uploads
const uploadsDir = path.join(__dirname, "public", "uploads")
const profilesDir = path.join(uploadsDir, "profiles")
const imagesDir = path.join(uploadsDir, "images")

// Función para crear directorios de forma recursiva
function createDirectoryIfNotExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
    console.log(`📁 Directorio ${path.relative(__dirname, dirPath)} creado`)
  }
}

// Crear todos los directorios necesarios
createDirectoryIfNotExists(uploadsDir)
createDirectoryIfNotExists(profilesDir)
createDirectoryIfNotExists(imagesDir)

// Importar rutas (manteniendo las existentes y agregando las nuevas)
const indexRoutes = require("./routes/index")
const authRoutes = require("./routes/auth")
const settingsRoutes = require("./routes/settings")
const uploadRoutes = require("./routes/upload")
const albumsRoutes = require("./routes/albums")
const imagesRoutes = require("./routes/images")
const notificationsRoutes = require("./routes/notifications")
const searchRoutes = require("./routes/search")
const apiRoutes = require("./routes/api")
const profileRoutes = require("./routes/profile")

// Configurar motor de plantillas Pug
app.set("view engine", "pug")
app.set("views", path.join(__dirname, "views"))

// Middleware
app.use(express.static(path.join(__dirname, "public")))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Middleware global para obtener usuario actual
app.use(getCurrentUser)

// Usar rutas (manteniendo la estructura original para las principales)
app.use("/", indexRoutes)
app.use("/", authRoutes)

// Rutas modulares con prefijos específicos
app.use("/settings", settingsRoutes)
app.use("/upload", uploadRoutes)
app.use("/albums", albumsRoutes)
app.use("/image", imagesRoutes)
app.use("/notifications", notificationsRoutes)
app.use("/search", searchRoutes)
app.use("/api", apiRoutes)
app.use("/profile", profileRoutes)

// Manejo de errores 404
app.use((req, res, next) => {
  res.status(404).render("errors/404", {
    title: "Página no encontrada - PinArtesans",
  })
})

// Manejo de errores generales
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).render("errors/500", {
    title: "Error del servidor - PinArtesans",
    error: process.env.NODE_ENV === "development" ? err : {},
  })
})

// Iniciar servidor
const startServer = async () => {
  try {
    // Probar conexión a la base de datos
    await testConnection()

    app.listen(PORT, () => {
      console.log(`🚀 Servidor PinArtesans corriendo en http://localhost:${PORT}`)
      console.log(`📊 Entorno: ${process.env.NODE_ENV}`)
      console.log(`🗄️  Base de datos: ${process.env.DB_DATABASE}`)
      console.log(`📁 Directorios de uploads configurados:`)
      console.log(`   - Perfiles: ${path.relative(__dirname, profilesDir)}`)
      console.log(`   - Imágenes: ${path.relative(__dirname, imagesDir)}`)
    })
  } catch (error) {
    console.error("❌ Error al iniciar el servidor:", error)
    process.exit(1)
  }
}

startServer()
