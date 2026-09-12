import { Staff } from '@models/Staff.js';
import { Admin } from '@models/Admin.js';
import { Notification } from '@models/Notification.js';
import { ApiError } from '@utils/ApiError.js';
import { hashPassword, comparePassword } from '@utils/password.js';
import { generateToken } from '@utils/jwt.js';
import { generateOtp, generateVerificationToken, hashOtp,compareOtpHash } from '@utils/token.js';
import { sendVerificationEmail } from '@utils/email.js';
import env from '@config/env.js';

export const registerStaff = async (
  name: string,
  email: string,
  phone: string,
  password: string
) => {
  // Check if email already exists
  const existingStaff = await Staff.findOne({ email });
  if (existingStaff) {
    throw new ApiError(400, 'Email already registered');
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Generate verification token
  const otp = generateOtp();
  const hashedOtp = hashOtp(otp)
  const otpExpiry = new Date(Date.now()+10*60*1000);

  // Create staff
  const staff = await Staff.create({
    name,
    email,
    phone,
    password: hashedPassword,
    status: 'Pending',
    isEmailVerified: false,
    emailVerificationOtp: hashedOtp,
    emailVerificationOtpExpires: otpExpiry,
    emailVerificationOtpAttempts:0,
  });

  // Send verification email
  try {
    await sendVerificationEmail(email, name, otp);
  } catch (error) {
    console.error('Failed to send verification email:', error);
    // Don't throw error - staff is created, they can request resend
  }

  // Return staff without password
  const { password: _, ...staffWithoutPassword } = staff.toObject();
  return {
    ...staffWithoutPassword,
    id: staffWithoutPassword._id.toString(),
  };
};

export const verifyEmail = async (email: string, otp: string) => {
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Find the staff by email
  const staff = await Staff.findOne({ email: normalizedEmail });
  if (!staff) {
    throw new ApiError(400, 'Invalid verification code');
  }

  // 2. Check verified already
  if (staff.isEmailVerified) {
    throw new ApiError(400, 'Email already verified. Please login.');
  }

  // 3. Check we have an active OTP
  if (!staff.emailVerificationOtp || !staff.emailVerificationOtpExpires) {
    throw new ApiError(400, 'No verification code found. Please request a new one.');
  }

  // 4. Check expiry
  if (staff.emailVerificationOtpExpires.getTime() < Date.now()) {
    // Clear the expired OTP
    staff.emailVerificationOtp = null;
    staff.emailVerificationOtpExpires = null;
    staff.emailVerificationOtpAttempts = 0;
    await staff.save();
    throw new ApiError(400, 'Verification code has expired. Please request a new one.');
  }

  // 5. Check attempts limit (max 5 wrong tries)
  if (staff.emailVerificationOtpAttempts >= 5) {
    // Invalidate the OTP — too many failures
    staff.emailVerificationOtp = null;
    staff.emailVerificationOtpExpires = null;
    staff.emailVerificationOtpAttempts = 0;
    await staff.save();
    throw new ApiError(
      429,
      'Too many incorrect attempts. Please request a new code.',
    );
  }

  // 6. Compare OTP (constant-time)
  const isMatch = compareOtpHash(otp, staff.emailVerificationOtp);
  if (!isMatch) {
    staff.emailVerificationOtpAttempts += 1;
    await staff.save();
    const remaining = 5 - staff.emailVerificationOtpAttempts;
    throw new ApiError(
      400,
      `Invalid verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
    );
  }

  // 7. Success — mark verified, clear OTP
  staff.isEmailVerified = true;
  staff.emailVerificationOtp = null;
  staff.emailVerificationOtpExpires = null;
  staff.emailVerificationOtpAttempts = 0;
  await staff.save();

  // 8. Notify admins
  await Notification.create({
    type: 'StaffApproval',
    message: `New staff registration pending: ${staff.name}`,
    data: {
      staffId: staff._id,
      staffName: staff.name,
    },
    read: false,
  });

  return {
    email: staff.email,
    isEmailVerified: true,
  };
};

export const resendVerificationEmail = async (email: string) => {
  const normalizedEmail = email.toLowerCase().trim();

  const staff = await Staff.findOne({ email: normalizedEmail });
  if (!staff) {
    throw new ApiError(404, 'No account found with this email');
  }

  if (staff.isEmailVerified) {
    throw new ApiError(400, 'Email already verified. Please login.');
  }

  // Rate limit: don't allow resend more than once every 60 seconds
  if (staff.updatedAt) {
    const secondsSinceUpdate = (Date.now() - staff.updatedAt.getTime()) / 1000;
    if (secondsSinceUpdate < 60) {
      const wait = Math.ceil(60 - secondsSinceUpdate);
      throw new ApiError(429, `Please wait ${wait} seconds before requesting a new code.`);
    }
  }

  // Generate a fresh OTP
  const otp = generateOtp();
  const hashedOtp = hashOtp(otp);
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  staff.emailVerificationOtp = hashedOtp;
  staff.emailVerificationOtpExpires = otpExpiry;
  staff.emailVerificationOtpAttempts = 0;
  await staff.save();

  await sendVerificationEmail(staff.email, staff.name, otp);

  return {
    email: staff.email,
  };
};

export const loginUser = async (email: string, password: string) => {
  // Try to find staff
  let user = await Staff.findOne({ email });
  let userType = 'staff';

  if (!user) {
    // Try to find admin
    const admin = await Admin.findOne({ email });
    if (admin) {
      user = admin as any;
      userType = 'admin';
    }
  }

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Compare password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Staff-specific checks
  if (userType === 'staff') {
    const staff = user as any;

    if (!staff.isEmailVerified) {
      throw new ApiError(401, 'Please verify your email before logging in');
    }

    if (staff.status === 'Pending') {
      throw new ApiError(401, 'Account pending admin approval');
    }

    if (staff.status === 'Rejected') {
      throw new ApiError(401, 'Account has been rejected');
    }
  }

  // Generate JWT token
  const token = generateToken(user._id.toString(), user.email);

  // Build user response
  const userResponse: any = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    type: userType,
    createdAt: user.createdAt,
  };

  if (userType === 'staff') {
    const staff = user as any;
    userResponse.phone = staff.phone;
    userResponse.role = staff.role;
    userResponse.status = staff.status;
    userResponse.isEmailVerified = staff.isEmailVerified;
  }

  return {
    token,
    user: userResponse,
  };
};

export const getCurrentUser = async (userId: string) => {
  // Try to find staff
  let user = await Staff.findById(userId).select('-password');
  let userType = 'staff';

  if (!user) {
    const admin = await Admin.findById(userId).select('-password');
    if (admin) {
      user = admin as any;
      userType = 'admin';
    }
  }

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const userResponse: any = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    type: userType,
    createdAt: user.createdAt,
  };

  if (userType === 'staff') {
    const staff = user as any;
    userResponse.phone = staff.phone;
    userResponse.role = staff.role;
    userResponse.status = staff.status;
    userResponse.isEmailVerified = staff.isEmailVerified;
  }

  return userResponse;
};

export const logoutUser = async (token: string) => {
  // Stateless JWT - no server-side action needed
  // Token is discarded on client side
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