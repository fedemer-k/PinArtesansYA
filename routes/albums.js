const express = require("express")
const router = express.Router()
const albumsController = require("../controllers/albumsController")
const { requireAuth } = require("../middleware/auth")

// Rutas de álbumes (requieren autenticación)
router.get("/", requireAuth, albumsController.getAlbumsPage)
router.get("/:id", requireAuth, albumsController.getAlbumDetail)
router.post("/", requireAuth, albumsController.createAlbum)
router.put("/:id", requireAuth, albumsController.updateAlbum)
router.delete("/:id", requireAuth, albumsController.deleteAlbum)

module.exports = router
