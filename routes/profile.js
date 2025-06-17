const express = require("express")
const router = express.Router()
const { requireAuth } = require("../middleware/auth")
const { upload, handleMulterError } = require("../config/multer")
const profileController = require("../controllers/profileController")
const { Seguimiento } = require("../models/social")
const { Notificacion } = require("../models/social")
const User = require("../models/user")

// Rutas de perfil
router.get("/", requireAuth, profileController.getOwnProfile)

// Ruta para ver el perfil de un usuario específico
router.get("/:username", requireAuth, profileController.getProfile)

// Ruta para seguir a un usuario
router.post("/:userId/follow", requireAuth, async (req, res) => {
  try {
    const targetUserId = req.params.userId
    const currentUserId = req.user.id

    if (currentUserId == targetUserId) {
      return res.status(400).send("No puedes seguirte a ti mismo")
    }

    // Verificar si ya existe una solicitud o seguimiento
    const existingFollow = await Seguimiento.findByUsers(currentUserId, targetUserId)
    if (existingFollow) {
      return res.status(400).send("Ya existe una solicitud o seguimiento")
    }

    // Crear solicitud de seguimiento
    const followRequest = await Seguimiento.create({
      id_usuario: currentUserId,
      id_usuarioseguido: targetUserId,
      id_estadosolicitud: 3, // Pendiente
    })

    // Crear notificación
    const currentUser = await User.findById(currentUserId)
    const targetUser = await User.findById(currentUserId)
    await Notificacion.create({
      mensaje: `${currentUser.nombre} te ha enviado una solicitud de seguimiento`,
      id_usuario: targetUserId,
      id_tiponotificacion: 1, // Seguimiento
    })

    // Redirigir de vuelta al perfil
    res.redirect(`/profile/${req.query.redirect || targetUser.nombre}`)
  } catch (error) {
    console.error("Error al enviar solicitud de seguimiento:", error)
    res.status(500).send("Error al enviar solicitud")
  }
})

// Ruta para dejar de seguir a un usuario
router.post("/:userId/unfollow", requireAuth, async (req, res) => {
  try {
    const targetUserId = req.params.userId
    const currentUserId = req.user.id

    // Buscar la relación de seguimiento
    const followRelation = await Seguimiento.findByUsers(currentUserId, targetUserId)
    if (!followRelation) {
      return res.status(404).send("No sigues a este usuario")
    }

    // Eliminar la relación de seguimiento
    await Seguimiento.delete(followRelation.id_amistad)

    // Redirigir de vuelta al perfil
    res.redirect(`/profile/${req.query.redirect || targetUserId}`)
  } catch (error) {
    console.error("Error al dejar de seguir:", error)
    res.status(500).send("Error al procesar la solicitud")
  }
})

// Ruta para actualizar avatar usando la configuración centralizada de multer
router.post("/avatar", requireAuth, upload.single("avatar"), handleMulterError, (req, res) => {
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
