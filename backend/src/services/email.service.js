/**
 * Email Service
 *
 * For production, configure with SendGrid, Mailgun, or similar service.
 * This is a placeholder that logs emails to console in development.
 */

/**
 * Send welcome email to new tenant
 * @param {Object} params
 * @param {string} params.to - Recipient email
 * @param {string} params.storeName - Name of the store
 * @param {string} params.slug - Store slug/subdomain
 * @param {string} params.loginUrl - URL to login
 */
export async function sendWelcomeEmail({ to, storeName, slug, loginUrl }) {
  const emailContent = {
    to,
    subject: `🎉 ¡Bienvenido a CloudShop, ${storeName}!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; padding: 40px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 40px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; }
          .content { padding: 40px; }
          .info-box { background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
          .info-row:last-child { border: none; }
          .btn { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; }
          .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>☁️ CloudShop</h1>
          </div>
          <div class="content">
            <h2>¡Tu tienda está lista! 🎉</h2>
            <p>Hola,</p>
            <p>¡Felicitaciones! Tu tienda <strong>${storeName}</strong> ha sido creada exitosamente.</p>

            <div class="info-box">
              <div class="info-row">
                <span>Tu tienda:</span>
                <strong>${slug}.cloudshop.com</strong>
              </div>
              <div class="info-row">
                <span>Email de acceso:</span>
                <strong>${to}</strong>
              </div>
            </div>

            <p style="text-align: center; margin: 30px 0;">
              <a href="${loginUrl}" class="btn">Acceder a mi tienda →</a>
            </p>

            <h3>Próximos pasos:</h3>
            <ol style="color: #475569; line-height: 1.8;">
              <li>Ingresa a tu panel de administración</li>
              <li>Agrega tus primeros productos</li>
              <li>Configura tus métodos de pago</li>
              <li>¡Empieza a vender!</li>
            </ol>

            <p>Tienes <strong>7 días de prueba gratis</strong> con acceso completo a todas las funcionalidades.</p>

            <p style="color: #64748b; margin-top: 30px;">
              ¿Necesitas ayuda? Responde a este email o contáctanos por WhatsApp.
            </p>
          </div>
          <div class="footer">
            <p>© 2026 CloudShop - El sistema de gestión para tiendas de ropa</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
¡Bienvenido a CloudShop, ${storeName}!

Tu tienda ha sido creada exitosamente.

Tu tienda: ${slug}.cloudshop.com
Email de acceso: ${to}

Accede a tu tienda: ${loginUrl}

Próximos pasos:
1. Ingresa a tu panel de administración
2. Agrega tus primeros productos
3. Configura tus métodos de pago
4. ¡Empieza a vender!

Tienes 7 días de prueba gratis con acceso completo.

¿Necesitas ayuda? Responde a este email o contáctanos por WhatsApp.

© 2026 CloudShop
    `
  };

  // In production, send via email service
  if (process.env.SENDGRID_API_KEY) {
    // TODO: Implement SendGrid integration
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send({ ...emailContent, from: process.env.EMAIL_FROM });
    console.log('📧 Email sent via SendGrid:', to);
  } else {
    // Log to console in development
    console.log('📧 [DEV] Welcome email would be sent to:', to);
    console.log('   Subject:', emailContent.subject);
  }

  return { success: true, to };
}

/**
 * Send payment reminder email
 */
export async function sendPaymentReminderEmail({ to, storeName, dueDate }) {
  console.log(`📧 [DEV] Payment reminder would be sent to ${to} for ${storeName}, due: ${dueDate}`);
  return { success: true, to };
}

/**
 * Send subscription cancelled email
 */
export async function sendCancellationEmail({ to, storeName, accessUntil }) {
  console.log(`📧 [DEV] Cancellation email would be sent to ${to} for ${storeName}, access until: ${accessUntil}`);
  return { success: true, to };
}

/**
 * Send trial ending soon email
 */
export async function sendTrialEndingEmail({ to, storeName, daysRemaining }) {
  console.log(`📧 [DEV] Trial ending email would be sent to ${to} for ${storeName}, ${daysRemaining} days remaining`);
  return { success: true, to };
}
