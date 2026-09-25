import { ApiError } from '@utils/ApiError.js';
import { hashPassword, comparePassword } from '@utils/password.js';
import { generateToken } from '@utils/jwt.js';
import { generateOtp, hashOtp, compareOtpHash } from '@utils/token.js';
import { sendVerificationEmail, sendAdminRegistrationNoticeEmail } from '@utils/email.js';
import { prisma } from '../lib/prisma.js';

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────
const OTP_EXPIRY_MS = 10 * 60 * 1000;         // 10 minutes
const RESEND_COOLDOWN_MS = 60 * 1000;         // 60 seconds
const MAX_OTP_ATTEMPTS = 5;

// ═════════════════════════════════════════════════════════════
// Register staff
// ═════════════════════════════════════════════════════════════
export const registerStaff = async (
  name: string,
  email: string,
  phone: string,
  password: string,
  requestedRole: string,   // ← NEW — never persisted
) => {
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await prisma.staff.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });
  if (existing) {
    throw new ApiError(400, 'Email already registered');
  }

  const hashedPassword = await hashPassword(password);

  const otp = generateOtp();
  const hashedOtp = hashOtp(otp);
  const otpExpiry = new Date(Date.now() + OTP_EXPIRY_MS);

  const staff = await prisma.staff.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      password: hashedPassword,
      // NOTE: `role` deliberately NOT set here — it stays null until
      // an admin approves and assigns one. `requestedRole` only goes
      // into the admin notification email.
      status: 'Pending',
      isEmailVerified: false,
      emailVerificationOtp: hashedOtp,
      emailVerificationOtpExpires: otpExpiry,
      emailVerificationOtpAttempts: 0,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      isEmailVerified: true,
      createdAt: true,
    },
  });

  // ── 1. Verification email to the registrant ──
  try {
    await sendVerificationEmail(normalizedEmail, name, otp);
  } catch (err) {
    console.error('Failed to send verification email:', err);
  }

  // ── 2. Notification email(s) to all admins ──
  try {
    const admins = await prisma.admin.findMany({
      select: { email: true, name: true },
    });
    await Promise.all(
      admins.map((a) =>
        sendAdminRegistrationNoticeEmail(a.email, {
          name: staff.name,
          email: staff.email,
          phone: staff.phone,
          role: requestedRole,
        }),
      ),
    );
  } catch (err) {
    console.error('Failed to notify admins about registration:', err);
  }

  return staff;
};

// ═════════════════════════════════════════════════════════════
// Verify email
// ═════════════════════════════════════════════════════════════
export const verifyEmail = async (email: string, otp: string) => {
  const normalizedEmail = email.toLowerCase().trim();

  const staff = await prisma.staff.findUnique({
    where: { email: normalizedEmail },
  });
  if (!staff) {
    throw new ApiError(400, 'Invalid verification code');
  }

  if (staff.isEmailVerified) {
    throw new ApiError(400, 'Email already verified. Please login.');
  }

  if (!staff.emailVerificationOtp || !staff.emailVerificationOtpExpires) {
    throw new ApiError(400, 'No verification code found. Please request a new one.');
  }

  if (staff.emailVerificationOtpExpires.getTime() < Date.now()) {
    await prisma.staff.update({
      where: { id: staff.id },
      data: {
        emailVerificationOtp: null,
        emailVerificationOtpExpires: null,
        emailVerificationOtpAttempts: 0,
      },
    });
    throw new ApiError(400, 'Verification code has expired. Please request a new one.');
  }

  if (staff.emailVerificationOtpAttempts >= MAX_OTP_ATTEMPTS) {
    await prisma.staff.update({
      where: { id: staff.id },
      data: {
        emailVerificationOtp: null,
        emailVerificationOtpExpires: null,
        emailVerificationOtpAttempts: 0,
      },
    });
    throw new ApiError(429, 'Too many incorrect attempts. Please request a new code.');
  }

  const isMatch = compareOtpHash(otp, staff.emailVerificationOtp);
  if (!isMatch) {
    const updated = await prisma.staff.update({
      where: { id: staff.id },
      data: { emailVerificationOtpAttempts: { increment: 1 } },
      select: { emailVerificationOtpAttempts: true },
    });
    const remaining = MAX_OTP_ATTEMPTS - updated.emailVerificationOtpAttempts;
    throw new ApiError(
      400,
      `Invalid verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
    );
  }

  // Success
  await prisma.staff.update({
    where: { id: staff.id },
    data: {
      isEmailVerified: true,
      emailVerificationOtp: null,
      emailVerificationOtpExpires: null,
      emailVerificationOtpAttempts: 0,
    },
  });

  // Notify admins (fan-out not implemented — just create one notification)
  await prisma.notification.create({
    data: {
      type: 'StaffApproval',
      message: `New staff registration pending: ${staff.name}`,
      data: { staffId: staff.id, staffName: staff.name },
      read: false,
    },
  });

  return { email: staff.email, isEmailVerified: true };
};

// ═════════════════════════════════════════════════════════════
// Resend verification email
// ═════════════════════════════════════════════════════════════
export const resendVerificationEmail = async (email: string) => {
  const normalizedEmail = email.toLowerCase().trim();

  const staff = await prisma.staff.findUnique({
    where: { email: normalizedEmail },
  });
  if (!staff) {
    throw new ApiError(404, 'No account found with this email');
  }
  if (staff.isEmailVerified) {
    throw new ApiError(400, 'Email already verified. Please login.');
  }

  const RESEND_COOLDOWN_SECONDS = RESEND_COOLDOWN_MS / 1000;

  const secondsSinceUpdate = (Date.now() - staff.updatedAt.getTime()) / 1000;
  if (secondsSinceUpdate < RESEND_COOLDOWN_SECONDS) {
    const wait = Math.ceil(RESEND_COOLDOWN_SECONDS - secondsSinceUpdate);
    throw new ApiError(429, `Please wait ${wait} seconds before requesting a new code.`);
  }

  const otp = generateOtp();
  const hashedOtp = hashOtp(otp);
  const otpExpiry = new Date(Date.now() + OTP_EXPIRY_MS);

  await prisma.staff.update({
    where: { id: staff.id },
    data: {
      emailVerificationOtp: hashedOtp,
      emailVerificationOtpExpires: otpExpiry,
      emailVerificationOtpAttempts: 0,
    },
  });

  await sendVerificationEmail(staff.email, staff.name, otp);

  return { email: staff.email };
};

// ═════════════════════════════════════════════════════════════
// Login
// ═════════════════════════════════════════════════════════════
export const loginUser = async (email: string, password: string) => {
  const normalizedEmail = email.toLowerCase().trim();

  // ── Try Admin first ──
  const admin = await prisma.admin.findUnique({
    where: { email: normalizedEmail },
  });

  if (admin) {
    const ok = await comparePassword(password, admin.password);
    if (!ok) throw new ApiError(401, 'Invalid email or password');

    const token = generateToken(String(admin.id), admin.email, 'admin');

    return {
      token,
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        type: 'admin' as const,
        createdAt: admin.createdAt,
      },
    };
  }

  // ── Then Staff ──
  const staff = await prisma.staff.findUnique({
    where: { email: normalizedEmail },
  });
  if (!staff) throw new ApiError(401, 'Invalid email or password');

  const ok = await comparePassword(password, staff.password);
  if (!ok) throw new ApiError(401, 'Invalid email or password');

  if (!staff.isEmailVerified) {
    throw new ApiError(401, 'Please verify your email before logging in');
  }
  if (staff.status === 'Pending') {
    throw new ApiError(401, 'Account pending admin approval');
  }
  if (staff.status === 'Rejected') {
    throw new ApiError(401, 'Account has been rejected');
  }
  if (staff.deletedAt) {
    throw new ApiError(401, 'Account has been deactivated');
  }

  const token = generateToken(String(staff.id), staff.email, 'staff');

  return {
    token,
    user: {
      id: staff.id,
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      role: staff.role,
      type: 'staff' as const,
      status: staff.status,
      isEmailVerified: staff.isEmailVerified,
      createdAt: staff.createdAt,
    },
  };
};

// ═════════════════════════════════════════════════════════════
// Get current user
// ═════════════════════════════════════════════════════════════
export const getCurrentUser = async (
  userId: string | number,
  userType: 'staff' | 'admin',
) => {
  const id = Number(userId);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError(400, 'Invalid user id');
  }

  if (userType === 'admin') {
    const admin = await prisma.admin.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, createdAt: true },
    });
    if (!admin) throw new ApiError(404, 'User not found');
    return {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      type: 'admin' as const,
      createdAt: admin.createdAt,
    };
  }

  // staff path
  const staff = await prisma.staff.findUnique({
    where: { id },
    select: {
      id: true, name: true, email: true, phone: true, role: true,
      status: true, isEmailVerified: true, createdAt: true,
    },
  });
  if (!staff) throw new ApiError(404, 'User not found');
  return {
    id: staff.id,
    name: staff.name,
    email: staff.email,
    phone: staff.phone,
    role: staff.role,
    type: 'staff' as const,
    status: staff.status,
    isEmailVerified: staff.isEmailVerified,
    createdAt: staff.createdAt,
  };
};

// ═════════════════════════════════════════════════════════════
// Logout (stateless)
// ═════════════════════════════════════════════════════════════
export const logoutUser = async (_token: string) => {
  return;
};

export default {
  registerStaff,
  verifyEmail,
  resendVerificationEmail,
  loginUser,
  getCurrentUser,
  logoutUser,
};