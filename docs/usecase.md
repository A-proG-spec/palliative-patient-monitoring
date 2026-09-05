# usecases.md

# PALLIATIVE PATIENT MONITORING SYSTEM - USE CASES

## UC-01: Staff Registration

| Field | Detail |
|---|---|
| Actor | Staff (Nurse, Physician, Team Leader) |
| Precondition | None |
| Trigger | Staff submits registration form |
| Linked FR | FR-01, FR-02 |

**Main Flow:**
1. Staff navigates to registration page
2. Staff fills in email, password, name, phone number
3. Staff submits form
4. System validates input
5. System creates staff record with status "Pending"
6. System generates email verification token
7. System sends verification email to staff's email address
8. System displays success message: "Verification email sent. Please check your inbox."

**Alternate Flows:**
- If email already exists: system returns validation error
- If validation fails: system shows field-specific errors
- If email sending fails: system logs error and allows resend

**Postcondition:** Staff record exists with "Pending" status, verification email sent

---

## UC-02: Staff Verifies Email

| Field | Detail |
|---|---|
| Actor | Staff |
| Precondition | Staff has registered and received verification email |
| Trigger | Staff clicks verification link in email |
| Linked FR | FR-02, FR-03 |

**Main Flow:**
1. Staff receives verification email with link
2. Staff clicks verification link
3. System validates verification token
4. System marks staff email as verified (`isEmailVerified = true`)
5. System displays success message: "Email verified successfully. Please wait for admin approval."
6. System creates notification for admin about new pending staff

**Alternate Flows:**
- Token is expired: system displays "Verification link has expired. Please request a new one."
- Token is invalid: system displays "Invalid verification link."
- Email already verified: system displays "Email already verified."

**Postcondition:** Staff email is verified, admin notification created

---

## UC-03: Staff Requests New Verification Email

| Field | Detail |
|---|---|
| Actor | Staff |
| Precondition | Staff has registered but not verified email |
| Trigger | Staff requests new verification email |
| Linked FR | FR-04 |

**Main Flow:**
1. Staff navigates to login page
2. Staff clicks "Resend verification email" link
3. Staff enters email address
4. System validates email exists and is not verified
5. System generates new verification token
6. System sends new verification email
7. System displays success message: "Verification email sent. Please check your inbox."

**Alternate Flows:**
- Email not found: system displays "No account found with this email"
- Email already verified: system displays "Email already verified. Please login."
- Too many requests: system displays "Please wait before requesting another email"

**Postcondition:** New verification email sent

---

## UC-04: Admin Approves Staff Registration

| Field | Detail |
|---|---|
| Actor | Admin |
| Precondition | Staff email is verified and pending registrations exist |
| Trigger | Admin navigates to pending approvals |
| Linked FR | FR-05, FR-06, FR-07, FR-11 |

**Main Flow:**
1. Admin views dashboard with pending staff notification
2. Admin navigates to pending approvals
3. Admin reviews staff credentials
4. Admin approves registration
5. Admin assigns role (Team Leader, Physician, Nurse)
6. System updates staff status to "Active"
7. System assigns selected role
8. Staff can now login

**Alternate Flows:**
- Admin rejects registration: system removes from pending list
- Admin does not assign role: system returns validation error

**Postcondition:** Staff is active with assigned role

---

## UC-05: User Login with Role-Based Redirect

| Field | Detail |
|---|---|
| Actor | Staff, Admin |
| Precondition | User is registered, email verified, and approved (if staff) |
| Trigger | User submits login credentials |
| Linked FR | FR-08, FR-09 |

**Main Flow:**
1. User navigates to login page
2. User enters email and password
3. System validates credentials
4. System checks if email is verified
5. System checks user role (Admin or Staff)
6. System returns user data with role
7. Frontend redirects based on role:
   - Admin → /admin/dashboard
   - Staff → /dashboard

**Alternate Flows:**
- Invalid credentials: system returns error
- Staff account not verified: system returns "Please verify your email before logging in"
- Staff account pending: system returns "Account pending admin approval"
- Staff account rejected: system returns "Account has been rejected"
- Staff tries to access admin route: system redirects to unauthorized page
- Admin tries to access staff route: system redirects to unauthorized page

**Postcondition:** User is logged in and redirected to appropriate dashboard

---

## UC-06: Patient Registration

| Field | Detail |
|---|---|
| Actor | Staff |
| Precondition | Staff is authenticated, email verified, and active |
| Trigger | Staff initiates patient registration |
| Linked FR | FR-15, FR-16 |

**Main Flow:**
1. Staff navigates to patient registration
2. Staff enters patient demographics (name, age, sex, DOB, address, phone)
3. Staff enters emergency contact details
4. Staff enters caregiver information
5. Staff enters medical diagnosis (primary, secondary, stage, comorbidities)
6. Staff enters palliative eligibility
7. Staff submits form
8. System creates patient record with status "Active" and location "Home"

**Postcondition:** Patient record created with "Active" status

---

## UC-07: Record Home Visit

| Field | Detail |
|---|---|
| Actor | Staff |
| Precondition | Patient exists and is active |
| Trigger | Staff conducts home visit |
| Linked FR | FR-24 through FR-30, FR-33a, FR-33b, FR-33c |

**Main Flow:**
1. Staff selects patient
2. Staff records visit details (date, time, team members)
3. Staff assesses general condition and mobility
4. Staff records vital signs
5. Staff performs pain assessment (score, location, characteristics)
6. Staff assesses symptoms
7. Staff evaluates functional status (ADL, PPS, KPS)
8. Staff assesses nutrition and hydration
9. Staff performs psychosocial assessment
10. Staff documents spiritual needs
11. Staff reviews medications
12. Staff assesses caregiver
13. Staff documents education provided
14. Staff evaluates home environment
15. Staff records nursing care provided
16. Staff checks for red flags
17. Staff documents any referrals made
18. Staff records outcome
19. Staff schedules next visit if needed
20. Team Leader is automatically signed (logged-in user)
21. Physician signs using email + password verification
22. Nurse signs using email + password verification
23. System verifies all signatures are complete before allowing finalization

**Alternate Flows:**
- Red flags present: staff takes immediate action and documents it
- No referral needed: skip referral section
- Invalid credentials for signature: system shows error message

**Postcondition:** Home visit recorded in patient history with all team signatures

---

## UC-08: Admin Edits Visit Record

| Field | Detail |
|---|---|
| Actor | Admin |
| Precondition | Visit record exists and contains errors |
| Trigger | Admin identifies error in visit record |
| Linked FR | FR-31, FR-32, FR-33 |

**Main Flow:**
1. Admin navigates to patient detail page
2. Admin views the visit records tab
3. Admin identifies visit with error
4. Admin clicks "Edit" button on the visit
5. System opens edit modal with pre-filled visit data
6. Admin modifies the incorrect fields
7. Admin submits changes
8. System validates the updated data
9. System updates the visit record
10. System logs the edit in audit trail (admin ID, timestamp, fields changed)
11. System displays success message: "Visit updated successfully"
12. System shows "Edited by [Admin Name]" on the visit

**Alternate Flows:**
- Validation fails: system shows field-specific errors
- Staff tries to edit: system returns "Permission denied" error

**Postcondition:** Visit record updated, audit trail created

---

## UC-09: Admin Views Patient Detail with Full Records

| Field | Detail |
|---|---|
| Actor | Admin |
| Precondition | Patient exists |
| Trigger | Admin navigates to patient detail |
| Linked FR | FR-18, FR-22, FR-23 |

**Main Flow:**
1. Admin navigates to patient list
2. Admin clicks on patient name or "View Details"
3. System displays full patient detail view
4. System shows all sections:
   - Patient demographics
   - Medical diagnosis
   - Complete visit history (with Edit button)
   - Complete medication list
   - Complete lab test results
   - Complete referral history
   - Complete admission records (with Edit button)
   - KPS/PPS progress graph (if available)
5. Admin can click "Edit" on any visit to correct errors
6. Admin can click "Edit" on any admission to correct errors
7. Admin can click patient name in any table to navigate

**Postcondition:** Admin sees complete patient data, same as staff view

---

## UC-10: Admin Clicks Patient Name to Navigate

| Field | Detail |
|---|---|
| Actor | Admin |
| Precondition | Patient name appears in any admin table (referrals, notifications, etc.) |
| Trigger | Admin clicks on patient name |
| Linked FR | FR-23, FR-49 |

**Main Flow:**
1. Admin views an admin table (referral list, notification list, patient list)
2. Admin clicks on any patient name displayed
3. System navigates to patient detail page: `/admin/patients/:patientId`
4. System displays full patient details

**Alternate Flows:**
- Patient not found: system shows 404 error

**Postcondition:** Admin is on patient detail page

---

## UC-11: Request Referral

| Field | Detail |
|---|---|
| Actor | Staff |
| Precondition | Patient is active and being monitored |
| Trigger | Staff identifies need for hospital care |
| Linked FR | FR-42, FR-43, FR-44 |

**Main Flow:**
1. Staff selects patient
2. Staff creates referral request
3. Staff enters referral type (Incoming/Outgoing)
4. Staff enters clinical information (diagnosis, stage, PPS, KPS)
5. Staff documents current symptoms and scores
6. Staff selects reason for referral
7. Staff enters referring and receiving facility details
8. Staff enters prepared by details (name, designation, signature)
9. Staff submits referral request
10. System creates referral with status "Pending"
11. System creates notification for admin

**Postcondition:** Referral request created with "Pending" status, admin notification created

---

## UC-12: Admin Approves Referral

| Field | Detail |
|---|---|
| Actor | Admin |
| Precondition | Pending referral requests exist |
| Trigger | Admin reviews referral requests |
| Linked FR | FR-45, FR-46, FR-47, FR-12, FR-49 |

**Main Flow:**
1. Admin views dashboard with pending referral notification
2. Admin reviews clinical justification
3. Admin approves referral
4. System updates referral status to "Accepted"
5. System changes patient location to "ReferredHospital"
6. Admin schedules appointment or admission
7. System records action taken

**Alternate Flows:**
- Admin declines referral: system updates status to "Declined"
- Admin requests additional info: system updates status to "InfoRequested"

**Postcondition:** Referral approved and patient location updated

---

## UC-13: Record Hospital Admission

| Field | Detail |
|---|---|
| Actor | Staff (Any staff member - Nurse, Physician, Team Leader) |
| Precondition | Referral has been accepted |
| Trigger | Patient is admitted to hospital |
| Linked FR | FR-50 through FR-55, FR-55d |

**Main Flow:**
1. Staff selects patient with accepted referral
2. Staff creates admission record
3. Staff enters patient identification details
4. Staff enters Hospital MRN (Medical Record Number) assigned by hospital
5. Staff documents referral information
6. Staff records medical diagnosis
7. Staff assesses palliative eligibility
8. Staff performs pain and symptom assessment
9. Staff documents psychosocial and spiritual assessment
10. Staff creates initial care plan
11. Staff records admission decision (bed number, care team)
12. Staff submits admission record
13. System updates patient location to "ReferredHospital"
14. System stores Hospital MRN in patient record

**Postcondition:** Hospital admission record created, Hospital MRN stored

---

## UC-14: Admin Edits Admission Record

| Field | Detail |
|---|---|
| Actor | Admin |
| Precondition | Admission record exists and contains errors |
| Trigger | Admin identifies error in admission record |
| Linked FR | FR-55a, FR-55b, FR-55c |

**Main Flow:**
1. Admin navigates to patient detail page
2. Admin views the admissions tab
3. Admin identifies admission with error
4. Admin clicks "Edit" button on the admission
5. System opens edit modal with pre-filled admission data
6. Admin modifies the incorrect fields
7. Admin submits changes
8. System validates the updated data
9. System updates the admission record
10. System logs the edit in audit trail (admin ID, timestamp, fields changed)
11. System displays success message: "Admission updated successfully"
12. System shows "Edited by [Admin Name]" on the admission

**Alternate Flows:**
- Validation fails: system shows field-specific errors
- Staff tries to edit: system returns "Permission denied" error

**Postcondition:** Admission record updated, audit trail created

---

## UC-15: Admin Closes Patient Case

| Field | Detail |
|---|---|
| Actor | Admin |
| Precondition | Patient is active |
| Trigger | Patient has improved or passed away |
| Linked FR | FR-21, FR-55, FR-13 |

**Main Flow:**
1. Admin selects patient
2. Admin initiates case closure
3. Admin selects close reason (Improved or Deceased)
4. Admin confirms closure
5. System updates patient status to "Discharged"
6. System records close date
7. System creates notification for admin dashboard (case closed)
8. Case is closed

**Postcondition:** Patient status changed to "Discharged"

---

## UC-16: View Patient Summary Report

| Field | Detail |
|---|---|
| Actor | Staff, Admin |
| Precondition | Patient exists |
| Trigger | User views patient details |
| Linked FR | FR-63 through FR-66 |

**Main Flow:**
1. User selects patient
2. System displays patient demographics
3. System displays medical diagnosis
4. System displays all home visits (chronological)
5. System displays all medications
6. System displays all lab tests
7. System displays referral history
8. System displays admission records
9. System displays current status and location

**Postcondition:** Complete patient summary displayed

---

## UC-17: Print Patient History

| Field | Detail |
|---|---|
| Actor | Staff, Admin |
| Precondition | Patient exists and has records |
| Trigger | User clicks "Print" or "Export PDF" on patient summary |
| Linked FR | FR-68, FR-69, FR-70, FR-70a |

**Main Flow:**
1. User navigates to patient summary page
2. User clicks "Print/Export PDF" button
3. System opens print dialog with formatted patient data
4. System displays:
   - Institution header (Yekatit 12 Hospital Medical College)
   - Patient demographics and ID
   - KPS/PPS progress graph (if available)
   - All visits with FULL details (chronological)
   - All medications with complete details
   - All lab tests with complete details
   - All referrals with complete details
   - All admissions with complete details
   - Generated date
5. User selects "Save as PDF" or prints
6. System generates PDF/printout

**Alternate Flows:**
- No data available: system shows "No records to print" message

**Postcondition:** Patient history printed/exported as PDF with all full details

---

## UC-18: Admin Views Dashboard Notifications

| Field | Detail |
|---|---|
| Actor | Admin |
| Precondition | Admin is authenticated |
| Trigger | Admin logs in or navigates to dashboard |
| Linked FR | FR-10, FR-11, FR-12, FR-13 |

**Main Flow:**
1. Admin logs in
2. System displays dashboard with notification counts
3. System shows count of pending staff approvals (email verified only)
4. System shows count of pending referrals
5. System shows count of recent case closures
6. Admin clicks on notification to view details
7. If notification is referral-related, admin can click patient name to view details

**Alternate Flows:**
- No pending items: system shows "All clear" message
- Multiple pending items: system shows aggregated counts

**Postcondition:** Admin is aware of all pending actions

---

## UC-19: Staff Views Dashboard

| Field | Detail |
|---|---|
| Actor | Staff |
| Precondition | Staff is authenticated, email verified, and active |
| Trigger | Staff logs in or navigates to dashboard |
| Linked FR | FR-56 through FR-62 |

**Main Flow:**
1. Staff logs in
2. System redirects to staff dashboard
3. System displays staff name and role
4. System displays statistics cards (Today's Visits, Total Patients, Active Patients, Pending Tasks)
5. System displays list of assigned patients
6. System displays recent visits
7. System displays upcoming scheduled visits
8. System displays alerts (red flags, pending referrals, overdue visits)
9. Auto-refreshes every 60 seconds

**Alternate Flows:**
- No assigned patients: system shows empty state
- No alerts: system shows "No alerts" message

**Postcondition:** Staff has complete overview of their assignments and tasks

---

## UC-20: User Manages Profile

| Field | Detail |
|---|---|
| Actor | Staff, Admin |
| Precondition | User is authenticated, email verified, and active (if staff) |
| Trigger | User navigates to profile page |
| Linked FR | FR-14, FR-14a, FR-14b |

**Main Flow:**
1. User navigates to profile page
2. System displays user profile information (name, email, phone, role, status)
3. User can view their activity statistics (visits, patients, last login)
4. User updates name or phone number
5. User submits changes
6. System validates input
7. System updates user record
8. System returns updated profile with success message

**Alternate Flows:**
- Validation fails: system shows field-specific errors

**Postcondition:** User profile updated

---

## UC-21: User Changes Password

| Field | Detail |
|---|---|
| Actor | Staff, Admin |
| Precondition | User is authenticated |
| Trigger | User navigates to profile page and clicks "Change Password" |
| Linked FR | FR-14a |

**Main Flow:**
1. User navigates to profile page
2. User clicks "Change Password" section
3. User enters current password
4. User enters new password (meets requirements)
5. User confirms new password
6. User submits changes
7. System validates current password
8. System validates new password meets requirements
9. System hashes and saves new password
10. System displays success message: "Password changed successfully"

**Alternate Flows:**
- Current password incorrect: system shows error message
- New password doesn't meet requirements: system shows field-specific errors
- Passwords don't match: system shows error message

**Postcondition:** User password changed

---

## UC-22: Team Member Signs Visit (Digital Signature)

| Field | Detail |
|---|---|
| Actor | Staff (Physician, Nurse) |
| Precondition | Visit record exists and is not finalized |
| Trigger | Team member needs to sign the visit |
| Linked FR | FR-33a, FR-33b, FR-33c |

**Main Flow:**
1. Staff creates visit record (Team Leader auto-signed)
2. Physician enters their email and password
3. System verifies credentials
4. System checks physician is assigned to the visit
5. System records signature with timestamp
6. Nurse enters their email and password
7. System verifies credentials
8. System checks nurse is assigned to the visit
9. System records signature with timestamp
10. System checks all required signatures are complete
11. System enables "Finalize Visit" button

**Alternate Flows:**
- Invalid credentials: system shows error message
- Staff not assigned to visit: system shows "Not authorized to sign" error
- Account not active: system shows "Account is not active" error

**Postcondition:** Visit has all required signatures and can be finalized

---

## UC-23: User Access Denied (Unauthorized Page)

| Field | Detail |
|---|---|
| Actor | Staff, Admin |
| Precondition | User is authenticated |
| Trigger | User attempts to access a route they don't have permission for |
| Linked FR | FR-14c |

**Main Flow:**
1. Staff user attempts to access `/admin` route
2. System detects user type is "staff"
3. System redirects to `/unauthorized`
4. System displays "Access Denied" message
5. System shows user's name and role
6. System provides "Return to Dashboard" button
7. User clicks button and navigates to appropriate dashboard

**Alternate Flows:**
- Admin user attempts to access `/dashboard` route
- System detects user type is "admin"
- System redirects to `/unauthorized`

**Postcondition:** User is informed they don't have permission and can return to their dashboard

---

## UC-24: Toast Notifications

| Field | Detail |
|---|---|
| Actor | System |
| Precondition | User performs an action |
| Trigger | Action completes (success, error, warning) or is in progress |
| Linked FR | FR-71, FR-72, FR-73, FR-74, FR-75 |

**Main Flow:**
1. User performs an action (register, login, save visit, etc.)
2. System processes the action
3. System displays appropriate toast notification:
   - Success: Green toast with success message
   - Error: Red toast with error message
   - Warning: Amber toast with warning message
   - Info: Blue toast with informational message
   - Loading: Gray toast with loading indicator
4. Toast auto-dismisses after duration (3-5 seconds)
5. User can manually dismiss toast by clicking close button

**Alternate Flows:**
- Network error: system shows error toast
- Validation error: system shows warning toast with field information

**Postcondition:** User receives immediate feedback on their action
