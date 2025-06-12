const { requireAuth } = require("../middleware/auth")
const { Notificacion, Seguimiento } = require("../models/social")
const User = require("../models/user")

exports.getNotificationsPage = [
  requireAuth,
  async (req, res) => {
    try {
      const notifications = await Notificacion.getByUserWithDetails(req.user.id)
      const pendingFollowRequests = await Seguimiento.getPendingRequests(req.user.id)

      res.render("notifications", {
        title: "Notificaciones - PinArtesans",
        notifications: notifications,
        pendingRequests: pendingFollowRequests,
      })
    } catch (error) {
      console.error("Error al cargar notificaciones:", error)
      res.status(500).render("errors/500", {
        title: "Error del servidor - PinArtesans",
      })
    }
  },
]

exports.getNotificationsCount = [
  requireAuth,
  async (req, res) => {
    try {
      const count = await Notificacion.getUnreadCount(req.user.id)
      res.json({ count })
    } catch (error) {
      console.error("Error al obtener contador de notificaciones:", error)
      res.status(500).json({ success: false, message: "Error del servidor" })
    }
  },
]

exports.getRecentNotifications = [
  requireAuth,
  async (req, res) => {
    try {
      const notifications = await Notificacion.getByUserWithDetails(req.user.id, 5)
      res.json(notifications)
    } catch (error) {
      console.error("Error al obtener notificaciones recientes:", error)
      res.status(500).json({ success: false, message: "Error del servidor" })
    }
  },
]

exports.markAsRead = [
  requireAuth,
  async (req, res) => {
    try {
      const notificationId = req.params.id
      await Notificacion.markAsRead(notificationId, req.user.id)

      // Obtener nuevo contador
      const count = await Notificacion.getUnreadCount(req.user.id)

      res.json({ success: true, newCount: count })
    } catch (error) {
      console.error("Error al marcar notificación como leída:", error)
      res.status(500).json({ success: false, message: "Error del servidor" })
    }
  },
]

exports.markAllAsRead = [
  requireAuth,
  async (req, res) => {
    try {
      await Notificacion.markAllAsRead(req.user.id)

      res.json({ success: true, newCount: 0 })
    } catch (error) {
      console.error("Error al marcar todas las notificaciones como leídas:", error)
      res.status(500).json({ success: false, message: "Error del servidor" })
    }
  },
]

exports.respondFollowRequest = [
  requireAuth,
  async (req, res) => {
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
      const currentUser = await User.findById(currentUserId)

      if (action === "accept") {
        newStatus = 1 // Aceptada
        notificationMessage = `${currentUser.nombre} aceptó tu solicitud de seguimiento`
      } else {
        newStatus = 2 // Rechazada
        notificationMessage = `${currentUser.nombre} rechazó tu solicitud de seguimiento`
      }

      // Actualizar estado de la solicitud
      await Seguimiento.updateStatus(requestId, newStatus)

      // Crear notificación de respuesta
      await Notificacion.create({
        mensaje: notificationMessage,
        id_usuario: followRequest.id_usuario,
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
  },
]
