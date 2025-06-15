const { requireAuth } = require("../middleware/auth")
const { Album, Image } = require("../models/gallery")
const { ImagenCompartida } = require("../models/sharing")
const { Seguimiento } = require("../models/social")
const { upload, handleMulterError } = require("../config/multer")
const fs = require("fs")

exports.getAlbumsPage = [
  requireAuth,
  async (req, res) => {
    try {
      const albums = await Album.getByUserWithImageCount(req.user.id)

      res.render("albums", {
        title: "Mis Álbumes - PinArtesans",
        albums: albums,
      })
    } catch (error) {
      console.error("Error al cargar página de álbumes:", error)
      res.status(500).render("errors/500", {
        title: "Error del servidor - PinArtesans",
      })
    }
  },
]

exports.getAlbumDetail = [
  requireAuth,
  async (req, res) => {
    try {
      const albumId = req.params.id
      const album = await Album.findById(albumId)

      if (!album || album.id_usuario !== req.user.id) {
        return res.status(404).render("errors/404", {
          title: "Álbum no encontrado - PinArtesans",
        })
      }

      const images = await Image.getByAlbumWithDetails(albumId)
      const followers = await Seguimiento.getFollowers(req.user.id)

      res.render("album-detail", {
        title: `${album.titulo} - PinArtesans`,
        album: album,
        images: images,
        followers: followers,
      })
    } catch (error) {
      console.error("Error al cargar detalle del álbum:", error)
      res.status(500).render("errors/500", {
        title: "Error del servidor - PinArtesans",
      })
    }
  },
]

exports.createAlbum = [
  requireAuth,
  async (req, res) => {
    try {
      const { titulo } = req.body
      const userId = req.user.id

      if (!titulo || titulo.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "El título del álbum es requerido",
        })
      }

      // Verificar que no exista un álbum con ese nombre
      const existingAlbum = await Album.findByNameAndUser(titulo.trim(), userId)
      if (existingAlbum) {
        return res.status(400).json({
          success: false,
          message: "Ya existe un álbum con ese nombre",
        })
      }

      const newAlbum = await Album.create({
        titulo: titulo.trim(),
        id_usuario: userId,
      })

      res.json({
        success: true,
        message: "Álbum creado correctamente",
        album: newAlbum,
      })
    } catch (error) {
      console.error("Error al crear álbum:", error)
      res.status(500).json({
        success: false,
        message: "Error al crear álbum",
      })
    }
  },
]

exports.updateAlbum = [
  requireAuth,
  async (req, res) => {
    try {
      const albumId = req.params.id
      const { titulo } = req.body
      const userId = req.user.id

      const album = await Album.findById(albumId)
      if (!album || album.id_usuario !== userId) {
        return res.status(404).json({
          success: false,
          message: "Álbum no encontrado",
        })
      }

      if (!titulo || titulo.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "El título del álbum es requerido",
        })
      }

      // Verificar que no exista otro álbum con ese nombre
      const existingAlbum = await Album.findByNameAndUser(titulo.trim(), userId)
      if (existingAlbum && existingAlbum.id_album !== albumId) {
        return res.status(400).json({
          success: false,
          message: "Ya existe un álbum con ese nombre",
        })
      }

      await Album.update(albumId, { titulo: titulo.trim() })

      res.json({
        success: true,
        message: "Álbum actualizado correctamente",
      })
    } catch (error) {
      console.error("Error al actualizar álbum:", error)
      res.status(500).json({
        success: false,
        message: "Error al actualizar álbum",
      })
    }
  },
]

exports.deleteAlbum = [
  requireAuth,
  async (req, res) => {
    try {
      const albumId = req.params.id
      const userId = req.user.id

      const album = await Album.findById(albumId)
      if (!album || album.id_usuario !== userId) {
        return res.status(404).json({
          success: false,
          message: "Álbum no encontrado",
        })
      }

      // Verificar si el álbum tiene imágenes
      const images = await Image.getByAlbum(albumId)
      if (images.length > 0) {
        return res.status(400).json({
          success: false,
          message: "No se puede eliminar un álbum que contiene imágenes",
        })
      }

      await Album.delete(albumId)

      res.json({
        success: true,
        message: "Álbum eliminado correctamente",
      })
    } catch (error) {
      console.error("Error al eliminar álbum:", error)
      res.status(500).json({
        success: false,
        message: "Error al eliminar álbum",
      })
    }
  },
]

exports.updateImage = [
  requireAuth,
  upload.single("newImage"),
  handleMulterError,
  async (req, res) => {
    try {
      const imageId = req.params.id
      const { titulo, descripcion, privacidad, sharedUsers } = req.body
      const userId = req.user.id

      // Verificar que la imagen pertenece al usuario
      const image = await Image.findByIdWithOwner(imageId)
      if (!image || image.owner_id !== userId) {
        return res.status(404).json({
          success: false,
          message: "Imagen no encontrada",
        })
      }

      // Preparar datos de actualización
      const updateData = {
        titulo: titulo || image.titulo,
        descripcion: descripcion || image.descripcion,
        privacidad: privacidad ? Number.parseInt(privacidad) : image.privacidad,
      }

      // Si se subió una nueva imagen, actualizar la ruta
      if (req.file) {
        // Eliminar imagen anterior si existe
        if (image.ruta_imagen && fs.existsSync(`public${image.ruta_imagen}`)) {
          fs.unlinkSync(`public${image.ruta_imagen}`)
        }
        updateData.ruta_imagen = `/uploads/images/${req.file.filename}`
      }

      await Image.update(imageId, updateData)

      // Manejar usuarios compartidos si la privacidad es 3
      if (updateData.privacidad === 3) {
        // Eliminar compartidos existentes
        await ImagenCompartida.removeAllForImage(imageId)

        // Agregar nuevos usuarios compartidos
        if (sharedUsers) {
          const sharedUsersArray = Array.isArray(sharedUsers) ? sharedUsers : JSON.parse(sharedUsers || "[]")
          for (const sharedUserId of sharedUsersArray) {
            await ImagenCompartida.create({
              id_imagen: imageId,
              id_usuario: userId,
              id_usuarioacompartir: sharedUserId,
            })
          }
        }
      } else {
        // Si no es privacidad 3, eliminar todos los compartidos
        await ImagenCompartida.removeAllForImage(imageId)
      }

      res.json({
        success: true,
        message: "Imagen actualizada correctamente",
      })
    } catch (error) {
      console.error("Error al actualizar imagen:", error)
      res.status(500).json({
        success: false,
        message: "Error al actualizar imagen",
      })
    }
  },
]

exports.deleteImage = [
  requireAuth,
  async (req, res) => {
    try {
      const imageId = req.params.id
      const userId = req.user.id

      // Verificar que la imagen pertenece al usuario
      const image = await Image.findByIdWithOwner(imageId)
      if (!image || image.owner_id !== userId) {
        return res.status(404).json({
          success: false,
          message: "Imagen no encontrada",
        })
      }

      // Eliminar archivo físico
      if (image.ruta_imagen && fs.existsSync(`public${image.ruta_imagen}`)) {
        fs.unlinkSync(`public${image.ruta_imagen}`)
      }

      // Eliminar registros de la base de datos
      await ImagenCompartida.removeAllForImage(imageId)
      await Image.delete(imageId)

      res.json({
        success: true,
        message: "Imagen eliminada correctamente",
      })
    } catch (error) {
      console.error("Error al eliminar imagen:", error)
      res.status(500).json({
        success: false,
        message: "Error al eliminar imagen",
      })
    }
  },
]

exports.moveImage = [
  requireAuth,
  async (req, res) => {
    try {
      const imageId = req.params.id
      const { newAlbumId } = req.body
      const userId = req.user.id

      // Verificar que la imagen pertenece al usuario
      const image = await Image.findByIdWithOwner(imageId)
      if (!image || image.owner_id !== userId) {
        return res.status(404).json({
          success: false,
          message: "Imagen no encontrada",
        })
      }

      // Verificar que el álbum destino pertenece al usuario
      const targetAlbum = await Album.findById(newAlbumId)
      if (!targetAlbum || targetAlbum.id_usuario !== userId) {
        return res.status(404).json({
          success: false,
          message: "Álbum destino no encontrado",
        })
      }

      await Image.moveToAlbum(imageId, newAlbumId)

      res.json({
        success: true,
        message: "Imagen movida correctamente",
      })
    } catch (error) {
      console.error("Error al mover imagen:", error)
      res.status(500).json({
        success: false,
        message: "Error al mover imagen",
      })
    }
  },
]
