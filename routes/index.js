const express = require("express")
const router = express.Router()
const homeController = require("../controllers/homeController")
const searchController = require("../controllers/searchController")

// Ruta principal
router.get("/", homeController.getHomePage)

// Ruta de búsqueda
router.get("/search", searchController.searchContent)

module.exports = router
