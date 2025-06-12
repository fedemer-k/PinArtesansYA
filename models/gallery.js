const { query } = require("../config/database")

// Modelo de Imagen
class Image {
  constructor(data) {
    this.id_imagen = data.id_imagen
    this.titulo = data.titulo
    this.descripcion = data.descripcion
    this.ruta_imagen = data.ruta_imagen
    this.privacidad = data.privacidad
    this.fecha_subida = data.fecha_subida
    this.id_album = data.id_album
  }

  static async getFromFollowing(userId) {
    try {
      const sql = `
        SELECT i.*, a.id_usuario as owner_id, u.nombre as owner_name
        FROM Imagen i
        JOIN Album a ON i.id_album = a.id_album
        JOIN Usuario u ON a.id_usuario = u.id_usuario
        JOIN Seguimiento s ON s.id_usuarioseguido = u.id_usuario
        WHERE s.id_usuario = ? 
          AND s.id_estadosolicitud = 1
          AND (i.privacidad = 1 OR (i.privacidad = 2 AND u.modo_vitrina = TRUE))
        ORDER BY i.fecha_subida DESC
        LIMIT 50
      `

      const results = await query(sql, [userId])

      return results.map((img) => ({
        id: img.id_imagen,
        src: img.ruta_imagen,
        likes: 0, // Se implementará con tabla de likes
        comments: 0, // Se calculará desde tabla de comentarios
        title: img.titulo,
        owner: img.owner_name,
      }))
    } catch (error) {
      console.error("Error al obtener imágenes de seguidos:", error)
      throw error
    }
  }

  static async getPublic() {
    try {
      const sql = `
        SELECT i.*, a.id_usuario as owner_id, u.nombre as owner_name
        FROM Imagen i
        JOIN Album a ON i.id_album = a.id_album
        JOIN Usuario u ON a.id_usuario = u.id_usuario
        WHERE i.privacidad = 2 AND u.modo_vitrina = TRUE
        ORDER BY i.fecha_subida DESC
        LIMIT 50
      `

      const results = await query(sql)

      return results.map((img) => ({
        id: img.id_imagen,
        src: img.ruta_imagen,
        likes: 0,
        comments: 0,
        title: img.titulo,
        owner: img.owner_name,
      }))
    } catch (error) {
      console.error("Error al obtener imágenes públicas:", error)
      throw error
    }
  }

  static async searchImages(searchTerm, userId = null) {
    try {
      let sql = `
        SELECT i.*, a.id_usuario as owner_id, u.nombre as owner_name
        FROM Imagen i
        JOIN Album a ON i.id_album = a.id_album
        JOIN Usuario u ON a.id_usuario = u.id_usuario
        WHERE (i.titulo LIKE ? OR i.descripcion LIKE ? OR a.titulo LIKE ?)
      `

      const params = [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]

      if (userId) {
        sql += `
          AND (
            (i.privacidad = 2 AND u.modo_vitrina = TRUE) OR
            (i.privacidad = 1 AND EXISTS (
              SELECT 1 FROM Seguimiento s 
              WHERE s.id_usuario = ? AND s.id_usuarioseguido = u.id_usuario AND s.id_estadosolicitud = 1
            ))
          )
        `
        params.push(userId)
      } else {
        sql += ` AND i.privacidad = 2 AND u.modo_vitrina = TRUE`
      }

      sql += ` ORDER BY i.fecha_subida DESC LIMIT 50`

      const results = await query(sql, params)

      return results.map((img) => ({
        id: img.id_imagen,
        src: img.ruta_imagen,
        likes: 0,
        comments: 0,
        title: img.titulo,
        owner: img.owner_name,
      }))
    } catch (error) {
      console.error("Error al buscar imágenes:", error)
      throw error
    }
  }

  static async getPaginated(page, limit) {
    try {
      const offset = (page - 1) * limit
      const sql = `
        SELECT i.*, a.id_usuario as owner_id, u.nombre as owner_name
        FROM Imagen i
        JOIN Album a ON i.id_album = a.id_album
        JOIN Usuario u ON a.id_usuario = u.id_usuario
        WHERE i.privacidad = 2 AND u.modo_vitrina = TRUE
        ORDER BY i.fecha_subida DESC
        LIMIT ? OFFSET ?
      `

      const results = await query(sql, [limit, offset])

      return results.map((img) => ({
        id: img.id_imagen,
        src: img.ruta_imagen,
        likes: 0,
        comments: 0,
        title: img.titulo,
        owner: img.owner_name,
      }))
    } catch (error) {
      console.error("Error al obtener imágenes paginadas:", error)
      throw error
    }
  }

  static async findById(id) {
    try {
      const results = await query("SELECT * FROM Imagen WHERE id_imagen = ?", [id])
      return results.length > 0 ? new Image(results[0]) : null
    } catch (error) {
      console.error("Error al buscar imagen por ID:", error)
      throw error
    }
  }

  static async create(imageData) {
    try {
      const { titulo, descripcion, ruta_imagen, privacidad, id_album } = imageData
      const result = await query(
        "INSERT INTO Imagen (titulo, descripcion, ruta_imagen, privacidad, fecha_subida, id_album) VALUES (?, ?, ?, ?, CURDATE(), ?)",
        [titulo, descripcion, ruta_imagen, privacidad, id_album],
      )

      return await Image.findById(result.insertId)
    } catch (error) {
      console.error("Error al crear imagen:", error)
      throw error
    }
  }

  static async like(imageId) {
    try {
      // Implementar sistema de likes real cuando se requiera
      // Por ahora retorna error ya que no hay tabla de likes
      throw new Error("Sistema de likes no implementado")
    } catch (error) {
      console.error("Error al dar like a imagen:", error)
      throw error
    }
  }

  static async findByIdWithDetails(id) {
    try {
      const results = await query(
        `
        SELECT i.*, a.titulo as album_titulo, a.id_usuario as owner_id, u.nombre as owner_name, u.imagen_perfil as owner_avatar
        FROM Imagen i
        JOIN Album a ON i.id_album = a.id_album
        JOIN Usuario u ON a.id_usuario = u.id_usuario
        WHERE i.id_imagen = ?
      `,
        [id],
      )

      if (results.length === 0) return null

      const imageData = results[0]
      return {
        id_imagen: imageData.id_imagen,
        titulo: imageData.titulo,
        descripcion: imageData.descripcion,
        ruta_imagen: imageData.ruta_imagen,
        privacidad: imageData.privacidad,
        fecha_subida: imageData.fecha_subida,
        id_album: imageData.id_album,
        album_titulo: imageData.album_titulo,
        owner_id: imageData.owner_id,
        owner_name: imageData.owner_name,
        owner_avatar: imageData.owner_avatar,
      }
    } catch (error) {
      console.error("Error al buscar imagen con detalles:", error)
      throw error
    }
  }

  static async findByIdWithOwner(id) {
    try {
      const results = await query(
        `
        SELECT i.*, a.id_usuario as owner_id
        FROM Imagen i
        JOIN Album a ON i.id_album = a.id_album
        WHERE i.id_imagen = ?
      `,
        [id],
      )

      if (results.length === 0) return null

      const imageData = results[0]
      return {
        id_imagen: imageData.id_imagen,
        titulo: imageData.titulo,
        descripcion: imageData.descripcion,
        ruta_imagen: imageData.ruta_imagen,
        privacidad: imageData.privacidad,
        fecha_subida: imageData.fecha_subida,
        id_album: imageData.id_album,
        owner_id: imageData.owner_id,
      }
    } catch (error) {
      console.error("Error al buscar imagen con propietario:", error)
      throw error
    }
  }

  static async canUserView(imageId, userId) {
    try {
      const results = await query(
        `
        SELECT i.privacidad, a.id_usuario as owner_id, u.modo_vitrina
        FROM Imagen i
        JOIN Album a ON i.id_album = a.id_album
        JOIN Usuario u ON a.id_usuario = u.id_usuario
        WHERE i.id_imagen = ?
      `,
        [imageId],
      )

      if (results.length === 0) return false

      const image = results[0]

      // Si es el propietario, siempre puede ver
      if (userId && image.owner_id === userId) return true

      // Imagen privada (0) - solo el propietario
      if (image.privacidad === 0) return false

      // Imagen pública (2) - todos pueden ver si el usuario tiene modo vitrina
      if (image.privacidad === 2 && image.modo_vitrina) return true

      // Imagen para seguidores (1) - verificar si sigue al usuario
      if (image.privacidad === 1 && userId) {
        const followResults = await query(
          `
          SELECT 1 FROM Seguimiento 
          WHERE id_usuario = ? AND id_usuarioseguido = ? AND id_estadosolicitud = 1
        `,
          [userId, image.owner_id],
        )
        return followResults.length > 0
      }

      // Imagen para usuarios específicos (3) - verificar si está en la lista
      if (image.privacidad === 3 && userId) {
        const sharedResults = await query(
          `
          SELECT 1 FROM ImagenCompartida 
          WHERE id_imagen = ? AND id_usuarioacompartir = ?
        `,
          [imageId, userId],
        )
        return sharedResults.length > 0
      }

      return false
    } catch (error) {
      console.error("Error al verificar permisos de imagen:", error)
      return false
    }
  }

  static async getByUser(userId) {
    try {
      const results = await query(
        "SELECT i.* FROM Imagen i JOIN Album a ON i.id_album = a.id_album WHERE a.id_usuario = ? ORDER BY i.fecha_subida DESC",
        [userId],
      )
      return results.map((img) => new Image(img))
    } catch (error) {
      console.error("Error al obtener imágenes del usuario:", error)
      throw error
    }
  }

  static async getByAlbum(albumId) {
    try {
      const results = await query("SELECT * FROM Imagen WHERE id_album = ? ORDER BY fecha_subida DESC", [albumId])
      return results.map((img) => new Image(img))
    } catch (error) {
      console.error("Error al obtener imágenes del álbum:", error)
      throw error
    }
  }

  static async getByAlbumWithDetails(albumId) {
    try {
      const results = await query(
        `
        SELECT i.*, 
               (SELECT COUNT(*) FROM Comentario c WHERE c.id_imagen = i.id_imagen) as comments_count,
               (SELECT COUNT(*) FROM ImagenCompartida ic WHERE ic.id_imagen = i.id_imagen) as shared_count
        FROM Imagen i 
        WHERE i.id_album = ? 
        ORDER BY i.fecha_subida DESC
      `,
        [albumId],
      )

      return results.map((img) => ({
        id_imagen: img.id_imagen,
        titulo: img.titulo,
        descripcion: img.descripcion,
        ruta_imagen: img.ruta_imagen,
        privacidad: img.privacidad,
        fecha_subida: img.fecha_subida,
        id_album: img.id_album,
        comments_count: img.comments_count || 0,
        shared_count: img.shared_count || 0,
      }))
    } catch (error) {
      console.error("Error al obtener imágenes del álbum con detalles:", error)
      throw error
    }
  }

  static async update(id, updateData) {
    try {
      const { titulo, descripcion, ruta_imagen, privacidad } = updateData
      let sql = "UPDATE Imagen SET titulo = ?, descripcion = ?, privacidad = ?"
      const params = [titulo, descripcion, privacidad]

      if (ruta_imagen) {
        sql += ", ruta_imagen = ?"
        params.push(ruta_imagen)
      }

      sql += " WHERE id_imagen = ?"
      params.push(id)

      await query(sql, params)
      return await Image.findById(id)
    } catch (error) {
      console.error("Error al actualizar imagen:", error)
      throw error
    }
  }

  static async delete(id) {
    try {
      await query("DELETE FROM Imagen WHERE id_imagen = ?", [id])
      return true
    } catch (error) {
      console.error("Error al eliminar imagen:", error)
      throw error
    }
  }

  static async moveToAlbum(imageId, newAlbumId) {
    try {
      await query("UPDATE Imagen SET id_album = ? WHERE id_imagen = ?", [newAlbumId, imageId])
      return true
    } catch (error) {
      console.error("Error al mover imagen:", error)
      throw error
    }
  }
}

// Modelo de Album
class Album {
  constructor(data) {
    this.id_album = data.id_album
    this.titulo = data.titulo
    this.id_usuario = data.id_usuario
  }

  static async findById(id) {
    try {
      const results = await query("SELECT * FROM Album WHERE id_album = ?", [id])
      return results.length > 0 ? new Album(results[0]) : null
    } catch (error) {
      console.error("Error al buscar album por ID:", error)
      throw error
    }
  }

  static async findByNameAndUser(name, userId) {
    try {
      const results = await query("SELECT * FROM Album WHERE titulo = ? AND id_usuario = ?", [name, userId])
      return results.length > 0 ? new Album(results[0]) : null
    } catch (error) {
      console.error("Error al buscar album por nombre y usuario:", error)
      throw error
    }
  }

  static async create(albumData) {
    try {
      const { titulo, id_usuario } = albumData
      const result = await query("INSERT INTO Album (titulo, id_usuario) VALUES (?, ?)", [titulo, id_usuario])

      return await Album.findById(result.insertId)
    } catch (error) {
      console.error("Error al crear album:", error)
      throw error
    }
  }

  static async getByUser(userId) {
    try {
      const results = await query("SELECT * FROM Album WHERE id_usuario = ? ORDER BY titulo ASC", [userId])
      return results.map((album) => new Album(album))
    } catch (error) {
      console.error("Error al obtener albums del usuario:", error)
      throw error
    }
  }

  static async getByUserWithImageCount(userId) {
    try {
      const results = await query(
        `
        SELECT a.*, 
               COUNT(i.id_imagen) as image_count,
               MAX(i.fecha_subida) as last_updated,
               (SELECT i2.ruta_imagen FROM Imagen i2 WHERE i2.id_album = a.id_album ORDER BY i2.fecha_subida DESC LIMIT 1) as cover_image
        FROM Album a
        LEFT JOIN Imagen i ON a.id_album = i.id_album
        WHERE a.id_usuario = ?
        GROUP BY a.id_album
        ORDER BY a.titulo ASC
      `,
        [userId],
      )

      return results.map((album) => ({
        id_album: album.id_album,
        titulo: album.titulo,
        id_usuario: album.id_usuario,
        image_count: album.image_count || 0,
        last_updated: album.last_updated,
        cover_image: album.cover_image || "/uploads/profiles/default.png",
      }))
    } catch (error) {
      console.error("Error al obtener albums con conteo:", error)
      throw error
    }
  }

  static async update(id, updateData) {
    try {
      const { titulo } = updateData
      await query("UPDATE Album SET titulo = ? WHERE id_album = ?", [titulo, id])
      return await Album.findById(id)
    } catch (error) {
      console.error("Error al actualizar album:", error)
      throw error
    }
  }

  static async delete(id) {
    try {
      await query("DELETE FROM Album WHERE id_album = ?", [id])
      return true
    } catch (error) {
      console.error("Error al eliminar album:", error)
      throw error
    }
  }
}

// Modelo de Comentario
class Comment {
  constructor(data) {
    this.id_comentario = data.id_comentario
    this.texto = data.texto
    this.fecha = data.fecha
    this.id_imagen = data.id_imagen
    this.id_usuario = data.id_usuario
  }

  static async getByImageWithUser(imageId) {
    try {
      const results = await query(
        `
        SELECT c.*, u.nombre as usuario_nombre, u.imagen_perfil as usuario_avatar
        FROM Comentario c
        JOIN Usuario u ON c.id_usuario = u.id_usuario
        WHERE c.id_imagen = ?
        ORDER BY c.fecha DESC, c.id_comentario DESC
      `,
        [imageId],
      )

      return results.map((comment) => ({
        id_comentario: comment.id_comentario,
        texto: comment.texto,
        fecha: comment.fecha,
        id_imagen: comment.id_imagen,
        id_usuario: comment.id_usuario,
        usuario_nombre: comment.usuario_nombre,
        usuario_avatar: comment.usuario_avatar || "/uploads/profiles/default.png",
      }))
    } catch (error) {
      console.error("Error al obtener comentarios con usuario:", error)
      throw error
    }
  }

  static async getByIdWithUser(commentId) {
    try {
      const results = await query(
        `
        SELECT c.*, u.nombre as usuario_nombre, u.imagen_perfil as usuario_avatar
        FROM Comentario c
        JOIN Usuario u ON c.id_usuario = u.id_usuario
        WHERE c.id_comentario = ?
      `,
        [commentId],
      )

      if (results.length === 0) return null

      const comment = results[0]
      return {
        id_comentario: comment.id_comentario,
        texto: comment.texto,
        fecha: comment.fecha,
        id_imagen: comment.id_imagen,
        id_usuario: comment.id_usuario,
        usuario_nombre: comment.usuario_nombre,
        usuario_avatar: comment.usuario_avatar || "/uploads/profiles/default.png",
      }
    } catch (error) {
      console.error("Error al obtener comentario con usuario:", error)
      throw error
    }
  }

  static async delete(commentId) {
    try {
      await query("DELETE FROM Comentario WHERE id_comentario = ?", [commentId])
      return true
    } catch (error) {
      console.error("Error al eliminar comentario:", error)
      throw error
    }
  }

  static async getCountByImage(imageId) {
    try {
      const results = await query("SELECT COUNT(*) as count FROM Comentario WHERE id_imagen = ?", [imageId])
      return results[0].count
    } catch (error) {
      console.error("Error al contar comentarios:", error)
      return 0
    }
  }

  static async create(commentData) {
    try {
      const { texto, id_imagen, id_usuario } = commentData
      const result = await query(
        "INSERT INTO Comentario (texto, fecha, id_imagen, id_usuario) VALUES (?, CURDATE(), ?, ?)",
        [texto, id_imagen, id_usuario],
      )

      return await Comment.findById(result.insertId)
    } catch (error) {
      console.error("Error al crear comentario:", error)
      throw error
    }
  }

  static async findById(id) {
    try {
      const results = await query("SELECT * FROM Comentario WHERE id_comentario = ?", [id])
      return results.length > 0 ? new Comment(results[0]) : null
    } catch (error) {
      console.error("Error al buscar comentario por ID:", error)
      throw error
    }
  }

  static async getByImage(imageId) {
    try {
      const results = await query(
        "SELECT c.*, u.nombre as usuario_nombre FROM Comentario c JOIN Usuario u ON c.id_usuario = u.id_usuario WHERE c.id_imagen = ? ORDER BY c.fecha DESC",
        [imageId],
      )
      return results.map((comment) => new Comment(comment))
    } catch (error) {
      console.error("Error al obtener comentarios de imagen:", error)
      throw error
    }
  }
}

module.exports = {
  Image,
  Album,
  Comment,
}
