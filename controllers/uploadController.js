const { requireAuth } = require("../middleware/auth")
const { Album, Image } = require("../models/gallery")
const { ImagenCompartida } = require("../models/sharing")
const { Seguimiento } = require("../models/social")
const multer = require("multer")
const path = require("path")
const fs = require("fs")

// Configuración de multer para subida de imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "public/uploads/images/"

    // Crear directorio si no existe
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
      console.log(`📁 Directorio ${uploadPath} creado`)
    }

    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, "image-" + uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true)
    } else {
      cb(new Error("Solo se permiten archivos de imagen"))
    }
  },
})

exports.getUploadPage = [
  requireAuth,
  async (req, res) => {
    try {
      const albums = await Album.getByUser(req.user.id)
      const followers = await Seguimiento.getFollowers(req.user.id)

      res.render("upload", {
        title: "Subir Imágenes - PinArtesans",
        albums: albums,
        followers: followers,
      })
    } catch (error) {
      console.error("Error al cargar página de subida:", error)
      res.status(500).render("errors/500", {
        title: "Error del servidor - PinArtesans",
      })
    }
  },
]

exports.processUpload = [
  requireAuth,
  upload.array("images", 10), // Máximo 10 imágenes
  async (req, res) => {
    try {
      const { albumId, newAlbumName, imageSettings } = req.body
      const userId = req.user.id

      let targetAlbumId = albumId

      // Crear nuevo álbum si se especificó
      if (!albumId && newAlbumName) {
        // Verificar que no exista un álbum con ese nombre
        const existingAlbum = await Album.findByNameAndUser(newAlbumName, userId)
        if (existingAlbum) {
          return res.status(400).json({
            success: false,
            message: "Ya existe un álbum con ese nombre",
          })
        }

        const newAlbum = await Album.create({
          titulo: newAlbumName,
          id_usuario: userId,
        })
        targetAlbumId = newAlbum.id_album
      }

      if (!targetAlbumId) {
        return res.status(400).json({
          success: false,
          message: "Debe seleccionar un álbum o crear uno nuevo",
        })
      }

      // Procesar cada imagen subida
      const uploadedImages = []
      const imageSettingsArray = JSON.parse(imageSettings || "[]")

      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i]
        const settings = imageSettingsArray[i] || { privacy: "1", title: "", description: "", sharedUsers: [] }

        // Crear imagen en la base de datos
        const image = await Image.create({
          titulo: settings.title || `Imagen ${i + 1}`,
          descripcion: settings.description || "",
          ruta_imagen: `/uploads/images/${file.filename}`,
          privacidad: Number.parseInt(settings.privacy),
          id_album: targetAlbumId,
        })

        // Si es privacidad 3 (usuario específico), guardar en ImagenCompartida
        if (settings.privacy === "3" && settings.sharedUsers && Array.isArray(settings.sharedUsers)) {
          for (const sharedUserId of settings.sharedUsers) {
            await ImagenCompartida.create({
              id_imagen: image.id_imagen,
              id_usuario: userId,
              id_usuarioacompartir: sharedUserId,
            })
          }
        }

        uploadedImages.push(image)
      }

      res.json({
        success: true,
        message: `${uploadedImages.length} imagen(es) subida(s) correctamente`,
        images: uploadedImages,
      })
    } catch (error) {
      console.error("Error al procesar subida:", error)
      res.status(500).json({
        success: false,
        message: "Error al subir imágenes",
      })
    }
  },
]
