const User = require("../models/user")
const { requireAuth } = require("../middleware/auth")
const { upload, handleMulterError } = require("../config/multer")

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
  handleMulterError,
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
        modo_vitrina: Number.parseInt(showcaseMode, 10),
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
