const User = require("../models/user")
const Gallery = require("../models/gallery")

// Obtener perfil de usuario
exports.getProfile = async (req, res) => {
  try {
    // Verificar si hay un usuario autenticado
    if (!req.user) {
      return res.redirect("/login?redirect=/profile")
    }

    // Obtener el nombre de usuario del parámetro o del usuario actual
    const username = req.params.username || req.user.nombre

    // Obtener datos del usuario
    const profileUser = await User.findByUsername(username)

    if (!profileUser) {
      return res.status(404).render("errors/404", {
        title: "Usuario no encontrado - PinArtesans",
        user: req.user,
      })
    }

    // Verificar si el usuario actual sigue al usuario del perfil
    let isFollowing = false
    if (req.user.id_usuario !== profileUser.id_usuario) {
      // Asegurarse de que ambos IDs sean números válidos
      const currentUserId = Number.parseInt(req.user.id_usuario, 10)
      const profileUserId = Number.parseInt(profileUser.id_usuario, 10)

      if (!isNaN(currentUserId) && !isNaN(profileUserId)) {
        isFollowing = await User.isFollowing(currentUserId, profileUserId)
      }
    }

    // Obtener imágenes del usuario (con manejo de errores)
    let images = []
    try {
      if (typeof Gallery.getImagesByUser === "function") {
        images = (await Gallery.getImagesByUser(profileUser.id_usuario)) || []
      }
    } catch (error) {
      console.error("Error al obtener imágenes:", error)
    }

    // Obtener álbumes del usuario (con manejo de errores)
    let albums = []
    try {
      if (typeof Gallery.getAlbumsByUser === "function") {
        albums = (await Gallery.getAlbumsByUser(profileUser.id_usuario)) || []
      }
    } catch (error) {
      console.error("Error al obtener álbumes:", error)
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
      isFollowing,
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
