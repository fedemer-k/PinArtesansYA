const { requireAuth, getCurrentUser } = require("../middleware/auth")
const { Image, Comment, Album } = require("../models/gallery")
const User = require("../models/user")

exports.getImageView = [
  getCurrentUser,
  async (req, res) => {
    try {
      const imageId = req.params.id
      const currentUserId = req.user ? req.user.id : null

      // Buscar la imagen por ID
      const image = await Image.findByIdWithDetails(imageId)
      if (!image) {
        console.error(`Imagen con ID ${imageId} no encontrada`)
        return res.status(404).render("errors/404", {
          title: "Imagen no encontrada - PinArtesans",
          message: "La imagen que estás buscando no existe o ha sido eliminada.",
        })
      }

      // Verificar permisos de visualización
      const canView = await Image.canUserView(imageId, currentUserId)
      if (!canView) {
        console.error(`Usuario ${currentUserId || "anónimo"} intentó acceder a imagen ${imageId} sin permisos`)
        return res.status(403).render("errors/403", {
          title: "Acceso denegado - PinArtesans",
          message: "No tienes permisos para ver esta imagen.",
        })
      }

      // Obtener comentarios de la imagen
      const comments = await Comment.getByImageWithUser(imageId)

      // Obtener información del álbum y usuario
      const album = await Album.findById(image.id_album)
      const owner = await User.findById(album.id_usuario)

      res.render("image-view", {
        title: `${image.titulo || "Imagen"} - PinArtesans`,
        image: image,
        album: album,
        owner: owner,
        comments: comments,
        canComment: !!currentUserId,
      })
    } catch (error) {
      console.error("Error al cargar vista de imagen:", error)
      res.status(500).render("errors/500", {
        title: "Error del servidor - PinArtesans",
      })
    }
  },
]

exports.addComment = [
  requireAuth,
  async (req, res) => {
    try {
      const imageId = req.params.id
      const { comment } = req.body
      const userId = req.user.id

      if (!comment || comment.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "El comentario no puede estar vacío",
        })
      }

      if (comment.trim().length > 500) {
        return res.status(400).json({
          success: false,
          message: "El comentario no puede exceder 500 caracteres",
        })
      }

      // Verificar que la imagen existe y el usuario puede verla
      const canView = await Image.canUserView(imageId, userId)
      if (!canView) {
        return res.status(403).json({
          success: false,
          message: "No tienes permisos para comentar en esta imagen",
        })
      }

      // Crear el comentario
      const newComment = await Comment.create({
        texto: comment.trim(),
        id_imagen: imageId,
        id_usuario: userId,
      })

      // Obtener el comentario con información del usuario
      const commentWithUser = await Comment.getByIdWithUser(newComment.id_comentario)

      res.json({
        success: true,
        comment: commentWithUser,
        message: "Comentario agregado correctamente",
      })
    } catch (error) {
      console.error("Error al agregar comentario:", error)
      res.status(500).json({
        success: false,
        message: "Error al agregar comentario",
      })
    }
  },
]

exports.deleteComment = [
  requireAuth,
  async (req, res) => {
    try {
      const commentId = req.params.commentId
      const userId = req.user.id

      // Verificar que el comentario existe y pertenece al usuario
      const comment = await Comment.findById(commentId)
      if (!comment) {
        return res.status(404).json({
          success: false,
          message: "Comentario no encontrado",
        })
      }

      if (comment.id_usuario !== userId && !req.user.moderador) {
        return res.status(403).json({
          success: false,
          message: "No tienes permisos para eliminar este comentario",
        })
      }

      await Comment.delete(commentId)

      res.json({
        success: true,
        message: "Comentario eliminado correctamente",
      })
    } catch (error) {
      console.error("Error al eliminar comentario:", error)
      res.status(500).json({
        success: false,
        message: "Error al eliminar comentario",
      })
    }
  },
]
