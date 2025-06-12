const express = require("express")
const router = express.Router()
const galleryController = require("../controllers/galleryController")

// Rutas de API
router.get("/images", galleryController.getMoreImages)
router.post("/images/:id/like", galleryController.likeImage)

module.exports = router
