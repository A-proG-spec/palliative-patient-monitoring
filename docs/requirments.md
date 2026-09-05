# requirements.md

# PALLIATIVE PATIENT MONITORING SYSTEM - REQUIREMENTS

## 1. Functional Requirements

### A. User Management & Authentication

| ID | Requirement | Priority | Actor |
|---|---|---|---|
| FR-01 | Staff can register with email, password, name, and phone number | Must | Staff |
| FR-02 | System sends verification email to staff upon registration | Must | System |
| FR-03 | Staff must verify email address before account becomes active | Must | Staff |
| FR-04 | Staff can request a new verification email if not received | Must | Staff |
| FR-05 | Admin can view pending staff registrations | Must | Admin |
| FR-06 | Admin can approve or reject staff registrations | Must | Admin |
| FR-07 | Admin can assign roles to approved staff (Team Leader, Physician, Nurse) | Must | Admin |
| FR-08 | Users can login with email and password | Must | Staff, Admin |
| FR-09 | System returns user role upon login for frontend routing | Must | System |
| FR-10 | Admin has a dashboard with system statistics | Must | Admin |
| FR-11 | Admin dashboard shows notifications for pending staff approvals | Must | Admin |
| FR-12 | Admin dashboard shows notifications for new referrals | Must | Admin |
| FR-13 | Admin dashboard shows notifications for recent case closures | Must | Admin |
| FR-14 | Staff can view and update their profile (name, phone) | Should | Staff |
| FR-14a | Users can change their password with current password verification | Should | Staff, Admin |
| FR-14b | Users can view their activity statistics (visits, patients, last login) | Should | Staff, Admin |
| FR-14c | Unauthorized access attempts redirect to a dedicated unauthorized page | Must | System |

### B. Patient Management

| ID | Requirement | Priority | Actor |
|---|---|---|---|
| FR-15 | Staff can register new patients | Must | Staff |
| FR-16 | Patient registration includes demographics and initial medical data | Must | Staff |
| FR-17 | Staff can view patient history (read-only) | Must | Staff |
| FR-18 | Admin can view all patient data | Must | Admin |
| FR-19 | Patient has status: Active or Closed | Must | System |
| FR-20 | Patient has current location: Home or ReferredHospital | Must | System |
| FR-21 | Admin can close patient cases (case closed) | Must | Admin |
| FR-22 | Admin can view patient details with full records (visits, medications, labs, referrals, admissions) | Must | Admin |
| FR-23 | Admin can click on patient name in any admin table to navigate to patient detail page | Must | Admin |
| FR-23a | Hospital MRN (Medical Record Number) is stored when patient is admitted | Should | Staff |

### C. Home Visits

| ID | Requirement | Priority | Actor |
|---|---|---|---|
| FR-24 | Staff can record home visits | Must | Staff |
| FR-25 | Home visit records include patient condition, vitals, pain assessment | Must | Staff |
| FR-26 | Home visit records include symptoms, functional status, ADL | Must | Staff |
| FR-27 | Home visit records include medication review, caregiver assessment | Must | Staff |
| FR-28 | Home visit records include education provided, home environment | Must | Staff |
| FR-29 | Home visit records include red flag assessment and actions taken | Must | Staff |
| FR-30 | Staff can schedule follow-up visits | Should | Staff |
| FR-31 | Admin can edit visit records to correct errors | Must | Admin |
| FR-32 | All admin edits to visit records are tracked with audit trail (who, when, what changed) | Must | Admin |
| FR-33 | Staff cannot edit visit records after submission | Must | System |
| FR-33a | Team members (Physician, Nurse) can sign visit records using email + password verification | Should | Staff |
| FR-33b | Team Leader is automatically signed when creating a visit | Should | Staff |
| FR-33c | Visit cannot be finalized until all required team members have signed | Should | Staff |

### D. Medications

| ID | Requirement | Priority | Actor |
|---|---|---|---|
| FR-34 | Staff can order medications for patients | Must | Staff |
| FR-35 | Medication records include name, dosage, frequency, route | Must | Staff |
| FR-36 | Medication records include location (Home or Hospital) | Must | Staff |
| FR-37 | Medication records include prescribed by and status | Must | Staff |

### E. Laboratory Tests

| ID | Requirement | Priority | Actor |
|---|---|---|---|
| FR-38 | Staff can order laboratory tests | Must | Staff |
| FR-39 | Lab test records include test name, ordered date, performed date | Must | Staff |
| FR-40 | Lab test records include result as text description | Must | Staff |
| FR-41 | Lab test records include location (Home or Hospital) | Must | Staff |

### F. Referrals

| ID | Requirement | Priority | Actor |
|---|---|---|---|
| FR-42 | Staff can request patient referrals | Must | Staff |
| FR-43 | Referral requests include patient info, clinical info, reason | Must | Staff |
| FR-44 | Referral requests include prepared by details (name, designation, signature) | Must | Staff |
| FR-45 | Admin can approve or decline referral requests | Must | Admin |
| FR-46 | Referral approval triggers patient location change to ReferredHospital | Must | System |
| FR-47 | Referral declined keeps patient in Active status | Must | System |
| FR-48 | Referral records include follow-up status | Should | Staff, Admin |
| FR-49 | Admin can click on patient name in referral list to view patient details | Must | Admin |

### G. Hospital Admission

| ID | Requirement | Priority | Actor |
|---|---|---|---|
| FR-50 | Staff can create hospital admission records for referred patients | Must | Staff |
| FR-51 | Admission records include patient identification, referral info | Must | Staff |
| FR-52 | Admission records include medical diagnosis and palliative eligibility | Must | Staff |
| FR-53 | Admission records include pain assessment and initial care plan | Must | Staff |
| FR-54 | Admission records include assigned bed and care team | Must | Staff |
| FR-55 | Admission status changes to Discharged upon hospital discharge | Must | System |
| FR-55a | Admin can edit admission records to correct errors | Must | Admin |
| FR-55b | All admin edits to admission records are tracked with audit trail (who, when, what changed) | Must | Admin |
| FR-55c | Staff cannot edit admission records after submission | Must | System |
| FR-55d | Hospital MRN (Medical Record Number) is captured during admission | Should | Staff |

### H. Staff Dashboard

| ID | Requirement | Priority | Actor |
|---|---|---|---|
| FR-56 | Staff has a dashboard with assigned patients overview | Must | Staff |
| FR-57 | Staff dashboard shows today's visits count | Must | Staff |
| FR-58 | Staff dashboard shows total and active patients | Must | Staff |
| FR-59 | Staff dashboard shows recent visits | Must | Staff |
| FR-60 | Staff dashboard shows upcoming scheduled visits | Must | Staff |
| FR-61 | Staff dashboard shows alerts (red flags, pending referrals, overdue visits) | Must | Staff |
| FR-62 | Staff dashboard auto-refreshes every 60 seconds | Should | Staff |

### I. Reports & Print

| ID | Requirement | Priority | Actor |
|---|---|---|---|
| FR-63 | Staff can view patient summary reports | Must | Staff |
| FR-64 | Admin can view comprehensive patient statistics | Must | Admin |
| FR-65 | Reports include patient history, visits, medications, lab results | Must | Staff, Admin |
| FR-66 | Reports include referral history and admission details | Should | Staff, Admin |
| FR-67 | Admin can export reports in PDF or Excel format | Could | Admin |
| FR-68 | Staff and Admin can print/export patient history as PDF | Should | Staff, Admin |
| FR-69 | Printable patient history includes all data: demographics, visits, medications, lab tests, referrals, admissions, KPS/PPS progress | Should | Staff, Admin |
| FR-70 | Print view is formatted for professional presentation with institution header | Should | System |
| FR-70a | Print view includes all visit details (vitals, pain scores, ADL, symptoms, red flags, team members, signatures) | Should | System |

### J. Toast Notifications

| ID | Requirement | Priority | Actor |
|---|---|---|---|
| FR-71 | System shows success toast notifications for successful operations | Must | System |
| FR-72 | System shows error toast notifications for failed operations | Must | System |
| FR-73 | System shows warning toast notifications for validation errors | Must | System |
| FR-74 | System shows info toast notifications for informational messages | Must | System |
| FR-75 | System shows loading toast notifications for in-progress operations | Should | System |

## 2. Non-Functional Requirements

| Category | Requirement | Verification Method |
|---|---|---|
| Performance | Page loads in under 3 seconds | Manual timing |
| Security | Passwords hashed with bcrypt | Code review |
| Security | Admin and staff areas authenticated | Code review |
| Security | Role-based access control enforced | Manual testing |
| Security | Email verification required before login | Manual testing |
| Security | Admin edit actions are logged with audit trail | Code review |
| Security | Digital signatures require email + password verification | Code review |
| Usability | Mobile-responsive design | Manual testing |
| Usability | Print-ready format for patient records | Visual inspection |
| Usability | Toast notifications for all user actions | Visual inspection |
| Usability | Dedicated unauthorized page for access denial | Manual testing |
| Availability | 99% uptime target | Monitoring |
| Data Integrity | Patient records immutable (no updates except admin edits to visits/admissions) | Code review |
| Data Integrity | Visit edits tracked with audit trail | Code review |
| Data Integrity | Admission edits tracked with audit trail | Code review |
| Data Accuracy | All forms validated before submission | Code review |
| Accessibility | Toast notifications support screen readers | Manual testing |

## 3. Explicitly Out of Scope

- No patient self-registration
- No patient portal
- No SMS notifications
- No file attachments for lab results
- No real-time updates
- No payment processing
- No appointment reminders
- No export functionality for staff (admin only for reports)
- No social login (Google, Facebook, etc.)
- No staff editing of patient records (admin only)
- No bulk edit of visits
- No physical signature (digital signatures with email + password instead)
