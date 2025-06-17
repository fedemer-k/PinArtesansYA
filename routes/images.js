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


module.exports = router
