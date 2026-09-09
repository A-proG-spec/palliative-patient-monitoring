# 📄 Document 3 of 9

## `docs/usecase.md`

---

# Use Cases — Palliative Patient Monitoring System

## 1.0 Actors

| Actor | Description |
|-------|-------------|
| **Admin** | System administrator responsible for staff approvals, referral approvals, and system oversight |
| **Team Leader** | Senior staff member who leads palliative care teams and auto-signs visit records |
| **Physician** | Medical doctor who orders treatments, reviews patients, and signs clinical records |
| **Nurse** | Clinical nurse who records visits, administers medications, and documents patient observations |
| **Staff** | Generic role encompassing Team Leader, Physician, and Nurse (any authenticated clinical user) |
| **Patient** | Recipient of palliative care services (indirect actor — data subject) |
| **Caregiver** | Family member or caregiver involved in patient care (indirect actor) |

---

## 2.0 Use Case Diagram Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     PALLIATIVE CARE SYSTEM                      │
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│  │    ADMIN     │    │  TEAM LEADER │    │  PHYSICIAN   │     │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘     │
│         │                   │                   │              │
│         ▼                   ▼                   ▼              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│  │ Manage Staff │    │ Record Visits│    │ Order Meds   │     │
│  │ Approve Refer│    │ Auto-Sign    │    │ Order Labs   │     │
│  │ View Reports │    │ View Patients│    │ Sign Records │     │
│  └──────────────┘    └──────────────┘    └──────────────┘     │
│                                                                 │
│  ┌──────────────┐                                               │
│  │    NURSE     │                                               │
│  └──────┬───────┘                                               │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────┐                                               │
│  │ Record Visits│                                               │
│  │ Order Meds   │                                               │
│  │ Document Care│                                               │
│  └──────────────┘                                               │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    STAFF (Common)                      │    │
│  │  Register Patients  |  View Patient Records            │    │
│  │  Record Admissions  |  Order Imaging                   │    │
│  │  Request Referrals  |  Record Progress Notes           │    │
│  │  Enter Lab Results  |  Enter Imaging Reports           │    │
│  │  View Dashboard     |  Manage Profile                  │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3.0 Authentication Use Cases

### UC-AUTH-01: Register as Staff

| Element | Description |
|---------|-------------|
| **Actor** | Staff (new user) |
| **Precondition** | None |
| **Trigger** | User navigates to registration page |
| **Main Flow** | 1. User enters name, email, phone, password<br>2. System validates input<br>3. System creates pending staff account<br>4. System sends verification email<br>5. System displays success message |
| **Postcondition** | Staff account created with status `Pending` |
| **Extensions** | 2a. Validation fails → Display error messages<br>3a. Email already exists → Show "email already registered" |

### UC-AUTH-02: Verify Email

| Element | Description |
|---------|-------------|
| **Actor** | Staff |
| **Precondition** | User has registered and received verification email |
| **Trigger** | User clicks verification link in email |
| **Main Flow** | 1. System validates verification token<br>2. System marks email as verified<br>3. System displays success message |
| **Postcondition** | Email marked as `isEmailVerified: true` |
| **Extensions** | 1a. Token expired → Show "link expired" with option to resend<br>1b. Token invalid → Show "invalid link" |

### UC-AUTH-03: Login

| Element | Description |
|---------|-------------|
| **Actor** | Staff, Admin |
| **Precondition** | Account exists and is approved (if staff) |
| **Trigger** | User navigates to login page and submits credentials |
| **Main Flow** | 1. User enters email and password<br>2. System validates credentials<br>3. System generates JWT token<br>4. System redirects to dashboard based on role |
| **Postcondition** | User is authenticated and session established |
| **Extensions** | 2a. Invalid credentials → Show error<br>2b. Email not verified → Show "verify email first"<br>2c. Account pending approval → Show "waiting for admin approval" |

---

## 4.0 Patient Management Use Cases

### UC-PAT-01: Register New Patient

| Element | Description |
|---------|-------------|
| **Actor** | Staff |
| **Precondition** | Staff is authenticated and approved |
| **Trigger** | Staff clicks "Register Patient" |
| **Main Flow** | 1. Staff fills patient registration form<br>2. Staff submits form<br>3. System validates all fields<br>4. System generates patient display ID (PAT-XXX)<br>5. System saves patient record<br>6. System displays success message |
| **Postcondition** | Patient is registered with status `Active` and location `Home` |
| **Extensions** | 3a. Validation fails → Display field errors |

### UC-PAT-02: View Patient List

| Element | Description |
|---------|-------------|
| **Actor** | Staff, Admin |
| **Precondition** | User is authenticated |
| **Trigger** | User navigates to patient list page |
| **Main Flow** | 1. System displays list of patients<br>2. User can search by name or ID<br>3. User can filter by status<br>4. User can paginate through results |
| **Postcondition** | Patient list displayed |

### UC-PAT-03: View Patient Detail

| Element | Description |
|---------|-------------|
| **Actor** | Staff, Admin |
| **Precondition** | Patient exists |
| **Trigger** | User clicks on a patient card |
| **Main Flow** | 1. System displays patient demographics<br>2. System displays medical information<br>3. System displays tabbed records (visits, meds, labs, etc.)<br>4. User can navigate to any record type |
| **Postcondition** | Patient detail view displayed |

### UC-PAT-04: View Patient Summary

| Element | Description |
|---------|-------------|
| **Actor** | Staff |
| **Precondition** | Patient exists |
| **Trigger** | Staff clicks "Summary" button |
| **Main Flow** | 1. System compiles patient summary<br>2. System displays diagnosis, visits, medications, labs, referrals, admissions<br>3. Summary is presented in a concise, printable format |
| **Postcondition** | Patient summary displayed |

### UC-PAT-05: View Patient Progress

| Element | Description |
|---------|-------------|
| **Actor** | Staff |
| **Precondition** | Patient has at least one visit record |
| **Trigger** | Staff clicks "Progress" button |
| **Main Flow** | 1. System retrieves KPS/PPS scores from visits<br>2. System displays trend chart<br>3. System displays trend analysis (improving, stable, declining)<br>4. System shows percentage change over time |
| **Postcondition** | Progress chart displayed |

---

## 5.0 Home Visit Use Cases

### UC-VIS-01: Record Home Visit

| Element | Description |
|---------|-------------|
| **Actor** | Staff (Team Leader, Physician, Nurse) |
| **Precondition** | Patient is registered and active |
| **Trigger** | Staff clicks "Record Visit" from patient detail page |
| **Main Flow** | 1. Staff completes 21-section home visit form<br>2. Sections: Patient ID, Visit Details, General Condition, Vital Signs, Pain Assessment, Symptoms, Functional Status, Nutrition, Psychosocial, Spiritual, Medication Review, Caregiver Assessment, Education, Home Environment, Nursing Care, Red Flags, Referrals, Key Issues, Action Plan, Outcome, Signatures<br>3. Staff submits form<br>4. System validates all sections<br>5. System saves visit record<br>6. Staff can add digital signatures<br>7. System displays success message |
| **Postcondition** | Visit is recorded and linked to patient |
| **Extensions** | 4a. Validation fails → Display field errors |

### UC-VIS-02: View Visit History

| Element | Description |
|---------|-------------|
| **Actor** | Staff, Admin |
| **Precondition** | Patient exists |
| **Trigger** | User navigates to "Visits" tab |
| **Main Flow** | 1. System displays list of visits<br>2. Each visit shows date, type, status, outcome, scores<br>3. User can click on a visit for details |
| **Postcondition** | Visit history displayed |

### UC-VIS-03: Sign Visit (Team Leader)

| Element | Description |
|---------|-------------|
| **Actor** | Team Leader |
| **Precondition** | Visit is recorded and saved |
| **Trigger** | Team Leader signs visit after saving |
| **Main Flow** | 1. System auto-signs as Team Leader using logged-in user<br>2. System records signature with timestamp<br>3. System marks Team Leader signature as complete |
| **Postcondition** | Team Leader signature is recorded |

### UC-VIS-04: Sign Visit (Physician)

| Element | Description |
|---------|-------------|
| **Actor** | Physician |
| **Precondition** | Visit is recorded and saved |
| **Trigger** | Physician enters email and password to sign |
| **Main Flow** | 1. Physician enters email and password<br>2. System validates credentials<br>3. System records signature with timestamp<br>4. System marks Physician signature as complete |
| **Postcondition** | Physician signature is recorded |
| **Extensions** | 2a. Invalid credentials → Show error |

### UC-VIS-05: Sign Visit (Nurse)

| Element | Description |
|---------|-------------|
| **Actor** | Nurse |
| **Precondition** | Visit is recorded and saved |
| **Trigger** | Nurse enters email and password to sign |
| **Main Flow** | 1. Nurse enters email and password<br>2. System validates credentials<br>3. System records signature with timestamp<br>4. System marks Nurse signature as complete |
| **Postcondition** | Nurse signature is recorded |

---

## 6.0 Medication Use Cases

### UC-MED-01: Order Medication

| Element | Description |
|---------|-------------|
| **Actor** | Staff |
| **Precondition** | Patient is registered and active |
| **Trigger** | Staff clicks "Order Medication" |
| **Main Flow** | 1. Staff enters medication details (name, dosage, frequency, route)<br>2. Staff selects administered at (Home or Hospital)<br>3. Staff submits form<br>4. System validates input<br>5. System saves medication order with status `Ordered` |
| **Postcondition** | Medication order is created |

### UC-MED-02: Mark Medication as Given

| Element | Description |
|---------|-------------|
| **Actor** | Staff |
| **Precondition** | Medication exists with status `Ordered` |
| **Trigger** | Staff clicks "Mark as Given" |
| **Main Flow** | 1. System updates medication status to `Given`<br>2. System records the update |
| **Postcondition** | Medication status is `Given` |

### UC-MED-03: View Medication History

| Element | Description |
|---------|-------------|
| **Actor** | Staff, Admin |
| **Precondition** | Patient exists |
| **Trigger** | User navigates to "Medications" tab |
| **Main Flow** | 1. System displays list of medications<br>2. Each medication shows name, dosage, frequency, route, status<br>3. User can click on a medication for details |
| **Postcondition** | Medication history displayed |

---

## 7.0 Laboratory Test Use Cases

### UC-LAB-01: Order Lab Test

| Element | Description |
|---------|-------------|
| **Actor** | Staff |
| **Precondition** | Patient is registered and active |
| **Trigger** | Staff clicks "Order Lab Test" |
| **Main Flow** | 1. Staff selects test category (Hematology, Chemistry, etc.)<br>2. Staff selects test name<br>3. Staff enters specimen type and site<br>4. Staff selects priority (Routine, Urgent, Emergency)<br>5. Staff submits form<br>6. System validates input<br>7. System saves lab order with status `Ordered` |
| **Postcondition** | Lab test order is created |

### UC-LAB-02: Enter Lab Result

| Element | Description |
|---------|-------------|
| **Actor** | Staff |
| **Precondition** | Lab test exists with status `Ordered` |
| **Trigger** | Staff clicks "Enter Result" |
| **Main Flow** | 1. Staff enters date performed<br>2. Staff enters result text<br>3. Staff submits result<br>4. System validates input<br>5. System updates lab status to `Completed`<br>6. System saves result |
| **Postcondition** | Lab result is recorded and status is `Completed` |

### UC-LAB-03: View Lab History

| Element | Description |
|---------|-------------|
| **Actor** | Staff, Admin |
| **Precondition** | Patient exists |
| **Trigger** | User navigates to "Labs" tab |
| **Main Flow** | 1. System displays list of lab tests<br>2. Each test shows name, ordered date, status, result<br>3. User can click on a test for details |
| **Postcondition** | Lab history displayed |

---

## 8.0 Imaging Examination Use Cases

### UC-IMG-01: Order Imaging Examination

| Element | Description |
|---------|-------------|
| **Actor** | Staff |
| **Precondition** | Patient is registered and active |
| **Trigger** | Staff clicks "Order Imaging" |
| **Main Flow** | 1. Staff completes imaging order form<br>2. Sections: Patient Info, Clinical Info, Imaging Requested (modality, body region, laterality, contrast), Contrast/Medication Info, Safety Screening, Patient Preparation, Priority, Referring Clinician<br>3. Staff submits form<br>4. System validates input<br>5. System saves imaging order with status `Ordered`<br>6. System records ordered by and date |
| **Postcondition** | Imaging order is created |

### UC-IMG-02: Enter Imaging Report

| Element | Description |
|---------|-------------|
| **Actor** | Staff |
| **Precondition** | Imaging order exists with status `Ordered` |
| **Trigger** | Staff clicks "Enter Report" |
| **Main Flow** | 1. Staff enters imaging department information (technologist, radiologist, date performed)<br>2. Staff enters report findings, impression, recommendations<br>3. Staff selects image quality (Diagnostic, Limited, NonDiagnostic, RepeatRequired)<br>4. Staff enters reporting physician and report date<br>5. Staff submits report<br>6. System validates input<br>7. System updates imaging status to `Completed`<br>8. System saves report |
| **Postcondition** | Imaging report is recorded and status is `Completed` |

### UC-IMG-03: View Imaging History

| Element | Description |
|---------|-------------|
| **Actor** | Staff, Admin |
| **Precondition** | Patient exists |
| **Trigger** | User navigates to "Imaging" tab |
| **Main Flow** | 1. System displays list of imaging orders<br>2. Each order shows modality, body region, ordered date, status, report date<br>3. User can click on an order for details |
| **Postcondition** | Imaging history displayed |

---

## 9.0 Referral Use Cases

### UC-REF-01: Request Referral

| Element | Description |
|---------|-------------|
| **Actor** | Staff |
| **Precondition** | Patient is registered and active |
| **Trigger** | Staff clicks "Request Referral" |
| **Main Flow** | 1. Staff completes referral form<br>2. Sections: Referral Information (type, date), Patient Information, Clinical Information (diagnosis, stage, PPS, KPS, symptoms), Reason for Referral (multi-select), Referral Details (referring facility, receiving facility, contact person), Staff Documentation<br>3. Staff submits form<br>4. System validates input<br>5. System saves referral with status `Pending`<br>6. Admin notification is created |
| **Postcondition** | Referral is created with status `Pending` |

### UC-REF-02: Admin Approve Referral

| Element | Description |
|---------|-------------|
| **Actor** | Admin |
| **Precondition** | Referral exists with status `Pending` |
| **Trigger** | Admin clicks "Approve" on referral |
| **Main Flow** | 1. System updates referral status to `Accepted`<br>2. System updates patient location to `ReferredHospital`<br>3. System records approval by admin<br>4. System creates notification |
| **Postcondition** | Referral is `Accepted`, patient location updated |

### UC-REF-03: Admin Decline Referral

| Element | Description |
|---------|-------------|
| **Actor** | Admin |
| **Precondition** | Referral exists with status `Pending` |
| **Trigger** | Admin clicks "Decline" on referral |
| **Main Flow** | 1. System updates referral status to `Declined`<br>2. System records decision by admin |
| **Postcondition** | Referral is `Declined` |

### UC-REF-04: View Referral History

| Element | Description |
|---------|-------------|
| **Actor** | Staff, Admin |
| **Precondition** | Patient exists |
| **Trigger** | User navigates to "Referrals" tab |
| **Main Flow** | 1. System displays list of referrals<br>2. Each referral shows date, type, receiving facility, status<br>3. User can click on a referral for details |
| **Postcondition** | Referral history displayed |

---

## 10.0 Hospital Admission Use Cases

### UC-ADM-01: Record Hospital Admission

| Element | Description |
|---------|-------------|
| **Actor** | Staff |
| **Precondition** | Patient is registered and active, referral exists (accepted) |
| **Trigger** | Staff clicks "Record Admission" |
| **Main Flow** | 1. Staff selects linked referral<br>2. Staff enters admission details (date, bed number, ward, admitting physician, care team)<br>3. Staff enters medical diagnosis (primary, secondary, disease stage, prognosis)<br>4. Staff enters PPS score and functional status<br>5. Staff enters pain and symptom assessment<br>6. Staff enters psychosocial and spiritual assessment<br>7. Staff enters initial care plan (pain management, medication, nursing care)<br>8. Staff submits form<br>9. System validates input<br>10. System saves admission with status `Active` |
| **Postcondition** | Admission is created with status `Active` |

### UC-ADM-02: Discharge from Admission

| Element | Description |
|---------|-------------|
| **Actor** | Staff |
| **Precondition** | Admission exists with status `Active` |
| **Trigger** | Staff clicks "Discharge" on admission |
| **Main Flow** | 1. Staff enters discharge date<br>2. Staff selects discharge reason (Improved or Deceased)<br>3. Staff confirms discharge<br>4. System validates input<br>5. System updates admission status to `Discharged`<br>6. System records discharge details |
| **Postcondition** | Admission status is `Discharged` |

### UC-ADM-03: View Admission History

| Element | Description |
|---------|-------------|
| **Actor** | Staff, Admin |
| **Precondition** | Patient exists |
| **Trigger** | User navigates to "Admissions" tab |
| **Main Flow** | 1. System displays list of admissions<br>2. Each admission shows date, bed, ward, physician, status<br>3. User can click on an admission for details |
| **Postcondition** | Admission history displayed |

---

## 11.0 Progress Note Use Cases

### UC-PN-01: Record Progress Note

| Element | Description |
|---------|-------------|
| **Actor** | Staff |
| **Precondition** | Patient is registered and active (hospitalised) |
| **Trigger** | Staff clicks "Record Progress Note" |
| **Main Flow** | 1. Staff completes 20-section progress note form<br>2. Sections: Header, Current Clinical Status, Vital Signs, Symptom Assessment, Respiratory Status, Nutrition/Hydration, Elimination, Skin/Wound, Psychological, Spiritual, Family/Caregiver, Goals of Care, Medication Review, Nursing Care, Investigations, MDT Review, Clinical Assessment, Plan, SOAP, Additional Notes, Authorization<br>3. Staff submits form<br>4. System validates input<br>5. System saves progress note<br>6. System displays success message |
| **Postcondition** | Progress note is recorded |

### UC-PN-02: View Progress Notes

| Element | Description |
|---------|-------------|
| **Actor** | Staff, Admin |
| **Precondition** | Patient exists |
| **Trigger** | User navigates to "Progress Notes" tab |
| **Main Flow** | 1. System displays list of progress notes<br>2. Each note shows date, time, attending clinician, general condition<br>3. User can click on a note for details |
| **Postcondition** | Progress notes displayed |

---

## 12.0 Discharge Summary Use Cases

### UC-DIS-01: Generate Discharge Summary

| Element | Description |
|---------|-------------|
| **Actor** | Admin, Staff |
| **Precondition** | Patient is registered and active |
| **Trigger** | User clicks "Discharge Patient" |
| **Main Flow** | 1. User completes 20-section discharge summary form<br>2. Sections: Header, Patient ID, Admission Information, Discharge Diagnosis, Condition at Discharge, Discharge Vital Signs, Symptom Status, Discharge Medications, Symptom Management Instructions, Nutrition/Hydration, Wound/Skin Care, Oxygen/Equipment, Goals of Care, Discharge Destination, Home/Hospice Care, Education, Warning Signs, Follow-Up Plan, Contact Information, Discharge Notes<br>3. User submits form<br>4. System validates input<br>5. System updates patient status to `Discharged`<br>6. System saves discharge summary<br>7. System displays success message |
| **Postcondition** | Patient status is `Discharged`, discharge summary is saved |

### UC-DIS-02: Print Discharge Summary

| Element | Description |
|---------|-------------|
| **Actor** | Admin, Staff |
| **Precondition** | Discharge summary exists |
| **Trigger** | User clicks "Print/Save as PDF" |
| **Main Flow** | 1. System renders discharge summary in print-friendly format<br>2. System opens browser print dialog<br>3. User can save as PDF or print |
| **Postcondition** | Discharge summary is printed or saved as PDF |

---

## 13.0 Admin Use Cases

### UC-ADMIN-01: View Admin Dashboard

| Element | Description |
|---------|-------------|
| **Actor** | Admin |
| **Precondition** | Admin is authenticated |
| **Trigger** | Admin navigates to admin dashboard |
| **Main Flow** | 1. System displays statistics (total patients, active, hospitalised, discharged)<br>2. System displays pending referrals count<br>3. System displays pending staff approvals count<br>4. System displays notifications<br>5. System displays recent referrals<br>6. System displays recent visits |
| **Postcondition** | Dashboard displayed |

### UC-ADMIN-02: Approve Staff Registration

| Element | Description |
|---------|-------------|
| **Actor** | Admin |
| **Precondition** | Staff registration exists with status `Pending` |
| **Trigger** | Admin views pending staff list |
| **Main Flow** | 1. Admin selects a staff member<br>2. Admin assigns a role (Team Leader, Physician, Nurse)<br>3. Admin clicks "Approve"<br>4. System updates staff status to `Active`<br>5. System records approved by admin<br>6. System removes from pending list |
| **Postcondition** | Staff is approved and can login |

### UC-ADMIN-03: Reject Staff Registration

| Element | Description |
|---------|-------------|
| **Actor** | Admin |
| **Precondition** | Staff registration exists with status `Pending` |
| **Trigger** | Admin selects a staff member and clicks "Reject" |
| **Main Flow** | 1. Admin clicks "Reject"<br>2. System updates staff status to `Rejected`<br>3. System removes from pending list |
| **Postcondition** | Staff registration is rejected |

### UC-ADMIN-04: View All Patients

| Element | Description |
|---------|-------------|
| **Actor** | Admin |
| **Precondition** | Admin is authenticated |
| **Trigger** | Admin navigates to patient list page |
| **Main Flow** | 1. System displays all patients<br>2. Admin can search by name or ID<br>3. Admin can filter by status<br>4. Admin can paginate through results |
| **Postcondition** | Patient list displayed |

### UC-ADMIN-05: View Patient Detail (Admin)

| Element | Description |
|---------|-------------|
| **Actor** | Admin |
| **Precondition** | Patient exists |
| **Trigger** | Admin clicks on a patient card |
| **Main Flow** | 1. System displays patient demographics<br>2. System displays medical information<br>3. System displays tabbed records (visits, meds, labs, imaging, referrals, admissions, progress notes)<br>4. Admin can navigate to any record type |
| **Postcondition** | Patient detail view displayed |

### UC-ADMIN-06: Edit Visit (Audit)

| Element | Description |
|---------|-------------|
| **Actor** | Admin |
| **Precondition** | Visit exists |
| **Trigger** | Admin clicks "Edit" on a visit |
| **Main Flow** | 1. Admin edits visit fields (pain score, outcome, overall status, PPS, KPS, dates, times)<br>2. Admin saves changes<br>3. System validates input<br>4. System updates visit record<br>5. System logs edit in audit trail (who, when, what changed) |
| **Postcondition** | Visit is updated, audit trail is recorded |

### UC-ADMIN-07: View Reports

| Element | Description |
|---------|-------------|
| **Actor** | Admin |
| **Precondition** | Admin is authenticated |
| **Trigger** | Admin navigates to reports page |
| **Main Flow** | 1. System displays statistics (total, active, discharged, hospitalised patients)<br>2. System displays visits by month chart<br>3. System displays patients by location chart<br>4. System displays patients by disease stage chart<br>5. System displays referrals by status chart |
| **Postcondition** | Reports displayed |

### UC-ADMIN-08: Export Report

| Element | Description |
|---------|-------------|
| **Actor** | Admin |
| **Precondition** | Report data exists |
| **Trigger** | Admin clicks "Export" (PDF or Excel) |
| **Main Flow** | 1. System generates report file<br>2. System downloads file |
| **Postcondition** | Report file is downloaded |

---

## 14.0 Staff Dashboard Use Cases

### UC-STAFF-01: View Staff Dashboard

| Element | Description |
|---------|-------------|
| **Actor** | Staff |
| **Precondition** | Staff is authenticated |
| **Trigger** | Staff navigates to dashboard |
| **Main Flow** | 1. System displays welcome message<br>2. System displays statistics (today's visits, total patients, active patients, pending tasks)<br>3. System displays alerts (red flags, pending referrals, overdue visits)<br>4. System displays assigned patients<br>5. System displays recent visits<br>6. System displays upcoming visits |
| **Postcondition** | Dashboard displayed |

---

## 15.0 Profile Use Cases

### UC-PRO-01: View Profile

| Element | Description |
|---------|-------------|
| **Actor** | Staff, Admin |
| **Precondition** | User is authenticated |
| **Trigger** | User navigates to profile page |
| **Main Flow** | 1. System displays user information (name, email, phone, role, status)<br>2. System displays activity statistics (visits, patients, etc.) |
| **Postcondition** | Profile displayed |

### UC-PRO-02: Edit Profile

| Element | Description |
|---------|-------------|
| **Actor** | Staff, Admin |
| **Precondition** | User is authenticated |
| **Trigger** | User clicks "Edit Profile" |
| **Main Flow** | 1. User edits name or phone<br>2. User saves changes<br>3. System validates input<br>4. System updates profile<br>5. System displays success message |
| **Postcondition** | Profile is updated |

### UC-PRO-03: Change Password

| Element | Description |
|---------|-------------|
| **Actor** | Staff, Admin |
| **Precondition** | User is authenticated |
| **Trigger** | User navigates to "Change Password" section |
| **Main Flow** | 1. User enters current password<br>2. User enters new password<br>3. User confirms new password<br>4. User submits<br>5. System validates current password<br>6. System validates new password requirements<br>7. System updates password<br>8. System displays success message |
| **Postcondition** | Password is changed |

---

## 16.0 Use Case Relationships

### 16.1 Includes Relationships

| Use Case | Includes |
|----------|----------|
| UC-VIS-01 (Record Visit) | UC-VIS-03, UC-VIS-04, UC-VIS-05 (Signatures) |
| UC-REF-01 (Request Referral) | UC-REF-02, UC-REF-03 (Admin Approval) |
| UC-ADMIN-05 (View Patient Detail - Admin) | UC-PAT-03 (View Patient Detail) |

### 16.2 Extends Relationships

| Use Case | Extends |
|----------|---------|
| UC-AUTH-01 (Register) | UC-AUTH-02 (Verify Email) |
| UC-ADM-01 (Record Admission) | UC-ADM-02 (Discharge) |

---
