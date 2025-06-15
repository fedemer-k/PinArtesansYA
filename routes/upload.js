const express = require("express")
const router = express.Router()
const uploadController = require("../controllers/uploadController")
const { requireAuth } = require("../middleware/auth")
const { handleMulterError } = require("../config/multer")

// Rutas de subida (requieren autenticación)
router.get("/", requireAuth, uploadController.getUploadPage)
router.post("/config", requireAuth, handleMulterError, uploadController.getConfigPage)
router.post("/process", requireAuth, uploadController.processUpload)

module.exports = router
