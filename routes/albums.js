const express = require("express")
const router = express.Router()
const albumsController = require("../controllers/albumsController")
const { requireAuth } = require("../middleware/auth")

// Rutas de álbumes (requieren autenticación)
router.get("/albums", requireAuth, albumsController.getAlbumsPage)
router.get("/albums/:id", requireAuth, albumsController.getAlbumDetail)
router.post("/albums", requireAuth, albumsController.createAlbum)
router.put("/albums/:id", requireAuth, albumsController.updateAlbum)
router.delete("/albums/:id", requireAuth, albumsController.deleteAlbum)

module.exports = router
