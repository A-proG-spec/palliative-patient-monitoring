## `docs/requirements.md`

---

# Palliative Patient Monitoring System — Requirements

## 1.0 Project Overview

### 1.1 Purpose

The Palliative Patient Monitoring System is a comprehensive digital platform designed to support healthcare teams at Yekatit 12 Hospital Medical College (Y12HMC) in delivering coordinated, compassionate palliative care to patients in both home and hospital settings.

### 1.2 Scope

The system enables clinical staff to:

- Register and manage palliative care patients
- Record home visits using structured clinical checklists
- Order and track medications, laboratory tests, and imaging examinations
- Request and manage referrals between facilities
- Record hospital admissions and discharges
- Document patient progress notes with SOAP format
- Monitor patient functional status via KPS/PPS scoring
- Generate clinical reports and patient summaries
- Manage staff registrations and role-based access

### 1.3 Stakeholders

| Stakeholder | Role |
|-------------|------|
| Healthcare Staff | Primary users — Team Leaders, Physicians, Nurses |
| System Administrators | Manage staff approvals, oversee system operations |
| Patients | Recipients of palliative care services |
| Hospital Management | Oversee clinical operations and reporting |

---

## 2.0 Functional Requirements

### 2.1 Authentication & Authorization

| ID | Requirement | Priority |
|----|-------------|----------|
| **AUTH-01** | Users must register with name, email, phone, and password | Must |
| **AUTH-02** | Email verification required before staff approval | Must |
| **AUTH-03** | Admin approval required for all staff accounts | Must |
| **AUTH-04** | JWT authentication with Bearer token | Must |
| **AUTH-05** | Role-based access control (Admin, Staff) | Must |
| **AUTH-06** | Users can reset password via email link | Should |
| **AUTH-07** | Session timeout after period of inactivity | Should |

### 2.2 Patient Management

| ID | Requirement | Priority |
|----|-------------|----------|
| **PAT-01** | Staff can register new patients with demographic and medical information | Must |
| **PAT-02** | Each patient has a unique display ID (e.g., PAT-001) | Must |
| **PAT-03** | Patient records include: name, age, sex, date of birth, address, phone | Must |
| **PAT-04** | Patient records include: emergency contact, caregiver information | Must |
| **PAT-05** | Patient records include: primary diagnosis, secondary diagnoses, disease stage | Must |
| **PAT-06** | Patient records include: comorbidities, estimated prognosis | Must |
| **PAT-07** | Patient status can be Active or Discharged | Must |
| **PAT-08** | Patient location can be Home or Referred Hospital | Must |
| **PAT-09** | Staff can view patient summary and progress trends | Should |
| **PAT-10** | KPS/PPS progress tracking with visual charts | Should |

### 2.3 Home Visits

| ID | Requirement | Priority |
|----|-------------|----------|
| **VIS-01** | Staff can record home visits using structured checklist | Must |
| **VIS-02** | Visit records include: date, time started, time ended, visit type | Must |
| **VIS-03** | Visit records include: team members with roles (Team Leader, Physician, Nurse) | Must |
| **VIS-04** | Visit records include: overall status, mobility assessment | Must |
| **VIS-05** | Vital signs can be recorded (temperature, pulse, BP, respiration, SpO₂) | Should |
| **VIS-06** | Pain assessment includes: pain score (0-10), location, characteristics | Must |
| **VIS-07** | Symptom assessment includes checkbox selection of common symptoms | Must |
| **VIS-08** | Functional status includes: ADL assessment (feeding, bathing, dressing, toileting, mobility) | Must |
| **VIS-09** | KPS and PPS scores are recorded (0-100) | Must |
| **VIS-10** | Nutrition and hydration assessment | Should |
| **VIS-11** | Psychosocial and spiritual assessment | Should |
| **VIS-12** | Medication review including availability, adherence, side effects | Must |
| **VIS-13** | Caregiver assessment | Should |
| **VIS-14** | Education provided during visit | Should |
| **VIS-15** | Home environment assessment | Should |
| **VIS-16** | Red flag assessment with action tracking | Must |
| **VIS-17** | Visit outcome selection (Stable, Improved, Unchanged, Worsened, Referred, Deceased) | Must |
| **VIS-18** | Digital signatures from Team Leader, Physician, and Nurse | Should |

### 2.4 Medications

| ID | Requirement | Priority |
|----|-------------|----------|
| **MED-01** | Staff can order medications for patients | Must |
| **MED-02** | Medication orders include: name, dosage, frequency, route | Must |
| **MED-03** | Medication orders include: administered at (Home or Hospital) | Must |
| **MED-04** | Medication status can be Ordered or Given | Must |
| **MED-05** | Staff can mark medications as Given | Must |
| **MED-06** | Medication history is viewable per patient | Should |

### 2.5 Laboratory Tests

| ID | Requirement | Priority |
|----|-------------|----------|
| **LAB-01** | Staff can order laboratory tests | Must |
| **LAB-02** | Lab orders include: test name, test category, date ordered | Must |
| **LAB-03** | Lab orders include: location (Home or Hospital) | Must |
| **LAB-04** | Lab categories: Hematology, Chemistry, Hormone, Urinalysis, Stool, Microbiology, Histopathology, Immunology, Cardiac | Must |
| **LAB-05** | Staff can enter lab results | Must |
| **LAB-06** | Lab status can be Ordered or Completed | Must |
| **LAB-07** | Lab result includes: date performed and result text | Must |

### 2.6 Imaging Examinations

| ID | Requirement | Priority |
|----|-------------|----------|
| **IMG-01** | Staff can order imaging examinations | Must |
| **IMG-02** | Imaging modalities: X-Ray, Ultrasound, CT, MRI, Mammography, Fluoroscopy, Interventional, Nuclear Medicine, Other | Must |
| **IMG-03** | Imaging orders include: body region, laterality, protocol | Must |
| **IMG-04** | Imaging orders include: contrast requirement (Yes/No/To Be Determined) | Must |
| **IMG-05** | Safety screening: pregnancy status, implanted devices, metallic foreign body | Must |
| **IMG-06** | Patient preparation instructions | Should |
| **IMG-07** | Priority: Routine, Urgent, Emergency | Must |
| **IMG-08** | Staff can enter imaging reports | Must |
| **IMG-09** | Imaging reports include: findings, impression, recommendations | Must |
| **IMG-10** | Imaging reports include: reporting physician, image quality assessment | Must |

### 2.7 Referrals

| ID | Requirement | Priority |
|----|-------------|----------|
| **REF-01** | Staff can request referrals | Must |
| **REF-02** | Referrals include: type (Incoming/Outgoing), date | Must |
| **REF-03** | Referrals include: primary diagnosis, disease stage | Must |
| **REF-04** | Referrals include: PPS and KPS scores | Must |
| **REF-05** | Referrals include: current symptom scores (pain, dyspnea, fatigue, anxiety, depression) | Must |
| **REF-06** | Referrals include: reasons (multi-select) | Must |
| **REF-07** | Referrals include: referring facility, receiving facility, contact person | Must |
| **REF-08** | Admin can approve or decline referrals | Must |
| **REF-09** | Referral status: Pending, Accepted, Declined, Admitted, InfoRequested | Must |
| **REF-10** | Approved referrals update patient location to ReferredHospital | Should |
| **REF-11** | Staff documentation (prepared by, designation, signature) | Must |

### 2.8 Hospital Admissions

| ID | Requirement | Priority |
|----|-------------|----------|
| **ADM-01** | Staff can record hospital admissions | Must |
| **ADM-02** | Admissions link to accepted referrals | Must |
| **ADM-03** | Admissions include: admission date, bed number, ward | Must |
| **ADM-04** | Admissions include: admitting physician, care team | Must |
| **ADM-05** | Admissions include: primary diagnosis, disease stage, prognosis | Must |
| **ADM-06** | Admissions include: PPS score, functional status | Must |
| **ADM-07** | Pain and symptom assessment | Must |
| **ADM-08** | Psychosocial and spiritual assessment | Should |
| **ADM-09** | Initial care plan (pain management, medication, nursing care) | Must |
| **ADM-10** | Staff can discharge from admission | Must |
| **ADM-11** | Discharge includes: discharge date, reason (Improved/Deceased) | Must |
| **ADM-12** | Admission status: Active or Discharged | Must |

### 2.9 Patient Progress Notes

| ID | Requirement | Priority |
|----|-------------|----------|
| **PN-01** | Staff can record progress notes for hospitalised patients | Must |
| **PN-02** | Progress notes include: date, time, attending clinician | Must |
| **PN-03** | Current clinical status: general condition, LOC, orientation, functional status | Must |
| **PN-04** | Vital signs with current and previous values | Must |
| **PN-05** | Comprehensive symptom assessment (12 symptoms with severity) | Must |
| **PN-06** | Pain review with score, location, character, management, response | Must |
| **PN-07** | Respiratory status assessment | Must |
| **PN-08** | Nutrition and hydration assessment | Must |
| **PN-09** | Elimination assessment | Must |
| **PN-10** | Skin and wound assessment | Must |
| **PN-11** | Psychological/emotional status assessment | Must |
| **PN-12** | Spiritual/cultural needs assessment | Should |
| **PN-13** | Family/caregiver update | Should |
| **PN-14** | Goals of care review | Must |
| **PN-15** | Medication review with table | Must |
| **PN-16** | Nursing/supportive care provided | Must |
| **PN-17** | Investigations/results | Should |
| **PN-18** | Multidisciplinary team review | Should |
| **PN-19** | Clinical assessment with problems identified | Must |
| **PN-20** | Plan for next period (symptom management, medication, nursing, etc.) | Must |
| **PN-21** | SOAP format notes | Should |
| **PN-22** | Additional progress notes with clinician and signature | Should |
| **PN-23** | Authorization with signatures | Must |

### 2.10 Discharge Summary

| ID | Requirement | Priority |
|----|-------------|----------|
| **DIS-01** | Staff can generate comprehensive discharge summary | Must |
| **DIS-02** | Discharge summary includes: patient identification, admission info | Must |
| **DIS-03** | Discharge summary includes: discharge diagnosis, clinical summary | Must |
| **DIS-04** | Condition at discharge: overall status, LOC, functional status, mobility | Must |
| **DIS-05** | Discharge vital signs | Must |
| **DIS-06** | Symptom status at discharge (10 symptoms with severity) | Must |
| **DIS-07** | Discharge medications table | Must |
| **DIS-08** | Symptom management instructions (pain, breathlessness, nausea, constipation, anxiety) | Must |
| **DIS-09** | Nutrition and hydration plan | Must |
| **DIS-10** | Wound/skin care | Should |
| **DIS-11** | Oxygen/medical equipment | Should |
| **DIS-12** | Goals of care | Must |
| **DIS-13** | Discharge destination | Must |
| **DIS-14** | Home/hospice care plan | Must |
| **DIS-15** | Patient and caregiver education | Should |
| **DIS-16** | Warning signs and when to seek help | Should |
| **DIS-17** | Follow-up plan | Must |
| **DIS-18** | Contact information | Must |
| **DIS-19** | Print/save as PDF capability | Should |

### 2.11 Admin Dashboard

| ID | Requirement | Priority |
|----|-------------|----------|
| **ADMIN-01** | Admin dashboard shows key statistics | Must |
| **ADMIN-02** | Statistics: total patients, active, hospitalised, discharged | Must |
| **ADMIN-03** | Statistics: pending referrals, pending staff approvals | Must |
| **ADMIN-04** | Notifications for pending staff and referrals | Must |
| **ADMIN-05** | Admin can view all patients with search/filter | Must |
| **ADMIN-06** | Admin can view patient details with all records | Must |
| **ADMIN-07** | Admin can discharge patients | Must |
| **ADMIN-08** | Admin can approve/reject staff registrations | Must |
| **ADMIN-09** | Admin can approve/decline referrals | Must |
| **ADMIN-10** | Admin can view reports and analytics | Should |
| **ADMIN-11** | Admin can export reports (PDF/Excel) | Should |
| **ADMIN-12** | Admin can edit visit records (audit trail) | Should |

### 2.12 Staff Dashboard

| ID | Requirement | Priority |
|----|-------------|----------|
| **STAFF-01** | Staff dashboard shows today's visits, total patients, active patients | Must |
| **STAFF-02** | Shows pending tasks and alerts | Must |
| **STAFF-03** | Shows recent visits and assigned patients | Must |
| **STAFF-04** | Shows upcoming visits | Should |

### 2.13 Digital Signatures

| ID | Requirement | Priority |
|----|-------------|----------|
| **SIG-01** | Team Leader can auto-sign visits (logged-in user) | Should |
| **SIG-02** | Physician must sign with email and password | Should |
| **SIG-03** | Nurse must sign with email and password | Should |
| **SIG-04** | All signatures are recorded with timestamp | Should |
| **SIG-05** | Visit cannot be finalised until all signatures are complete | Should |

### 2.14 User Profile

| ID | Requirement | Priority |
|----|-------------|----------|
| **PRO-01** | Users can view their profile information | Must |
| **PRO-02** | Users can edit name and phone number | Must |
| **PRO-03** | Users can change password | Must |
| **PRO-04** | Users can view activity statistics | Should |

---

## 3.0 Non-Functional Requirements

### 3.1 Performance

| ID | Requirement | Target |
|----|-------------|--------|
| **PERF-01** | Page load time | < 2 seconds |
| **PERF-02** | API response time | < 500ms for 95% of requests |
| **PERF-03** | Concurrent users | Support 50+ concurrent users |
| **PERF-04** | Database query performance | Indexed for all common queries |

### 3.2 Security

| ID | Requirement | Target |
|----|-------------|--------|
| **SEC-01** | All API endpoints require authentication (except auth endpoints) | Must |
| **SEC-02** | Passwords stored using bcrypt hashing | Must |
| **SEC-03** | JWT tokens with 24-hour expiry | Must |
| **SEC-04** | Rate limiting on auth endpoints | Must |
| **SEC-05** | CORS properly configured | Must |
| **SEC-06** | Data encryption at rest | Should |
| **SEC-07** | HTTPS required in production | Must |

### 3.3 Data Integrity

| ID | Requirement | Target |
|----|-------------|--------|
| **DATA-01** | MongoDB with Mongoose schema validation | Must |
| **DATA-02** | Referential integrity at application level | Must |
| **DATA-03** | Audit trail for record modifications | Should |
| **DATA-04** | Soft delete where applicable | Should |

### 3.4 Usability

| ID | Requirement | Target |
|----|-------------|--------|
| **UX-01** | Responsive design (desktop + tablet) | Must |
| **UX-02** | Consistent design system (Outfit font, blue primary) | Must |
| **UX-03** | Form validation with clear error messages | Must |
| **UX-04** | Toast notifications for user actions | Must |
| **UX-05** | Loading states for all async operations | Must |
| **UX-06** | Accessibility: keyboard navigation, focus management | Should |

### 3.5 Reliability

| ID | Requirement | Target |
|----|-------------|--------|
| **REL-01** | Error handling with user-friendly messages | Must |
| **REL-02** | API request retries on network failure | Should |
| **REL-03** | Graceful degradation on backend failure | Should |
| **REL-04** | Data validation at frontend and backend | Must |

### 3.6 Maintainability

| ID | Requirement | Target |
|----|-------------|--------|
| **MAINT-01** | TypeScript for type safety | Must |
| **MAINT-02** | Consistent code style and naming conventions | Must |
| **MAINT-03** | Comprehensive documentation | Must |
| **MAINT-04** | Modular component architecture | Must |
| **MAINT-05** | Unit tests for critical business logic | Should |

---

## 4.0 Technology Stack

### 4.1 Frontend

| Component | Technology |
|-----------|------------|
| Framework | React 18 |
| Language | TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| State Management | Zustand (auth, app state) |
| Server State | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Routing | React Router v6 |
| Charts | Recharts |
| Animations | Framer Motion |
| Icons | Lucide React |

### 4.2 Backend

| Component | Technology |
|-----------|------------|
| Runtime | Node.js |
| Framework | Express.js |
| Language | TypeScript |
| Database | MongoDB |
| ODM | Mongoose |
| Authentication | JWT |
| Password Hashing | bcrypt |
| Email | Nodemailer |
| Validation | Zod |

---

## 5.0 Data Models

### 5.1 Core Entities

| Entity | Description |
|--------|-------------|
| `Staff` | Healthcare staff members (Team Leader, Physician, Nurse) |
| `Admin` | System administrators |
| `Patient` | Palliative care patients |
| `HomeVisit` | Recorded home visits with checklists |
| `Medication` | Medication orders |
| `LaboratoryTest` | Lab test orders and results |
| `ImagingOrder` | Imaging examination orders and reports |
| `Referral` | Referral requests between facilities |
| `HospitalAdmission` | Hospital admissions |
| `ProgressNote` | Patient progress notes |
| `DischargeSummary` | Patient discharge summaries |
| `Notification` | System notifications |
| `Signature` | Digital signatures for visits |

---

## 6.0 User Roles & Permissions

| Permission | Admin | Staff |
|------------|-------|-------|
| Register patients | ❌ | ✅ |
| View patients | ✅ | ✅ |
| Record home visits | ❌ | ✅ |
| Order medications | ❌ | ✅ |
| Order lab tests | ❌ | ✅ |
| Order imaging | ❌ | ✅ |
| Request referrals | ❌ | ✅ |
| Record admissions | ❌ | ✅ |
| Record progress notes | ❌ | ✅ |
| Discharge patients | ✅ | ❌ |
| Approve staff | ✅ | ❌ |
| Approve referrals | ✅ | ❌ |
| View all patients | ✅ | ❌ |
| Edit visits (audit) | ✅ | ❌ |
| View reports | ✅ | ❌ |

---

## 7.0 Glossary

| Term | Definition |
|------|------------|
| **Palliative Care** | Specialised medical care focused on providing relief from symptoms and stress of serious illness |
| **PPS** | Palliative Performance Scale — measures functional status (0-100) |
| **KPS** | Karnofsky Performance Status — measures functional impairment (0-100) |
| **ADL** | Activities of Daily Living — basic self-care tasks |
| **Red Flag** | Clinical warning signs requiring immediate attention |
| **SOAP** | Subjective, Objective, Assessment, Plan — structured clinical note format |
| **Y12HMC** | Yekatit 12 Hospital Medical College |
| **JWT** | JSON Web Token — authentication mechanism |
| **RBAC** | Role-Based Access Control |
| **MRN** | Medical Record Number — patient identifier |

---
