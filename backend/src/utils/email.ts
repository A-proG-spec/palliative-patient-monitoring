import emailTransporter, { emailConfig } from '@config/email.js';

export interface VerificationEmailData {
  to: string;
  name: string;
  token: string;
}

export const sendVerificationEmail = async (
  to: string,
  name: string,
  token: string
): Promise<void> => {
  const verificationUrl = `${emailConfig.frontendUrl}/verify-email?token=${token}`;

  const mailOptions = {
    from: emailConfig.from,
    to,
    subject: 'Verify Your Email - Palliative Care System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #002395;">Welcome to Palliative Care System!</h2>
        <p>Dear <strong>${name}</strong>,</p>
        <p>Thank you for registering with the Palliative Patient Monitoring System.</p>
        <p>Please click the button below to verify your email address:</p>
        <p style="text-align: center;">
          <a href="${verificationUrl}" 
             style="display: inline-block; padding: 12px 30px; background-color: #002395; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Verify Email
          </a>
        </p>
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #002395;">${verificationUrl}</p>
        <p><strong>This link will expire in 24 hours.</strong></p>
        <hr style="border: 1px solid #eee;" />
        <p style="color: #666; font-size: 12px;">
          If you did not register for this account, please ignore this email.<br />
          &copy; ${new Date().getFullYear()} Palliative Care System. All rights reserved.
        </p>
      </div>
    `,
  };

  try {
    await emailTransporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${to}`);
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

export default { sendVerificationEmail };