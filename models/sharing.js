const { query } = require("../config/database")

// Modelo de ImagenCompartida
class ImagenCompartida {
  constructor(data) {
    this.id_imagen = data.id_imagen
    this.id_usuario = data.id_usuario
    this.id_usuarioacompartir = data.id_usuarioacompartir
  }

  static async create(shareData) {
    try {
      const { id_imagen, id_usuario, id_usuarioacompartir } = shareData
      await query("INSERT INTO ImagenCompartida (id_imagen, id_usuario, id_usuarioacompartir) VALUES (?, ?, ?)", [
        id_imagen,
        id_usuario,
        id_usuarioacompartir,
      ])
      return true
    } catch (error) {
      console.error("Error al crear imagen compartida:", error)
      throw error
    }
  }

  static async getSharedUsers(imageId) {
    try {
      const results = await query(
        `SELECT u.id_usuario, u.nombre, u.imagen_perfil 
         FROM ImagenCompartida ic
         JOIN Usuario u ON ic.id_usuarioacompartir = u.id_usuario
         WHERE ic.id_imagen = ?`,
        [imageId],
      )
      return results
    } catch (error) {
      console.error("Error al obtener usuarios con imagen compartida:", error)
      throw error
    }
  }

  static async removeSharedUser(imageId, userId, sharedUserId) {
    try {
      await query("DELETE FROM ImagenCompartida WHERE id_imagen = ? AND id_usuario = ? AND id_usuarioacompartir = ?", [
        imageId,
        userId,
        sharedUserId,
      ])
      return true
    } catch (error) {
      console.error("Error al remover usuario compartido:", error)
      throw error
    }
  }

  static async removeAllForImage(imageId) {
    try {
      await query("DELETE FROM ImagenCompartida WHERE id_imagen = ?", [imageId])
      return true
    } catch (error) {
      console.error("Error al remover todos los usuarios compartidos:", error)
      throw error
    }
  }
}

module.exports = {
  ImagenCompartida,
}
