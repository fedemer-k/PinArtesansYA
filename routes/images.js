const express = require("express")
const router = express.Router()
const imageController = require("../controllers/imageController")
const albumsController = require("../controllers/albumsController")
const { requireAuth } = require("../middleware/auth")
const { Image } = require("../models/gallery")

// Rutas de imágenes individuales
router.get("/:id", imageController.getImageView)
router.post("/:id/comment", requireAuth, imageController.addComment)
router.delete("/comment/:commentId", requireAuth, imageController.deleteComment)

// Rutas de gestión de imágenes (requieren autenticación)
router.put("/:id", requireAuth, albumsController.updateImage)
router.delete("/:id", requireAuth, albumsController.deleteImage)
router.put("/:id/move", requireAuth, albumsController.moveImage)

// API para obtener datos de imagen
router.get("/api/image/:id", requireAuth, async (req, res) => {
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
