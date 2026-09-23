const { getTransporter } = require('../config/mailer');
const env = require('../config/env');
const logger = require('../utils/logger');

async function sendMail({ to, subject, text, html }) {
  if (!env.smtp.host || !to) {
    logger.warn('Email skipped (SMTP not configured or no recipient):', subject);
    return;
  }
  try {
    await getTransporter().sendMail({
      from: env.smtp.from,
      to,
      subject,
      text,
      html: html || `<p>${text}</p>`,
    });
  } catch (err) {
    logger.error('Failed to send email:', err.message);
  }
}

module.exports = { sendMail };
