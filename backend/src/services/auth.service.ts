import { Staff } from '@models/Staff.js';
import { Admin } from '@models/Admin.js';
import { Notification } from '@models/Notification.js';
import { ApiError } from '@utils/ApiError.js';
import { hashPassword, comparePassword } from '@utils/password.js';
import { generateToken } from '@utils/jwt.js';
import { generateVerificationToken } from '@utils/token.js';
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
  const verificationToken = generateVerificationToken();
  const tokenExpiry = new Date();
  tokenExpiry.setSeconds(tokenExpiry.getSeconds() + env.VERIFICATION_TOKEN_EXPIRY);

  // Create staff
  const staff = await Staff.create({
    name,
    email,
    phone,
    password: hashedPassword,
    status: 'Pending',
    isEmailVerified: false,
    emailVerificationToken: verificationToken,
    emailVerificationTokenExpires: tokenExpiry,
  });

  // Send verification email
  try {
    await sendVerificationEmail(email, name, verificationToken);
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

export const verifyEmail = async (token: string) => {
  // Find staff by token
  const staff = await Staff.findOne({
    emailVerificationToken: token,
    emailVerificationTokenExpires: { $gt: new Date() },
  });

  if (!staff) {
    // Check if token exists but expired
    const expiredStaff = await Staff.findOne({
      emailVerificationToken: token,
    });

    if (expiredStaff) {
      throw new ApiError(400, 'Verification link has expired. Please request a new one.');
    }

    throw new ApiError(400, 'Invalid verification link');
  }

  // Check if already verified
  if (staff.isEmailVerified) {
    return {
      email: staff.email,
      isEmailVerified: true,
    };
  }

  // Update verification status
  staff.isEmailVerified = true;
  staff.emailVerificationToken = null;
  staff.emailVerificationTokenExpires = null;
  await staff.save();

  // Create notification for admin
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
  // Find staff by email
  const staff = await Staff.findOne({ email });

  if (!staff) {
    throw new ApiError(404, 'No account found with this email');
  }

  // Check if already verified
  if (staff.isEmailVerified) {
    throw new ApiError(400, 'Email already verified. Please login.');
  }

  // Check rate limiting (5 minutes)
  const lastSent = staff.updatedAt;
  const now = new Date();
  const diffMinutes = (now.getTime() - lastSent.getTime()) / 1000 / 60;

  if (diffMinutes < 5) {
    throw new ApiError(429, 'Please wait before requesting another email');
  }

  // Generate new token
  const verificationToken = generateVerificationToken();
  const tokenExpiry = new Date();
  tokenExpiry.setSeconds(tokenExpiry.getSeconds() + env.VERIFICATION_TOKEN_EXPIRY);

  staff.emailVerificationToken = verificationToken;
  staff.emailVerificationTokenExpires = tokenExpiry;
  await staff.save();

  // Send verification email
  await sendVerificationEmail(email, staff.name, verificationToken);

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