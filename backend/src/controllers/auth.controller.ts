import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler.js';
import { SuccessResponse } from '@utils/ApiResponse.js';
import * as authService from '@services/auth.service.js';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, phone, password } = req.body;
  const result = await authService.registerStaff(name, email, phone, password);
  return SuccessResponse(201, 'Registration successful. Please check your email to verify your account.', result);
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  const result = await authService.verifyEmail(email, otp);
  return SuccessResponse(
    200,
    'Email verified successfully. Please wait for admin approval.',
    result,
  );
});

export const resendVerification = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  const result = await authService.resendVerificationEmail(email);
  return SuccessResponse(200, 'Verification email sent. Please check your inbox.', result);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.loginUser(email, password);
  return SuccessResponse(200, 'Login successful', result);
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.getCurrentUser(req.user.id);
  return SuccessResponse(200, 'OK', result);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  await authService.logoutUser(req.token);
  return SuccessResponse(200, 'Logged out successfully', {});
});

export default {
  register,
  verifyEmail,
  resendVerification,
  login,
  getMe,
  logout,
};