const express = require("express")
const router = express.Router()
const settingsController = require("../controllers/settingsController")
const { requireAuth } = require("../middleware/auth")

// Rutas de configuración (requieren autenticación)
router.get("/", requireAuth, settingsController.getSettingsPage)
router.post("/", requireAuth, settingsController.updateSettings)

module.exports = router
