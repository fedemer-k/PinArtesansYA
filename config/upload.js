const multer = require("multer")
const path = require("path")
const fs = require("fs")

// Configuración de almacenamiento para multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determinar la carpeta de destino según el tipo de archivo
    let uploadPath = process.env.UPLOAD_PATH || path.join(__dirname, "..", "public", "uploads")

    if (file.fieldname === "profileImage") {
      uploadPath = path.join(uploadPath, "profiles")
    } else {
      uploadPath = path.join(uploadPath, "images")
    }

    // Asegurarse de que el directorio existe
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }

    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    // Generar un nombre de archivo único
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const extension = path.extname(file.originalname)

    if (file.fieldname === "profileImage") {
      cb(null, "profile-" + uniqueSuffix + extension)
    } else {
      cb(null, "image-" + uniqueSuffix + extension)
    }
  },
})

// Filtro para validar tipos de archivos
const fileFilter = (req, file, cb) => {
  // Aceptar solo imágenes
  if (file.mimetype.startsWith("image/")) {
    cb(null, true)
  } else {
    cb(new Error("Solo se permiten archivos de imagen"), false)
  }
}

// Configuración de multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: Number.parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB por defecto
  },
  fileFilter: fileFilter,
})

module.exports = {
  upload,
  // Middleware para manejar errores de multer
  handleMulterError: (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          error: `El archivo es demasiado grande. El tamaño máximo permitido es ${(Number.parseInt(process.env.MAX_FILE_SIZE) / (1024 * 1024)).toFixed(2)} MB`,
        })
      }
      return res.status(400).json({ error: err.message })
    } else if (err) {
      return res.status(400).json({ error: err.message })
    }
    next()
  },
}
