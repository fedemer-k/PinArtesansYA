const { query } = require("../config/database")

// Modelo de Seguimiento
class Seguimiento {
  constructor(data) {
    this.id_amistad = data.id_amistad
    this.fecha = data.fecha
    this.id_usuario = data.id_usuario
    this.id_usuarioseguido = data.id_usuarioseguido
    this.id_estadosolicitud = data.id_estadosolicitud
  }

  static async findByUsers(userId, followedUserId) {
    try {
      const results = await query("SELECT * FROM Seguimiento WHERE id_usuario = ? AND id_usuarioseguido = ?", [
        userId,
        followedUserId,
      ])
      return results.length > 0 ? new Seguimiento(results[0]) : null
    } catch (error) {
      console.error("Error al buscar seguimiento:", error)
      throw error
    }
  }

  static async findById(id) {
    try {
      const results = await query("SELECT * FROM Seguimiento WHERE id_amistad = ?", [id])
      return results.length > 0 ? new Seguimiento(results[0]) : null
    } catch (error) {
      console.error("Error al buscar seguimiento por ID:", error)
      throw error
    }
  }

  static async create(followData) {
    try {
      const { id_usuario, id_usuarioseguido, id_estadosolicitud } = followData
      const result = await query(
        "INSERT INTO Seguimiento (fecha, id_usuario, id_usuarioseguido, id_estadosolicitud) VALUES (CURDATE(), ?, ?, ?)",
        [id_usuario, id_usuarioseguido, id_estadosolicitud],
      )

      return await Seguimiento.findById(result.insertId)
    } catch (error) {
      console.error("Error al crear seguimiento:", error)
      throw error
    }
  }

  static async updateStatus(id, newStatus) {
    try {
      await query("UPDATE Seguimiento SET id_estadosolicitud = ? WHERE id_amistad = ?", [newStatus, id])
      return await Seguimiento.findById(id)
    } catch (error) {
      console.error("Error al actualizar estado de seguimiento:", error)
      throw error
    }
  }

  static async delete(id) {
    try {
      await query("DELETE FROM Seguimiento WHERE id_amistad = ?", [id])
      return true
    } catch (error) {
      console.error("Error al eliminar seguimiento:", error)
      throw error
    }
  }

  static async getPendingRequests(userId) {
    try {
      const results = await query(
        `SELECT s.*, u.nombre, u.imagen_perfil 
         FROM Seguimiento s 
         JOIN Usuario u ON s.id_usuario = u.id_usuario 
         WHERE s.id_usuarioseguido = ? AND s.id_estadosolicitud = 3
         ORDER BY s.fecha DESC`,
        [userId],
      )
      return results
    } catch (error) {
      console.error("Error al obtener solicitudes pendientes:", error)
      throw error
    }
  }

  static async getFollowing(userId) {
    try {
      const results = await query(
        `SELECT u.id_usuario, u.nombre, u.imagen_perfil 
         FROM Seguimiento s 
         JOIN Usuario u ON s.id_usuarioseguido = u.id_usuario 
         WHERE s.id_usuario = ? AND s.id_estadosolicitud = 1
         ORDER BY u.nombre ASC`,
        [userId],
      )
      return results
    } catch (error) {
      console.error("Error al obtener usuarios seguidos:", error)
      throw error
    }
  }

  static async getFollowers(userId) {
    try {
      const results = await query(
        `SELECT u.id_usuario, u.nombre, u.imagen_perfil 
         FROM Seguimiento s 
         JOIN Usuario u ON s.id_usuario = u.id_usuario 
         WHERE s.id_usuarioseguido = ? AND s.id_estadosolicitud = 1
         ORDER BY u.nombre ASC`,
        [userId],
      )
      return results
    } catch (error) {
      console.error("Error al obtener seguidores:", error)
      throw error
    }
  }
}

// Modelo de Notificación
class Notificacion {
  constructor(data) {
    this.id_notificacion = data.id_notificacion
    this.mensaje = data.mensaje
    this.leida = data.leida
    this.fecha = data.fecha
    this.id_usuario = data.id_usuario
    this.id_tiponotificacion = data.id_tiponotificacion
    this.tipo = data.tipo
    this.follow_request_id = data.follow_request_id
  }

  static async create(notificationData) {
    try {
      const { mensaje, id_usuario, id_tiponotificacion } = notificationData
      const result = await query(
        "INSERT INTO Notificacion (mensaje, leida, fecha, id_usuario, id_tiponotificacion) VALUES (?, FALSE, CURDATE(), ?, ?)",
        [mensaje, id_usuario, id_tiponotificacion],
      )

      return await Notificacion.findById(result.insertId)
    } catch (error) {
      console.error("Error al crear notificación:", error)
      throw error
    }
  }

  static async findById(id) {
    try {
      const results = await query("SELECT * FROM Notificacion WHERE id_notificacion = ?", [id])
      return results.length > 0 ? new Notificacion(results[0]) : null
    } catch (error) {
      console.error("Error al buscar notificación por ID:", error)
      throw error
    }
  }

  static async getByUser(userId, limit = 20) {
    try {
      const results = await query(
        "SELECT * FROM Notificacion WHERE id_usuario = ? ORDER BY fecha DESC, id_notificacion DESC LIMIT ?",
        [userId, limit],
      )
      return results.map((notification) => new Notificacion(notification))
    } catch (error) {
      console.error("Error al obtener notificaciones del usuario:", error)
      throw error
    }
  }

  static async getByUserWithDetails(userId, limit = 20) {
    try {
      console.log("DESDE GETBYUSERWD userId:", userId, " typeof userID:", typeof userId, " limit:", limit, " typeof limit:", typeof limit);
      const results = await query(
        `SELECT n.*, tn.tipo,
         CASE 
           WHEN tn.tipo LIKE '%Seguimiento%' AND s.id_estadosolicitud = 3 THEN s.id_amistad
           ELSE NULL
         END as follow_request_id
         FROM Notificacion n
         JOIN TipoNotificacion tn ON n.id_tiponotificacion = tn.id_tiponotificacion
         LEFT JOIN Seguimiento s ON (
           tn.tipo LIKE '%Seguimiento%' AND 
           n.id_tiponotificacion = 1 AND
           s.id_usuarioseguido = n.id_usuario AND
           s.id_estadosolicitud = 3
         )
         WHERE n.id_usuario = ? 
         ORDER BY n.fecha DESC, n.id_notificacion DESC 
         LIMIT ?`,
        [userId, limit],
      )
      return results.map((notification) => new Notificacion(notification))
    } catch (error) {
      console.error("Error al obtener notificaciones con detalles:", error)
      throw error
    }
  }

  static async getUnreadCount(userId) {
    try {
      const results = await query("SELECT COUNT(*) as count FROM Notificacion WHERE id_usuario = ? AND leida = FALSE", [
        userId,
      ])
      return results[0].count
    } catch (error) {
      console.error("Error al contar notificaciones no leídas:", error)
      throw error
    }
  }

  static async markAsRead(id, userId) {
    try {
      await query("UPDATE Notificacion SET leida = TRUE WHERE id_notificacion = ? AND id_usuario = ?", [id, userId])
      return true
    } catch (error) {
      console.error("Error al marcar notificación como leída:", error)
      throw error
    }
  }

  static async markAllAsRead(userId) {
    try {
      await query("UPDATE Notificacion SET leida = TRUE WHERE id_usuario = ?", [userId])
      return true
    } catch (error) {
      console.error("Error al marcar todas las notificaciones como leídas:", error)
      throw error
    }
  }
}

module.exports = {
  Seguimiento,
  Notificacion,
}
