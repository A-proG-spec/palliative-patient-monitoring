// API Response Messages
export const MESSAGES = {
  // Auth
  REGISTER_SUCCESS: 'Registration successful. Please check your email to verify your account.',
  REGISTER_EMAIL_EXISTS: 'Email already registered',
  LOGIN_SUCCESS: 'Login successful',
  LOGIN_INVALID: 'Invalid email or password',
  LOGIN_EMAIL_NOT_VERIFIED: 'Please verify your email before logging in',
  LOGIN_ACCOUNT_PENDING: 'Account pending admin approval',
  LOGIN_ACCOUNT_REJECTED: 'Account has been rejected',
  LOGOUT_SUCCESS: 'Logged out successfully',
  EMAIL_VERIFIED: 'Email verified successfully. Please wait for admin approval.',
  EMAIL_ALREADY_VERIFIED: 'Email already verified. Please login.',
  EMAIL_VERIFICATION_SENT: 'Verification email sent. Please check your inbox.',
  EMAIL_VERIFICATION_FAILED: 'Failed to send verification email',
  INVALID_VERIFICATION_TOKEN: 'Invalid verification link',
  EXPIRED_VERIFICATION_TOKEN: 'Verification link has expired. Please request a new one.',
  USER_NOT_FOUND: 'User not found',

  // Staff
  STAFF_APPROVED: 'Staff approved successfully',
  STAFF_REJECTED: 'Staff registration rejected',
  STAFF_NOT_FOUND: 'Staff member not found',
  STAFF_ALREADY_APPROVED: 'Staff member is already approved',
  INVALID_ROLE: 'Invalid role specified',

  // Patient
  PATIENT_REGISTERED: 'Patient registered successfully',
  PATIENT_NOT_FOUND: 'Patient not found',
  PATIENT_ALREADY_CLOSED: 'Patient case is already closed',
  PATIENT_CLOSED: 'Patient case closed successfully',
  INVALID_CLOSE_REASON: 'Invalid close reason',

  // Visits
  VISIT_RECORDED: 'Home visit recorded successfully',
  VISIT_NOT_FOUND: 'Visit not found',

  // Medications
  MEDICATION_ORDERED: 'Medication ordered successfully',
  MEDICATION_NOT_FOUND: 'Medication not found',
  MEDICATION_STATUS_UPDATED: 'Medication status updated',

  // Labs
  LAB_ORDERED: 'Lab test ordered successfully',
  LAB_NOT_FOUND: 'Lab test not found',
  LAB_RESULT_UPDATED: 'Lab test result updated',
  LAB_ALREADY_COMPLETED: 'Lab test is already completed',

  // Referrals
  REFERRAL_REQUESTED: 'Referral requested successfully',
  REFERRAL_NOT_FOUND: 'Referral not found',
  REFERRAL_APPROVED: 'Referral approved',
  REFERRAL_DECLINED: 'Referral declined',
  REFERRAL_ALREADY_PROCESSED: 'Referral has already been processed',
  REFERRAL_MUST_BE_ACCEPTED: 'Referral must be accepted before admission',
  PREPARED_BY_REQUIRED: 'preparedBy, preparedByDesignation, and signature are required',

  // Admissions
  ADMISSION_RECORDED: 'Admission recorded successfully',
  ADMISSION_NOT_FOUND: 'Admission not found',
  ADMISSION_UPDATED: 'Admission updated successfully',
  DISCHARGE_FIELDS_REQUIRED: 'Discharge date and reason required for discharge',

  // Notifications
  NOTIFICATION_MARKED_READ: 'Notification marked as read',
  NOTIFICATION_NOT_FOUND: 'Notification not found',

  // Common
  OK: 'OK',
  INTERNAL_ERROR: 'Something went wrong',
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden',
  VALIDATION_ERROR: 'Validation error',
};

// User Roles
export const ROLES = {
  TEAM_LEADER: 'TeamLeader',
  PHYSICIAN: 'Physician',
  NURSE: 'Nurse',
  ADMIN: 'admin',
  STAFF: 'staff',
} as const;

// Staff Statuses
export const STAFF_STATUS = {
  PENDING: 'Pending',
  ACTIVE: 'Active',
  REJECTED: 'Rejected',
} as const;

// Patient Statuses
export const PATIENT_STATUS = {
  ACTIVE: 'Active',
  DISCHARGED: 'Discharged',
} as const;

// Patient Locations
export const PATIENT_LOCATION = {
  HOME: 'Home',
  REFERRED_HOSPITAL: 'ReferredHospital',
} as const;

// Referral Statuses
export const REFERRAL_STATUS = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  DECLINED: 'Declined',
  ADMITTED: 'Admitted',
  INFO_REQUESTED: 'InfoRequested',
} as const;

// Disease Stages
export const DISEASE_STAGE = {
  EARLY: 'Early',
  ADVANCED: 'Advanced',
  END_STAGE: 'EndStage',
  TERMINAL: 'Terminal',
} as const;

// Visit Types
export const VISIT_TYPES = {
  ROUTINE: 'Routine',
  EMERGENCY: 'Emergency',
  FIRST_ASSESSMENT: 'FirstAssessment',
  POST_DISCHARGE: 'PostDischarge',
  END_OF_LIFE: 'EndOfLife',
  BEREAVEMENT: 'Bereavement',
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  STAFF_APPROVAL: 'StaffApproval',
  REFERRAL_APPROVAL: 'ReferralApproval',
  CLOSE_CASE: 'CloseCase',
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// API Response Status
export const RESPONSE_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// Token Expiry
export const TOKEN = {
  VERIFICATION_EXPIRY: 86400, // 24 hours in seconds
  JWT_EXPIRE: '7d',
} as const;