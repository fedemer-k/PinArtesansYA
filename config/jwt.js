const jwt = require("jsonwebtoken")

// Configuración JWT
const jwtConfig = {
  privateKey: process.env.JWT_PRIVATE_KEY,
  expiration: process.env.JWT_EXPIRATION || "7d",
  cookieExpiration: Number.parseInt(process.env.JWT_EXPIRATION_COOKIE) || 7,
}

// Generar token JWT
const generateToken = (payload) => {
  return jwt.sign(payload, jwtConfig.privateKey, {
    expiresIn: jwtConfig.expiration,
  })
}

// Verificar token JWT
const verifyToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.privateKey)
  } catch (error) {
    throw new Error("Token inválido")
  }
}

// Configurar cookie con token
const setTokenCookie = (res, token) => {
  const cookieOptions = {
    expires: new Date(Date.now() + jwtConfig.cookieExpiration * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  }

  res.cookie("jwt", token, cookieOptions)
}

// Limpiar cookie de token
const clearTokenCookie = (res) => {
  res.cookie("jwt", "", {
    expires: new Date(0),
    httpOnly: true,
  })
}

module.exports = {
  generateToken,
  verifyToken,
  setTokenCookie,
  clearTokenCookie,
  jwtConfig,
}
