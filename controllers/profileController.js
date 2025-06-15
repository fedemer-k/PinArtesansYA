const User = require("../models/user")
const { Seguimiento } = require("../models/social")
const Gallery = require("../models/gallery")
const { Image, Album } = require("../models/gallery")

// Reemplazar la función getProfile completa con esta versión mejorada
exports.getProfile = async (req, res) => {
  try {
    // Obtener el nombre de usuario del parámetro
    const username = req.params.username

    // Obtener datos del usuario
    const profileUser = await User.findByUsername(username)

    if (!profileUser) {
      return res.status(404).render("errors/404", {
        title: "Usuario no encontrado - PinArtesans",
        user: req.user,
      })
    }

    // Verificar el estado de la relación entre usuarios
    let followStatus = "none" // 'none', 'following', 'pending'
    if (req.user && req.user.id !== profileUser.id_usuario) {
      const currentUserId = Number.parseInt(req.user.id, 10)
      const profileUserId = Number.parseInt(profileUser.id_usuario, 10)

      if (!isNaN(currentUserId) && !isNaN(profileUserId)) {
        try {
          const followRelation = await Seguimiento.findByUsers(currentUserId, profileUserId)

          if (followRelation) {
            // Estado 1 = siguiendo (aceptado), Estado 3 = pendiente
            followStatus = followRelation.id_estadosolicitud === 1 ? "following" : "pending"
          }
        } catch (error) {
          console.error("Error al verificar estado de seguimiento:", error)
        }
      }
    }

    // Obtener imágenes del usuario (con manejo de errores)
    let images = []
    try {
      // Usar Image.getByUser en lugar de Gallery.getImagesByUser
      images = (await Image.getByUser(profileUser.id_usuario)) || []
    } catch (error) {
      console.error("Error al obtener imágenes:", error)
      images = []
    }

    // Obtener álbumes del usuario (con manejo de errores)
    let albums = []
    try {
      // Usar Album.getByUserWithImageCount en lugar de Gallery.getAlbumsByUser
      albums = (await Album.getByUserWithImageCount(profileUser.id_usuario)) || []
    } catch (error) {
      console.error("Error al obtener álbumes:", error)
      albums = []
    }

    // Contar seguidores (con manejo de errores)
    let followerCount = 0
    try {
      followerCount = await User.countFollowers(profileUser.id_usuario)
    } catch (error) {
      console.error("Error al contar seguidores:", error)
    }

    // Contar imágenes y álbumes
    const imageCount = images.length
    const albumCount = albums.length

    // Renderizar la vista
    res.render("profile", {
      title: `${profileUser.nombre} - PinArtesans`,
      user: req.user,
      profileUser,
      images,
      albums,
      followStatus, // Cambiar isFollowing por followStatus
      followerCount,
      imageCount,
      albumCount,
    })
  } catch (error) {
    console.error("Error al obtener perfil:", error)
    res.status(500).render("errors/500", {
      title: "Error del servidor - PinArtesans",
      user: req.user,
      error: process.env.NODE_ENV === "development" ? error : {},
    })
  }
}

// Obtener perfil propio
exports.getOwnProfile = async (req, res) => {
  if (!req.user) {
    return res.redirect("/login?redirect=/profile")
  }

  res.redirect(`/profile/${req.user.nombre}`)
}
