const nodemailer = require("nodemailer")

// Crear transporter para enviar correos
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT === "465", // true para 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// Función para enviar correo electrónico
const sendEmail = async (to, subject, html) => {
  try {
    // Verificar si la configuración de correo está completa
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("⚠️ Configuración de correo incompleta. No se enviará el correo.")
      return false
    }

    // Configuración del correo
    const mailOptions = {
      from: `"PinArtesans" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    }

    // Enviar correo
    const info = await transporter.sendMail(mailOptions)
    console.log(`✉️ Correo enviado: ${info.messageId}`)
    return true
  } catch (error) {
    console.error("❌ Error al enviar correo:", error)
    return false
  }
}

// Plantillas de correo
const emailTemplates = {
  welcome: (username) => ({
    subject: "¡Bienvenido a PinArtesans!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #e60023;">¡Bienvenido a PinArtesans, ${username}!</h1>
        <p>Gracias por unirte a nuestra comunidad de artesanos y creativos.</p>
        <p>Ahora puedes comenzar a compartir tus creaciones y descubrir el trabajo de otros artesanos.</p>
        <p>¡Esperamos ver tus proyectos pronto!</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #666;">Este es un correo automático, por favor no respondas a este mensaje.</p>
        </div>
      </div>
    `,
  }),

  passwordReset: (username, resetLink) => ({
    subject: "Restablecimiento de contraseña - PinArtesans",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #e60023;">Restablecimiento de contraseña</h1>
        <p>Hola ${username},</p>
        <p>Has solicitado restablecer tu contraseña en PinArtesans.</p>
        <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
        <p><a href="${resetLink}" style="background-color: #e60023; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Restablecer contraseña</a></p>
        <p>Este enlace expirará en 1 hora.</p>
        <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #666;">Este es un correo automático, por favor no respondas a este mensaje.</p>
        </div>
      </div>
    `,
  }),
}

module.exports = {
  sendEmail,
  emailTemplates,
}
