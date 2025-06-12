const bcrypt = require("bcryptjs")
const User = require("../models/user")
const { generateToken, setTokenCookie, clearTokenCookie } = require("../config/jwt")
const { redirectIfAuth } = require("../middleware/auth")
const multer = require("multer")
const path = require("path")

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/profiles/")
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, "profile-" + uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true)
    } else {
      cb(new Error("Solo se permiten archivos de imagen"))
    }
  },
})

exports.getLoginPage = [
  redirectIfAuth,
  (req, res) => {
    res.render("login", {
      title: "Iniciar Sesión - PinArtesans",
      query: req.query,
    })
  },
]

exports.processLogin = async (req, res) => {
  const { email, password } = req.body

  try {
    if (!email || !password) {
      return res.render("login", {
        title: "Iniciar Sesión - PinArtesans",
        error: "Por favor, completa todos los campos",
      })
    }

    // Buscar usuario por email
    const user = await User.findByEmail(email)
    if (!user) {
      return res.render("login", {
        title: "Iniciar Sesión - PinArtesans",
        error: "Credenciales incorrectas",
      })
    }

    // Verificar si la cuenta está suspendida
    if (user.cuenta_suspendida) {
      return res.render("login", {
        title: "Iniciar Sesión - PinArtesans",
        error: "Tu cuenta ha sido suspendida. Contacta al administrador.",
      })
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.contraseña)
    if (!isValidPassword) {
      return res.render("login", {
        title: "Iniciar Sesión - PinArtesans",
        error: "Credenciales incorrectas",
      })
    }

    // Generar token JWT
    const token = generateToken({
      id: user.id_usuario,
      email: user.email,
      nombre: user.nombre,
      moderador: user.moderador,
      imagen_perfil: user.imagen_perfil,
    })

    // Configurar cookie
    setTokenCookie(res, token)

    res.redirect("/?login=success")
  } catch (error) {
    console.error("Error en el proceso de login:", error)
    res.render("login", {
      title: "Iniciar Sesión - PinArtesans",
      error: "Error al procesar el inicio de sesión",
    })
  }
}

exports.getRegisterPage = [
  redirectIfAuth,
  (req, res) => {
    res.render("register", {
      title: "Crear Cuenta - PinArtesans",
      query: req.query,
    })
  },
]

exports.processRegister = [
  upload.single("profileImage"),
  async (req, res) => {
    const { name, email, password, confirmPassword, interests } = req.body

    try {
      if (!name || !email || !password || !confirmPassword) {
        return res.render("register", {
          title: "Crear Cuenta - PinArtesans",
          error: "Por favor, completa todos los campos obligatorios",
        })
      }

      if (password !== confirmPassword) {
        return res.render("register", {
          title: "Crear Cuenta - PinArtesans",
          error: "Las contraseñas no coinciden",
        })
      }

      if (password.length < 8) {
        return res.render("register", {
          title: "Crear Cuenta - PinArtesans",
          error: "La contraseña debe tener al menos 8 caracteres",
        })
      }

      // Verificar si el email ya existe
      const existingUser = await User.findByEmail(email)
      if (existingUser) {
        return res.render("register", {
          title: "Crear Cuenta - PinArtesans",
          error: "El correo electrónico ya está registrado",
        })
      }

      // Procesar imagen de perfil si se subió
      let profileImagePath = null
      if (req.file) {
        profileImagePath = `/uploads/profiles/${req.file.filename}`
      }

      // Crear usuario
      const hashedPassword = await bcrypt.hash(password, 12)
      await User.create({
        nombre: name,
        email,
        contraseña: hashedPassword,
        imagen_perfil: profileImagePath,
        intereses: interests || null,
      })

      res.redirect("/login?register=success")
    } catch (error) {
      console.error("Error en el proceso de registro:", error)
      res.render("register", {
        title: "Crear Cuenta - PinArtesans",
        error: "Error al procesar el registro",
      })
    }
  },
]

exports.logout = (req, res) => {
  clearTokenCookie(res)
  res.redirect("/")
}
