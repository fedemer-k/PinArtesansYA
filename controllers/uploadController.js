const { requireAuth } = require("../middleware/auth")
const { Album, Image } = require("../models/gallery")
const { ImagenCompartida } = require("../models/sharing")
const { Seguimiento } = require("../models/social")
const { upload } = require("../config/multer")
const path = require("path")
const fs = require("fs")

exports.getUploadPage = [
  requireAuth,
  async (req, res) => {
    try {
      const albums = await Album.getByUser(req.user.id)

      res.render("upload", {
        title: "Subir Imágenes - PinArtesans",
        albums: albums,
      })
    } catch (error) {
      console.error("Error al cargar página de subida:", error)
      res.status(500).render("errors/500", {
        title: "Error del servidor - PinArtesans",
      })
    }
  },
]

exports.getConfigPage = [
  requireAuth,
  upload.array("images", 10), // Máximo 10 imágenes
  async (req, res) => {
    try {
      const { albumId, newAlbumName } = req.body
      const followers = await Seguimiento.getFollowers(req.user.id)

      // Verificar que se subieron archivos
      if (!req.files || req.files.length === 0) {
        return res.redirect("/upload?error=No se seleccionaron imágenes")
      }

      // Preparar información de las imágenes para la vista
      const images = req.files.map((file) => ({
        filename: file.filename,
        tempPath: `/uploads/images/${file.filename}`,
        originalName: file.originalname,
      }))

      res.render("upload-config", {
        title: "Configurar Imágenes - PinArtesans",
        images: images,
        albumId: albumId,
        newAlbumName: newAlbumName,
        followers: followers,
      })
    } catch (error) {
      console.error("Error al procesar archivos:", error)
      res.status(500).render("errors/500", {
        title: "Error del servidor - PinArtesans",
      })
    }
  },
]

exports.processUpload = [
  requireAuth,
  async (req, res) => {
    try {
      const { albumId, newAlbumName, images } = req.body
      const userId = req.user.id

      let targetAlbumId = albumId

      // Crear nuevo álbum si se especificó
      if (!albumId && newAlbumName) {
        // Verificar que no exista un álbum con ese nombre
        const existingAlbum = await Album.findByNameAndUser(newAlbumName, userId)
        if (existingAlbum) {
          return res.redirect("/upload?error=Ya existe un álbum con ese nombre")
        }

        const newAlbum = await Album.create({
          titulo: newAlbumName,
          id_usuario: userId,
        })
        targetAlbumId = newAlbum.id_album
      }

      if (!targetAlbumId) {
        return res.redirect("/upload?error=Debe seleccionar un álbum o crear uno nuevo")
      }

      // Procesar cada imagen
      const uploadedImages = []

      for (let i = 0; i < images.length; i++) {
        const imageData = images[i]

        // Crear imagen en la base de datos
        const image = await Image.create({
          titulo: imageData.title || `Imagen ${i + 1}`,
          descripcion: imageData.description || "",
          ruta_imagen: `/uploads/images/${imageData.filename}`,
          privacidad: Number.parseInt(imageData.privacy) || 1,
          id_album: targetAlbumId,
        })

        // Si es privacidad 3 (usuario específico), guardar en ImagenCompartida
        if (imageData.privacy === "3" && imageData.sharedUsers) {
          const sharedUsers = Array.isArray(imageData.sharedUsers) ? imageData.sharedUsers : [imageData.sharedUsers]

          for (const sharedUserId of sharedUsers) {
            await ImagenCompartida.create({
              id_imagen: image.id_imagen,
              id_usuario: userId,
              id_usuarioacompartir: sharedUserId,
            })
          }
        }

        uploadedImages.push(image)
      }

      // Redirigir al álbum creado o actualizado
      res.redirect(`/albums/${targetAlbumId}?success=${uploadedImages.length} imagen(es) subida(s) correctamente`)
    } catch (error) {
      console.error("Error al procesar subida:", error)
      res.status(500).render("errors/500", {
        title: "Error del servidor - PinArtesans",
      })
    }
  },
]
