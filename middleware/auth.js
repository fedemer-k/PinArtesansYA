const { verifyToken } = require("../config/jwt")

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
const getCurrentUser = (req, res, next) => {
  try {
    const token = req.cookies.jwt

    if (token) {
      const decoded = verifyToken(token)
      req.user = decoded
      res.locals.user = decoded
    }

    next()
  } catch (error) {
    // Token inválido, continuar sin usuario
    next()
  }
}

module.exports = {
  requireAuth,
  redirectIfAuth,
  getCurrentUser,
}
