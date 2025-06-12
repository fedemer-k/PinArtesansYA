const { Image } = require("../models/gallery")

exports.getMoreImages = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 12

    const moreImages = await Image.getPaginated(page, limit)
    res.json(moreImages)
  } catch (error) {
    console.error("Error al cargar más imágenes:", error)
    res.status(500).json({
      success: false,
      message: "Error al cargar más imágenes",
    })
  }
}

exports.likeImage = async (req, res) => {
  try {
    const imageId = Number.parseInt(req.params.id)

    // Sistema de likes no implementado aún
    res.status(501).json({
      success: false,
      message: "Sistema de likes no implementado",
    })
  } catch (error) {
    console.error("Error al dar like a la imagen:", error)
    res.status(500).json({
      success: false,
      message: "Error al procesar el like",
    })
  }
}
