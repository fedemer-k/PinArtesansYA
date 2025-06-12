# PinArtesans - Galería de Arte y Artesanías

Una plataforma web para artesanos donde pueden compartir y descubrir obras de arte únicas hechas a mano.

## 🎨 Características

- **Galería estilo Instagram** con diseño responsive
- **Sistema de autenticación** completo (registro/login)
- **Arquitectura MVC** con Express.js y Pug
- **Base de datos MySQL** con pool de conexiones
- **JWT Authentication** con cookies seguras
- **API REST** para carga infinita y likes
- **Stories de artesanos** con scroll horizontal
- **Búsqueda en tiempo real** de artesanías
- **Manejo de errores** profesional (404, 500)

## 🚀 Instalación

1. **Clonar el repositorio:**
\`\`\`bash
git clone <repository-url>
cd pinartesans-gallery
\`\`\`

2. **Instalar dependencias:**
\`\`\`bash
npm install
\`\`\`

3. **Configurar variables de entorno:**
\`\`\`bash
cp .env.example .env
# Editar .env con tus configuraciones
\`\`\`

4. **Configurar base de datos:**
\`\`\`bash
mysql -u root -p < database/schema.sql
\`\`\`

5. **Ejecutar la aplicación:**
\`\`\`bash
# Desarrollo
npm run dev

# Producción
npm start
\`\`\`

## 📁 Estructura del Proyecto

\`\`\`
pinartesans-gallery/
├── config/           # Configuración (DB, JWT)
├── controllers/      # Lógica de negocio
├── middleware/       # Middleware personalizado
├── models/           # Modelos de datos
├── routes/           # Rutas Express
├── views/            # Plantillas Pug
├── public/           # Archivos estáticos
├── database/         # Scripts SQL
└── server.js         # Punto de entrada
\`\`\`

## 🔧 Configuración

### Variables de Entorno (.env)

\`\`\`env
# Aplicación
PORT=3000
NODE_ENV=development

# Base de datos
DB_HOST=localhost
DB_DATABASE=artesanos
DB_USER=root
DB_PASS=tu_contraseña

# JWT
JWT_PRIVATE_KEY=JWT_PRIVATE_KEY_LABII
JWT_EXPIRATION=7d
JWT_EXPIRATION_COOKIE=7
\`\`\`

## 🛠️ Tecnologías Utilizadas

- **Backend:** Node.js, Express.js
- **Motor de plantillas:** Pug
- **Base de datos:** MySQL
- **Autenticación:** JWT + bcrypt
- **Estilos:** CSS puro
- **JavaScript:** Vanilla JS

## 📊 Funcionalidades

### Autenticación
- Registro de usuarios con validación
- Login con JWT y cookies seguras
- Middleware de protección de rutas
- Logout con limpieza de cookies

### Galería
- Grid responsive de imágenes
- Carga infinita con API
- Sistema de likes interactivo
- Búsqueda en tiempo real

### Stories
- Avatares de artesanos
- Scroll horizontal suave
- Gradientes coloridos

## 🔒 Seguridad

- Contraseñas hasheadas con bcrypt
- JWT tokens con expiración
- Cookies HTTP-only
- Validación de datos
- Variables de entorno para datos sensibles

## 📱 Responsive Design

La aplicación está optimizada para:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## 🚀 Despliegue

Para desplegar en producción:

1. Configurar variables de entorno de producción
2. Configurar base de datos MySQL
3. Ejecutar `npm start`

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.

## 👥 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

---

**Versión:** 1.1.0  
**Autor:** Tu Nombre  
**Contacto:** tu-email@ejemplo.com
