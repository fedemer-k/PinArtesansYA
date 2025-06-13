const User = require("../models/user")
const Gallery = require("../models/gallery")

// Obtener perfil de usuario
exports.getProfile = async (req, res) => {
  try {
    const username = req.params.username || (req.user ? req.user.username : null)

    if (!username) {
      return res.redirect("/login")
    }

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
    if (req.user && req.user.id !== profileUser.id) {
      isFollowing = await User.isFollowing(req.user.id, profileUser.id)
    }

    // Obtener imágenes del usuario
    const images = await Gallery.getImagesByUser(profileUser.id)

    // Obtener álbumes del usuario
    const albums = await Gallery.getAlbumsByUser(profileUser.id)

    // Contar seguidores
    const followerCount = await User.countFollowers(profileUser.id)

    // Contar imágenes y álbumes
    const imageCount = images.length
    const albumCount = albums.length

    res.render("profile", {
      title: `${profileUser.username} - PinArtesans`,
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
    return res.redirect("/login")
  }

  res.redirect(`/profile/${req.user.username}`)
}
