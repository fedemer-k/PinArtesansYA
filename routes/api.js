const express = require("express")
const router = express.Router()
const galleryController = require("../controllers/galleryController")
const notificationsController = require("../controllers/notificationsController")
const { requireAuth } = require("../middleware/auth")

// Rutas de API para galería
router.get("/images", galleryController.getMoreImages)
router.post("/images/:id/like", requireAuth, galleryController.likeImage)

// Rutas de API para notificaciones (requieren autenticación)
router.get("/notifications/count", requireAuth, notificationsController.getNotificationsCount)
router.get("/notifications/recent", requireAuth, notificationsController.getRecentNotifications)

module.exports = router
