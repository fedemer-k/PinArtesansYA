const { verifyToken } = require("../config/jwt")
const { Notificacion } = require("../models/social")

// Middleware para verificar autenticación
const requireAuth = (req, res, next) => {
  try {
    const token = req.cookies.jwt

    if (!token) {
      return res.redirect("/login")
    }

    const decoded = verifyToken(token)
    req.user = decoded
    next()
  } catch (error) {
    console.error("Error de autenticación:", error.message)
    res.redirect("/login")
  }
}

// Middleware para verificar si el usuario ya está autenticado
const redirectIfAuth = (req, res, next) => {
  try {
    const token = req.cookies.jwt

    if (token) {
      verifyToken(token)
      return res.redirect("/")
    }

    next()
  } catch (error) {
    // Token inválido, continuar
    next()
  }
}

// Middleware para obtener usuario actual (opcional)
const getCurrentUser = async (req, res, next) => {
  try {
    const token = req.cookies.jwt

    if (token) {
      const decoded = verifyToken(token)
      req.user = decoded
      res.locals.user = decoded

      // Obtener contador de notificaciones no leídas
      try {
        const notificationCount = await Notificacion.getUnreadCount(decoded.id)
        res.locals.notificationCount = notificationCount
      } catch (error) {
        console.error("Error al obtener contador de notificaciones:", error)
        res.locals.notificationCount = 0
      }
    } else {
      req.user = null
      res.locals.user = null
      res.locals.notificationCount = 0
    }

    next()
  } catch (error) {
    // Token inválido, continuar sin usuario
    req.user = null
    res.locals.user = null
    res.locals.notificationCount = 0
    next()
  }
}

module.exports = {
  requireAuth,
  redirectIfAuth,
  getCurrentUser,
}
