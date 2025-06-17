const express = require("express")
const router = express.Router()
const searchController = require("../controllers/searchController")
const { getCurrentUser } = require("../middleware/auth")
const { Image } = require("../models/gallery")

// Ruta de búsqueda de contenido (pública) - GET
router.get("/", searchController.searchContent)

// Nueva ruta para búsqueda de usuarios - POST
router.post("/", getCurrentUser, searchController.searchUsersPage)

// API de búsqueda de contenido
router.get("/api/search/content", async (req, res) => {
  try {
    const { q: query } = req.query
    const userId = req.user ? req.user.id : null

    if (!query || query.trim().length < 2) {
      return res.json([])
    }

    const images = await Image.searchImages(query.trim(), userId)
    res.json(images)
  } catch (error) {
    console.error("Error en búsqueda de contenido:", error)
    res.status(500).json({
      success: false,
      message: "Error al buscar contenido",
    })
  }
})

module.exports = router
