const express = require("express")
const router = express.Router()
const settingsController = require("../controllers/settingsController")
const { requireAuth } = require("../middleware/auth")

// Rutas de configuración (requieren autenticación)
router.get("/settings", requireAuth, settingsController.getSettingsPage)
router.post("/settings", requireAuth, settingsController.updateSettings)

module.exports = router
