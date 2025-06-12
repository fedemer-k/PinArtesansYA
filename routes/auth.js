const express = require("express")
const router = express.Router()
const authController = require("../controllers/authController")

// Rutas de autenticación únicamente
router.get("/login", authController.getLoginPage)
router.post("/login", authController.processLogin)
router.get("/register", authController.getRegisterPage)
router.post("/register", authController.processRegister)
router.get("/logout", authController.logout)

module.exports = router
