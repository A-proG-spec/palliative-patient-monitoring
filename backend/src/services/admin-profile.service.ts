import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';
import { ApiError } from '@utils/ApiError.js';

// ═════════════════════════════════════════════════════════════
// Response shape
// ═════════════════════════════════════════════════════════════

export interface AdminProfile {
  id: number;
  name: string;
  email: string;
  type: 'admin';
  createdAt: string;
  updatedAt: string;
}

// ═════════════════════════════════════════════════════════════
// GET /admin/profile
// ═════════════════════════════════════════════════════════════

export async function getAdminProfile(
  adminId: number,
): Promise<AdminProfile> {
  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!admin) {
    throw new ApiError(404, 'Admin account not found');
  }

  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    type: 'admin',
    createdAt: admin.createdAt.toISOString(),
    updatedAt: admin.updatedAt.toISOString(),
  };
}

// ═════════════════════════════════════════════════════════════
// PUT /admin/profile
// ═════════════════════════════════════════════════════════════

export interface UpdateAdminProfileInput {
  name?: string;
}

export async function updateAdminProfile(
  adminId: number,
  input: UpdateAdminProfileInput,
): Promise<AdminProfile> {
  if (input.name === undefined) {
    return getAdminProfile(adminId);
  }

  const updated = await prisma.admin.update({
    where: { id: adminId },
    data: { name: input.name },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return {
    id: updated.id,
    name: updated.name,
    email: updated.email,
    type: 'admin',
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  };
}

// ═════════════════════════════════════════════════════════════
// PUT /admin/profile/password
// ═════════════════════════════════════════════════════════════

export interface ChangeAdminPasswordInput {
  currentPassword: string;
  newPassword: string;
}

export async function changeAdminPassword(
  adminId: number,
  input: ChangeAdminPasswordInput,
): Promise<{ id: number; updatedAt: string }> {
  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    select: { id: true, password: true },
  });

  if (!admin) {
    throw new ApiError(404, 'Admin account not found');
  }

  const matches = await bcrypt.compare(
    input.currentPassword,
    admin.password,
  );

  if (!matches) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  const isSame = await bcrypt.compare(
    input.newPassword,
    admin.password,
  );

  if (isSame) {
    throw new ApiError(
      400,
      'New password must be different from the current password',
    );
  }

  const hashed = await bcrypt.hash(input.newPassword, 10);

  const updated = await prisma.admin.update({
    where: { id: adminId },
    data: { password: hashed },
    select: { id: true, updatedAt: true },
  });

  return {
    id: updated.id,
    updatedAt: updated.updatedAt.toISOString(),
  };
}

// ═════════════════════════════════════════════════════════════
// GET /admin/profile/activity
// ═════════════════════════════════════════════════════════════

export interface AdminActivityStats {
  totalPatients: number;
  activePatients: number;
  dischargedPatients: number;
  pendingReferrals: number;
  pendingStaff: number;
  lastLogin: string;
  memberSince: string;
}

export async function getAdminActivityStats(
  adminId: number,
): Promise<AdminActivityStats> {
  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    select: { createdAt: true },
  });

  if (!admin) {
    throw new ApiError(404, 'Admin account not found');
  }

  const [
    totalPatients,
    activePatients,
    dischargedPatients,
    pendingReferrals,
    pendingStaff,
  ] = await Promise.all([
    prisma.patient.count(),
    prisma.patient.count({ where: { status: 'Active' } }),
    prisma.patient.count({ where: { status: 'Discharged' } }),
    prisma.referral.count({ where: { status: 'Pending' } }),
    prisma.staff.count({ where: { status: 'Pending' } }),
  ]);

  return {
    totalPatients,
    activePatients,
    dischargedPatients,
    pendingReferrals,
    pendingStaff,
    lastLogin: new Date().toISOString(),
    memberSince: admin.createdAt.toISOString(),
  };
}