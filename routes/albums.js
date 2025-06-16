const express = require("express")
const router = express.Router()
const albumsController = require("../controllers/albumsController")
const { requireAuth, getCurrentUser } = require("../middleware/auth")

// Rutas de álbumes
router.get("/", requireAuth, albumsController.getAlbumsPage) // Mantener como estaba
router.get("/:id", getCurrentUser, albumsController.getAlbumDetail) // Sin requireAuth para acceso público
router.post("/", requireAuth, albumsController.createAlbum)
router.put("/:id", requireAuth, albumsController.updateAlbum)
router.delete("/:id", requireAuth, albumsController.deleteAlbum)

module.exports = router
