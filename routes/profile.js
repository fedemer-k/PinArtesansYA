const express = require("express")
const router = express.Router()
const multer = require("multer")
const path = require("path")
const { requireAuth } = require("../middleware/auth")

// Configuración de Multer para fotos de perfil
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "..", "public", "uploads", "profiles")
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, "profile-" + uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: Number.parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true)
    } else {
      cb(new Error("Solo se permiten archivos de imagen"), false)
    }
  },
})

// Rutas de perfil
router.get("/", requireAuth, (req, res) => {
  // Mostrar perfil del usuario actual
  res.render("profile", {
    title: "Mi Perfil - PinArtesans",
    user: req.user,
  })
})

router.get("/:username", (req, res) => {
  // Mostrar perfil de otro usuario
  res.render("profile", {
    title: `Perfil de ${req.params.username} - PinArtesans`,
    profileUser: req.params.username,
  })
})

router.post("/avatar", requireAuth, upload.single("avatar"), (req, res) => {
  // Actualizar foto de perfil
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No se subió ningún archivo" })
  }

  // Aquí iría la lógica para actualizar la foto de perfil en la base de datos
  res.json({
    success: true,
    message: "Foto de perfil actualizada",
    avatarUrl: `/uploads/profiles/${req.file.filename}`,
  })
})

module.exports = router
