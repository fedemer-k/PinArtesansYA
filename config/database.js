const mysql = require("mysql2/promise")

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Removidas las opciones inválidas: acquireTimeout y timeout
}

// Crear pool de conexiones
const pool = mysql.createPool(dbConfig)

// Función para probar la conexión
const testConnection = async () => {
  try {
    const connection = await pool.getConnection()
    console.log("✅ Conexión a la base de datos establecida correctamente")
    connection.release()
    return true
  } catch (error) {
    console.error("❌ Error al conectar con la base de datos:", error.message)
    return false
  }
}

// Función para ejecutar queries
const query = async (sql, params = []) => {
  try {
    const [results] = await pool.execute(sql, params)
    return results
  } catch (error) {
    console.error("Error en la consulta SQL:", error)
    throw error
  }
}

module.exports = {
  pool,
  query,
  testConnection,
}
