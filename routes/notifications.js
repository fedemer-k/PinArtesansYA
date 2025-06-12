const express = require("express")
const router = express.Router()
const notificationsController = require("../controllers/notificationsController")
const { requireAuth } = require("../middleware/auth")

// Rutas de notificaciones (requieren autenticación)
router.get("/notifications", requireAuth, notificationsController.getNotificationsPage)
router.post("/notifications/:id/read", requireAuth, notificationsController.markAsRead)
router.post("/notifications/mark-all-read", requireAuth, notificationsController.markAllAsRead)

module.exports = router
