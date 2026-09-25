import nodemailer from 'nodemailer';
import env from './env.js';
import { logger } from './logger.js';

const emailTransporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: env.GMAIL_USER,
    pass: env.GMAIL_APP_PASSWORD,
  },
});

// Verify transporter connection
emailTransporter.verify((error, success) => {
  if (error) {
    logger.error('Email transporter verification failed:', error);
  } else {
    logger.info('Email transporter ready');
  }
});

export const emailConfig = {
  from: env.EMAIL_FROM,
  verificationTokenExpiry: env.VERIFICATION_TOKEN_EXPIRY,
  frontendUrl: env.FRONTEND_URL,
};

export default emailTransporter;