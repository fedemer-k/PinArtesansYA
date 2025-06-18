const { Image } = require("../models/gallery")
const { Seguimiento } = require("../models/social")

exports.getHomePage = async (req, res) => {
  try {
    let images = []
    let follows = []

    if (req.user) {
      // Obtener imágenes de usuarios seguidos
      images = await Image.getFromFollowing(req.user.id)
      // Obtener usuarios seguidos
      follows = await Seguimiento.getFollowing(req.user.id)
    } else {
      // Si no está logueado, mostrar imágenes públicas
      images = await Image.getPublic()
      follows = []
    }

    // Redirecciono a mi servidor VPS
    res.redirect(`http://31.97.168.8:3000/`)

    res.render("index", {
      title: "PinArtesans - Galería de Arte y Artesanías",
      images: images,
      follows: follows,
      searchMode: false,
    })
  } catch (error) {
    console.error("Error al cargar la página principal:", error)
    res.status(500).render("errors/500", {
      title: "Error del servidor - PinArtesans",
    })
  }
}
