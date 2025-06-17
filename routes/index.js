const express = require("express")
const router = express.Router()
const homeController = require("../controllers/homeController")
const searchController = require("../controllers/searchController")
const notificationsController = require("../controllers/notificationsController")
const { requireAuth } = require("../middleware/auth")

// Ruta principal
router.get("/", homeController.getHomePage)

// Ruta de búsqueda
router.get("/search", searchController.searchContent)

//Modo API para notificaciones
router.get("/api/notifications/count", requireAuth, notificationsController.getNotificationsCount)
router.get("/api/notifications/recent", requireAuth, notificationsController.getRecentNotifications)

module.exports = router
