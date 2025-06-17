const User = require("../models/user")
const { requireAuth } = require("../middleware/auth")
const multer = require("multer")
const path = require("path")

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/profiles/")
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, "profile-" + uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true)
    } else {
      cb(new Error("Solo se permiten archivos de imagen"))
    }
  },
})

exports.getSettingsPage = [
  requireAuth,
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id)
      if (!user) {
        return res.redirect("/login")
      }

      res.render("settings", {
        title: "Configuración - PinArtesans",
        user: user,
      })
    } catch (error) {
      console.error("Error al cargar configuración:", error)
      res.status(500).render("errors/500", {
        title: "Error del servidor - PinArtesans",
      })
    }
  },
]

exports.updateSettings = [
  requireAuth,
  upload.single("profileImage"),
  async (req, res) => {
    try {
      const { interests, showcaseMode } = req.body
      const userId = req.user.id

      const user = await User.findById(userId)
      if (!user) {
        return res.redirect("/login")
      }

      // Preparar datos para actualizar
      const updateData = {
        nombre: user.nombre,
        email: user.email,
        imagen_perfil: user.imagen_perfil,
        intereses: interests,
        modo_vitrina: parseInt(showcaseMode, 10)
      }

      // Procesar imagen de perfil si se subió una nueva
      if (req.file) {
        updateData.imagen_perfil = `/uploads/profiles/${req.file.filename}`
      }

      // Actualizar usuario
      await User.update(userId, updateData)

      // Actualizar modo vitrina si cambió
      if (showcaseMode !== undefined) {
        await User.toggleShowcaseMode(userId, showcaseMode === "on")
      }

      // Obtener usuario actualizado
      const updatedUser = await User.findById(userId)

      res.render("settings", {
        title: "Configuración - PinArtesans",
        user: updatedUser,
        success: "Configuración actualizada correctamente",
      })
    } catch (error) {
      console.error("Error al actualizar configuración:", error)

      const user = await User.findById(req.user.id)
      res.render("settings", {
        title: "Configuración - PinArtesans",
        user: user,
        error: "Error al actualizar la configuración",
      })
    }
  },
]
