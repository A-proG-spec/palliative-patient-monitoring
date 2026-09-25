import emailTransporter, { emailConfig } from '@config/email.js';
import { logger } from '@config/logger.js';

/**
 * Escape HTML special characters in user-supplied strings before
 * interpolating them into an email HTML template.
 */
const escapeHtml = (value: unknown): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const sendVerificationEmail = async (
  to: string,
  name: string,
  otp: string,
): Promise<void> => {
  const mailOptions = {
    from: emailConfig.from,
    to,
    subject: `Your verification code: ${otp} - Palliative Care System`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #002395;">Welcome to Palliative Care System!</h2>
        <p>Dear <strong>${escapeHtml(name)}</strong>,</new_str>
        <p>Thank you for registering. Use the code below to verify your email address:</p>

        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; padding: 16px 32px; background-color: #F7F9FE; border: 2px solid #002395; border-radius: 8px;">
            <span style="font-family: 'Courier New', monospace; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #002395;">
              ${otp}
            </span>
          </div>
        </div>

        <p>This code will expire in <strong>10 minutes</strong>.</p>
        <p>If you did not register for this account, please ignore this email.</p>

        <hr style="border: 1px solid #eee; margin-top: 24px;" />
        <p style="color: #666; font-size: 12px;">
          &copy; ${new Date().getFullYear()} Palliative Care System. All rights reserved.
        </p>
      </div>
    `,
  };

  try {
    await emailTransporter.sendMail(mailOptions);
    logger.info(`Verification OTP sent to ${to}`);
  } catch (error) {
    logger.error('Failed to send verification email:', error);
    throw new Error('Failed to send verification email');
  }
};
export const sendAdminRegistrationNoticeEmail = async (
  adminEmail: string,
  candidate: {
    name: string;
    email: string;
    phone: string;
    role: string;
  },
): Promise<void> => {
  const mailOptions = {
    from: emailConfig.from,
    to: adminEmail,
    subject: `New staff registration: ${candidate.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #002395;">New Staff Registration Attempt</h2>

        <p>A new user is trying to register on the Palliative Care System.</p>

        <table style="border-collapse: collapse; margin-top: 16px; width: 100%;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Name</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(candidate.name)}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Email</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(candidate.email)}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Phone</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(candidate.phone)}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Requested role</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; color: #002395;"><strong>${escapeHtml(candidate.role)}</strong></td>
          </tr>
        </table>

        <p style="margin-top: 24px;">
          <em>Note:</em> the requested role is not stored in the database.
          Please review their application and assign a role when approving
          their account.
        </p>

        <hr style="border: 1px solid #eee; margin-top: 24px;" />
        <p style="color: #666; font-size: 12px;">
          &copy; ${new Date().getFullYear()} Palliative Care System. All rights reserved.
        </p>
      </div>
    `,
  };

  try {
    await emailTransporter.sendMail(mailOptions);
    logger.info(`Registration notice sent to admin: ${adminEmail}`);
  } catch (error) {
    logger.error(`Failed to send admin notice to ${adminEmail}:`, error);
    // Deliberately do NOT rethrow — the staff registration should not
    // fail just because the admin notification email couldn't go out.
  }
};

export default { sendVerificationEmail,sendAdminRegistrationNoticeEmail };