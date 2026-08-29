// src/types/index.ts
// Re-export all types for convenient importing.
// Note: StaffProfile is defined in auth.types (with isEmailVerified + counts)
// and also in staff.types (dashboard-specific). Import directly from source
// files when you need a specific variant; the wildcard exports below favour
// the first definition encountered (auth.types wins for StaffProfile).

export * from './auth.types';
export * from './admin.types';
export * from './patient.types';
export * from './visit.types';
export * from './medication.types';
export * from './lab.types';
export * from './referral.types';
export * from './admission.types';
// staff.types re-exported except StaffProfile (already exported from auth.types)
export type {
  StaffDashboardStats,
  AssignedPatient,
  UpcomingVisit,
  RecentVisit,
  StaffAlert,
  AlertType,
  AlertsResponse,
  AssignedPatientsResponse,
  UpcomingVisitsResponse,
  RecentVisitsResponse,
} from './staff.types';
