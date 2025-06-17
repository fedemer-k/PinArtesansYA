const { query } = require("../config/database")

class User {
  constructor(data) {
    this.id_usuario = data.id_usuario
    this.nombre = data.nombre
    this.email = data.email
    this.contraseña = data.contraseña
    this.imagen_perfil = data.imagen_perfil
    this.intereses = data.intereses
    this.antecedentes = data.antecedentes
    this.fecha_registro = data.fecha_registro
    this.modo_vitrina = data.modo_vitrina
    this.moderador = data.moderador
    this.cuenta_suspendida = data.cuenta_suspendida

    // Alias para compatibilidad con el controlador de perfil
    this.id = data.id_usuario
    this.username = data.nombre
  }

  static async findByEmail(email) {
    try {
      const results = await query("SELECT * FROM Usuario WHERE email = ?", [email])
      return results.length > 0 ? new User(results[0]) : null
    } catch (error) {
      console.error("Error al buscar usuario por email:", error)
      throw error
    }
  }

  static async findById(id) {
    try {
      const results = await query("SELECT * FROM Usuario WHERE id_usuario = ?", [id])
      return results.length > 0 ? new User(results[0]) : null
    } catch (error) {
      console.error("Error al buscar usuario por ID:", error)
      throw error
    }
  }

  // Nuevo método para buscar por nombre de usuario
  static async findByUsername(username) {
    try {
      const results = await query("SELECT * FROM Usuario WHERE nombre = ?", [username])
      return results.length > 0 ? new User(results[0]) : null
    } catch (error) {
      console.error("Error al buscar usuario por nombre:", error)
      throw error
    }
  }

  // Método para verificar si un usuario sigue a otro
  static async isFollowing(followerId, followedId) {
    try {
      // Verificar que ambos IDs sean válidos
      if (!followerId || !followedId) {
        return false
      }

      const results = await query(
        "SELECT * FROM Seguimiento WHERE id_usuario = ? AND id_usuarioseguido = ? AND id_estadosolicitud = 1",
        [followerId, followedId]
      )
      return results.length > 0
    } catch (error) {
      console.error("Error al verificar seguimiento:", error)
      return false // En caso de error, asumimos que no sigue
    }
  }

  // Método para contar seguidores
  static async countFollowers(userId) {
    try {
      // Verificar que el ID sea válido
      if (!userId) {
        return 0
      }

      const results = await query(
        "SELECT COUNT(*) as count FROM Seguimiento WHERE id_usuarioseguido = ? AND id_estadosolicitud = 1",
        [userId]
      )
      return results[0].count
    } catch (error) {
      console.error("Error al contar seguidores:", error)
      return 0 // En caso de error, devolvemos 0
    }
  }

  static async searchByName(searchTerm, currentUserId = null) {
    try {
      const sql = `
        SELECT 
          u.id_usuario,
          u.nombre,
          u.email,
          u.imagen_perfil,
          u.intereses,
          u.modo_vitrina,
          u.moderador,
          CASE 
            WHEN u.nombre LIKE ? THEN 1
            WHEN u.nombre LIKE ? THEN 2
            WHEN u.intereses LIKE ? THEN 3
            ELSE 4
          END as relevancia,
          CASE 
            WHEN s.id_estadosolicitud = 1 THEN 'following'
            WHEN s.id_estadosolicitud = 3 AND s.id_usuario = ? THEN 'pending_sent'
            WHEN s.id_estadosolicitud = 3 AND s.id_usuarioseguido = ? THEN 'pending_received'
            WHEN s.id_estadosolicitud = 2 THEN 'rejected'
            ELSE 'none'
          END as follow_status
        FROM Usuario u
        LEFT JOIN Seguimiento s ON (
          (s.id_usuario = ? AND s.id_usuarioseguido = u.id_usuario) OR
          (s.id_usuarioseguido = ? AND s.id_usuario = u.id_usuario)
        )
        WHERE 
          u.cuenta_suspendida = FALSE 
          AND u.id_usuario != ?
          AND (
            u.nombre LIKE ? OR 
            u.intereses LIKE ?
          )
        ORDER BY relevancia ASC, u.nombre ASC
        LIMIT 20
      `

      const searchPattern = `%${searchTerm}%`
      const exactPattern = `${searchTerm}%`

      const params = [
        exactPattern, // Para relevancia 1 (coincidencia exacta al inicio)
        searchPattern, // Para relevancia 2 (contiene el término)
        searchPattern, // Para relevancia 3 (en intereses)
        currentUserId || 0, // Para verificar pending_sent
        currentUserId || 0, // Para verificar pending_received
        currentUserId || 0, // Para LEFT JOIN seguimiento
        currentUserId || 0, // Para LEFT JOIN seguimiento
        currentUserId || 0, // Para excluir usuario actual
        searchPattern, // Para WHERE nombre
        searchPattern // Para WHERE intereses
      ]

      const results = await query(sql, params)

      return results.map((user) => ({
        id: user.id_usuario,
        nombre: user.nombre,
        email: user.email,
        imagen_perfil: user.imagen_perfil || "https://picsum.photos/80/80?random=" + user.id_usuario,
        intereses: user.intereses,
        modo_vitrina: user.modo_vitrina,
        moderador: user.moderador,
        follow_status: user.follow_status,
      }))
    } catch (error) {
      console.error("Error al buscar usuarios:", error)
      throw error
    }
  }

  static async create(userData) {
    try {
      const { nombre, email, contraseña, imagen_perfil, intereses } = userData
      const result = await query(
        "INSERT INTO Usuario (nombre, email, contraseña, imagen_perfil, intereses, fecha_registro, modo_vitrina, moderador, cuenta_suspendida) VALUES (?, ?, ?, ?, ?, CURDATE(), FALSE, FALSE, FALSE)",
        [nombre, email, contraseña, imagen_perfil, intereses]
      )

      return await User.findById(result.insertId)
    } catch (error) {
      console.error("Error al crear usuario:", error)
      throw error
    }
  }

  static async update(id, userData) {
    try {
      const { nombre, email, imagen_perfil, intereses, antecedentes } = userData
      await query(
        "UPDATE Usuario SET nombre = ?, email = ?, imagen_perfil = ?, intereses = ?, antecedentes = ? WHERE id_usuario = ?",
        [nombre, email, imagen_perfil, intereses, antecedentes, id]
      )

      return await User.findById(id)
    } catch (error) {
      console.error("Error al actualizar usuario:", error)
      throw error
    }
  }

  static async delete(id) {
    try {
      await query("DELETE FROM Usuario WHERE id_usuario = ?", [id])
      return true
    } catch (error) {
      console.error("Error al eliminar usuario:", error)
      throw error
    }
  }

  static async suspendAccount(id, suspended = true) {
    try {
      await query("UPDATE Usuario SET cuenta_suspendida = ? WHERE id_usuario = ?", [suspended, id])
      return await User.findById(id)
    } catch (error) {
      console.error("Error al suspender/activar cuenta:", error)
      throw error
    }
  }

  static async setModerator(id, isModerator = true) {
    try {
      await query("UPDATE Usuario SET moderador = ? WHERE id_usuario = ?", [isModerator, id])
      return await User.findById(id)
    } catch (error) {
      console.error("Error al establecer moderador:", error)
      throw error
    }
  }

  static async toggleShowcaseMode(id, showcaseMode = true) {
    try {
      await query("UPDATE Usuario SET modo_vitrina = ? WHERE id_usuario = ?", [showcaseMode, id])
      return await User.findById(id)
    } catch (error) {
      console.error("Error al cambiar modo vitrina:", error)
      throw error
    }
  }
}

module.exports = User
