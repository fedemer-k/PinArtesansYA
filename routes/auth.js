const express = require("express")
const router = express.Router()
const authController = require("../controllers/authController")
const settingsController = require("../controllers/settingsController")
const notificationsController = require("../controllers/notificationsController")
const searchController = require("../controllers/searchController")
const uploadController = require("../controllers/uploadController")
const albumsController = require("../controllers/albumsController")
const { Image } = require("../models/gallery")

// Rutas de autenticación
router.get("/login", authController.getLoginPage)
router.post("/login", authController.processLogin)
router.get("/register", authController.getRegisterPage)
router.post("/register", authController.processRegister)
router.get("/logout", authController.logout)

// Rutas de configuración
router.get("/settings", settingsController.getSettingsPage)
router.post("/settings", settingsController.updateSettings)

// Rutas de subida de imágenes
router.get("/upload", uploadController.getUploadPage)
router.post("/upload", uploadController.processUpload)

// Rutas de álbumes
router.get("/albums", albumsController.getAlbumsPage)
router.get("/albums/:id", albumsController.getAlbumDetail)
router.post("/albums", albumsController.createAlbum)
router.put("/albums/:id", albumsController.updateAlbum)
router.delete("/albums/:id", albumsController.deleteAlbum)

// Rutas de imágenes
router.put("/images/:id", albumsController.updateImage)
router.delete("/images/:id", albumsController.deleteImage)
router.put("/images/:id/move", albumsController.moveImage)

// Rutas de notificaciones
router.get("/notifications", notificationsController.getNotificationsPage)
router.get("/api/notifications/count", notificationsController.getNotificationsCount)
router.get("/api/notifications/recent", notificationsController.getRecentNotifications)
router.post("/notifications/:id/read", notificationsController.markAsRead)
router.post("/notifications/mark-all-read", notificationsController.markAllAsRead)
router.post("/api/follow/respond/:requestId", notificationsController.respondFollowRequest)

// Rutas de búsqueda y seguimiento
router.get("/api/search/users", searchController.searchUsers)
router.post("/api/follow/:userId", searchController.sendFollowRequest)

// Ruta de búsqueda de contenido
router.get("/api/search/content", async (req, res) => {
  try {
    const { q: query } = req.query
    const userId = req.user ? req.user.id : null

    if (!query || query.trim().length < 2) {
      return res.json([])
    }

    const images = await Image.searchImages(query.trim(), userId)
    res.json(images)
  } catch (error) {
    console.error("Error en búsqueda de contenido:", error)
    res.status(500).json({
      success: false,
      message: "Error al buscar contenido",
    })
  }
})

// Importar el controlador de imágenes
const imageController = require("../controllers/imageController")

// Rutas de vista de imagen
router.get("/image/:id", imageController.getImageView)
router.post("/image/:id/comment", imageController.addComment)
router.delete("/comment/:commentId", imageController.deleteComment)

// API para obtener datos de imagen
router.get("/api/image/:id", async (req, res) => {
  try {
    const imageId = req.params.id
    const userId = req.user ? req.user.id : null

    const image = await Image.findByIdWithOwner(imageId)
    if (!image || image.owner_id !== userId) {
      return res.status(404).json({
        success: false,
        message: "Imagen no encontrada",
      })
    }

    // Obtener usuarios compartidos si es privacidad 3
    let sharedUsers = []
    if (image.privacidad === 3) {
      const { ImagenCompartida } = require("../models/sharing")
      const shared = await ImagenCompartida.getSharedUsers(imageId)
      sharedUsers = shared.map((u) => u.id_usuario)
    }

    res.json({
      success: true,
      image: {
        ...image,
        sharedUsers,
      },
    })
  } catch (error) {
    console.error("Error al obtener imagen:", error)
    res.status(500).json({
      success: false,
      message: "Error del servidor",
    })
  }
})

module.exports = router
