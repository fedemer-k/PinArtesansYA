const User = require("../models/user")
const { Image } = require("../models/gallery")
const { Seguimiento, Notificacion } = require("../models/social")

exports.searchContent = async (req, res) => {
  try {
    const { q: query } = req.query
    const currentUserId = req.user ? req.user.id : null

    // Si no hay consulta, redirigir a la página principal
    if (!query || query.trim().length < 2) {
      return res.redirect("/")
    }

    // Buscar imágenes que coincidan con la consulta
    const images = await Image.searchImages(query.trim(), currentUserId)

    // Obtener usuarios seguidos para la sección de follows
    let follows = []
    if (currentUserId) {
      follows = await Seguimiento.getFollowing(currentUserId)
    }

    // Renderizar la página con los resultados
    res.render("search-results", {
      title: `Búsqueda: ${query} - PinArtesans`,
      query: query,
      images: images,
      follows: follows,
      resultsCount: images.length,
      hasResults: images.length > 0,
    })
  } catch (error) {
    console.error("Error en búsqueda de contenido:", error)
    res.status(500).render("errors/500", {
      title: "Error del servidor - PinArtesans",
    })
  }
}

exports.sendFollowRequest = async (req, res) => {
  try {
    const { userId } = req.params
    const currentUserId = req.user.id

    if (currentUserId == userId) {
      return res.status(400).json({
        success: false,
        message: "No puedes seguirte a ti mismo",
      })
    }

    // Verificar si ya existe una solicitud o seguimiento
    const existingFollow = await Seguimiento.findByUsers(currentUserId, userId)
    if (existingFollow) {
      return res.status(400).json({
        success: false,
        message: "Ya existe una solicitud o seguimiento",
      })
    }

    // Crear solicitud de seguimiento
    const followRequest = await Seguimiento.create({
      id_usuario: currentUserId,
      id_usuarioseguido: userId,
      id_estadosolicitud: 3, // Pendiente
    })

    // Crear notificación
    const currentUser = await User.findById(currentUserId)
    await Notificacion.create({
      mensaje: `${currentUser.nombre} te ha enviado una solicitud de seguimiento`,
      id_usuario_propietario: userId,
      id_usuario_generador: currentUserId,
      id_tiponotificacion: 1, // Seguimiento
    })

    res.json({
      success: true,
      message: "Solicitud de seguimiento enviada",
    })
  } catch (error) {
    console.error("Error al enviar solicitud de seguimiento:", error)
    res.status(500).json({
      success: false,
      message: "Error al enviar solicitud",
    })
  }
}

exports.respondFollowRequest = async (req, res) => {
  try {
    const { requestId } = req.params
    const { action } = req.body // 'accept' or 'reject'
    const currentUserId = req.user.id

    const followRequest = await Seguimiento.findById(requestId)
    if (!followRequest || followRequest.id_usuarioseguido != currentUserId) {
      return res.status(404).json({
        success: false,
        message: "Solicitud no encontrada",
      })
    }

    let newStatus
    let notificationMessage
    const requesterUser = await User.findById(followRequest.id_usuario)

    if (action === "accept") {
      newStatus = 1 // Aceptada
      notificationMessage = `${req.user.nombre} aceptó tu solicitud de seguimiento`
    } else {
      newStatus = 2 // Rechazada
      notificationMessage = `${req.user.nombre} rechazó tu solicitud de seguimiento`
    }

    // Actualizar estado de la solicitud
    await Seguimiento.updateStatus(requestId, newStatus)

    // Crear notificación de respuesta
    await Notificacion.create({
      mensaje: notificationMessage,
      id_usuario_propietario: followRequest.id_usuario,
      id_usuario_generador: currentUserId,
      id_tiponotificacion: action === "accept" ? 2 : 3, // Aceptada o Rechazada
    })

    res.json({
      success: true,
      message: action === "accept" ? "Solicitud aceptada" : "Solicitud rechazada",
    })
  } catch (error) {
    console.error("Error al responder solicitud:", error)
    res.status(500).json({
      success: false,
      message: "Error al procesar solicitud",
    })
  }
}

//Modo API para búsqueda de usuarios.
exports.searchUsers = async (req, res) => {
  try {
    const { q: query } = req.query
    const currentUserId = req.user ? req.user.id : null

    if (!query || query.trim().length < 2) {
      return res.json([])
    }

    const users = await User.searchByName(query.trim(), currentUserId)
    res.json(users)
  } catch (error) {
    console.error("Error en búsqueda de usuarios:", error)
    res.status(500).json({
      success: false,
      message: "Error al buscar usuarios",
    })
  }
}
