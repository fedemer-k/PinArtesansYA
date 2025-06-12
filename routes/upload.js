const express = require("express")
const router = express.Router()
const multer = require("multer")
const path = require("path")
const uploadController = require("../controllers/uploadController")
const { requireAuth } = require("../middleware/auth")

// Configuración de Multer para subida de imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "..", "public", "uploads", "images")
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, "image-" + uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: Number.parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB por defecto
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true)
    } else {
      cb(new Error("Solo se permiten archivos de imagen"), false)
    }
  },
})

// Rutas de subida (requieren autenticación)
router.get("/", requireAuth, uploadController.getUploadPage)
router.post("/", requireAuth, upload.single("image"), uploadController.processUpload)

module.exports = router
