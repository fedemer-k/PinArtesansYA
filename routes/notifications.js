const express = require("express")
const router = express.Router()
const notificationsController = require("../controllers/notificationsController")
const { requireAuth } = require("../middleware/auth")

// Rutas de notificaciones (requieren autenticación)
router.get("/", requireAuth, notificationsController.getNotificationsPage)
router.post("/:id/read", requireAuth, notificationsController.markAsRead)
router.post("/mark-all-read", requireAuth, notificationsController.markAllAsRead)

// Ruta para responder solicitudes de seguimiento
router.post("/follow-request/:requestId", requireAuth, notificationsController.respondFollowRequest)

module.exports = router
