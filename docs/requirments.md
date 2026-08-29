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

### C. Home Visits

| ID | Requirement | Priority | Actor |
|---|---|---|---|
| FR-22 | Staff can record home visits | Must | Staff |
| FR-23 | Home visit records include patient condition, vitals, pain assessment | Must | Staff |
| FR-24 | Home visit records include symptoms, functional status, ADL | Must | Staff |
| FR-25 | Home visit records include medication review, caregiver assessment | Must | Staff |
| FR-26 | Home visit records include education provided, home environment | Must | Staff |
| FR-27 | Home visit records include red flag assessment and actions taken | Must | Staff |
| FR-28 | Staff can schedule follow-up visits | Should | Staff |

### D. Medications

| ID | Requirement | Priority | Actor |
|---|---|---|---|
| FR-29 | Staff can order medications for patients | Must | Staff |
| FR-30 | Medication records include name, dosage, frequency, route | Must | Staff |
| FR-31 | Medication records include location (Home or Hospital) | Must | Staff |
| FR-32 | Medication records include prescribed by and status | Must | Staff |

### E. Laboratory Tests

| ID | Requirement | Priority | Actor |
|---|---|---|---|
| FR-33 | Staff can order laboratory tests | Must | Staff |
| FR-34 | Lab test records include test name, ordered date, performed date | Must | Staff |
| FR-35 | Lab test records include result as text description | Must | Staff |
| FR-36 | Lab test records include location (Home or Hospital) | Must | Staff |

### F. Referrals

| ID | Requirement | Priority | Actor |
|---|---|---|---|
| FR-37 | Staff can request patient referrals | Must | Staff |
| FR-38 | Referral requests include patient info, clinical info, reason | Must | Staff |
| FR-39 | Referral requests include prepared by details (name, designation, signature) | Must | Staff |
| FR-40 | Admin can approve or decline referral requests | Must | Admin |
| FR-41 | Referral approval triggers patient location change to ReferredHospital | Must | System |
| FR-42 | Referral declined keeps patient in Active status | Must | System |
| FR-43 | Referral records include follow-up status | Should | Staff, Admin |

### G. Hospital Admission

| ID | Requirement | Priority | Actor |
|---|---|---|---|
| FR-44 | Staff can create hospital admission records for referred patients | Must | Staff |
| FR-45 | Admission records include patient identification, referral info | Must | Staff |
| FR-46 | Admission records include medical diagnosis and palliative eligibility | Must | Staff |
| FR-47 | Admission records include pain assessment and initial care plan | Must | Staff |
| FR-48 | Admission records include assigned bed and care team | Must | Staff |
| FR-49 | Admission status changes to Discharged upon hospital discharge | Must | System |

### H. Staff Dashboard

| ID | Requirement | Priority | Actor |
|---|---|---|---|
| FR-50 | Staff has a dashboard with assigned patients overview | Must | Staff |
| FR-51 | Staff dashboard shows today's visits count | Must | Staff |
| FR-52 | Staff dashboard shows total and active patients | Must | Staff |
| FR-53 | Staff dashboard shows recent visits | Must | Staff |
| FR-54 | Staff dashboard shows upcoming scheduled visits | Must | Staff |
| FR-55 | Staff dashboard shows alerts (red flags, pending referrals, overdue visits) | Must | Staff |
| FR-56 | Staff dashboard auto-refreshes every 60 seconds | Should | Staff |

### I. Reports

| ID | Requirement | Priority | Actor |
|---|---|---|---|
| FR-57 | Staff can view patient summary reports | Must | Staff |
| FR-58 | Admin can view comprehensive patient statistics | Must | Admin |
| FR-59 | Reports include patient history, visits, medications, lab results | Must | Staff, Admin |
| FR-60 | Reports include referral history and admission details | Should | Staff, Admin |
| FR-61 | Admin can export reports in PDF or Excel format | Could | Admin |

## 2. Non-Functional Requirements

| Category | Requirement | Verification Method |
|---|---|---|
| Performance | Page loads in under 3 seconds | Manual timing |
| Security | Passwords hashed with bcrypt | Code review |
| Security | Admin and staff areas authenticated | Code review |
| Security | Role-based access control enforced | Manual testing |
| Security | Email verification required before login | Manual testing |
| Usability | Mobile-responsive design | Manual testing |
| Availability | 99% uptime target | Monitoring |
| Data Integrity | Patient records immutable (no updates) | Code review |
| Data Accuracy | All forms validated before submission | Code review |

## 3. Explicitly Out of Scope

- No patient self-registration
- No patient portal
- No SMS notifications
- No file attachments for lab results
- No real-time updates
- No payment processing
- No appointment reminders
- No export functionality for staff (admin only)
- No social login (Google, Facebook, etc.)

