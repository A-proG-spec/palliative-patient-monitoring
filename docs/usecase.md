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
| Linked FR | FR-22 through FR-28 |

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
20. Team members sign the visit record

**Alternate Flows:**
- Red flags present: staff takes immediate action and documents it
- No referral needed: skip referral section

**Postcondition:** Home visit recorded in patient history

---

## UC-08: Request Referral

| Field | Detail |
|---|---|
| Actor | Staff |
| Precondition | Patient is active and being monitored |
| Trigger | Staff identifies need for hospital care |
| Linked FR | FR-37, FR-38, FR-39 |

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

## UC-09: Admin Approves Referral

| Field | Detail |
|---|---|
| Actor | Admin |
| Precondition | Pending referral requests exist |
| Trigger | Admin reviews referral requests |
| Linked FR | FR-40, FR-41, FR-42, FR-12 |

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

## UC-10: Record Hospital Admission

| Field | Detail |
|---|---|
| Actor | Staff |
| Precondition | Referral has been accepted |
| Trigger | Patient is admitted to hospital |
| Linked FR | FR-44 through FR-49 |

**Main Flow:**
1. Staff selects patient with accepted referral
2. Staff creates admission record
3. Staff enters patient identification details
4. Staff documents referral information
5. Staff records medical diagnosis
6. Staff assesses palliative eligibility
7. Staff performs pain and symptom assessment
8. Staff documents psychosocial and spiritual assessment
9. Staff creates initial care plan
10. Staff records admission decision (bed number, care team)
11. Staff submits admission record
12. System updates patient location to "ReferredHospital"

**Postcondition:** Hospital admission record created

---

## UC-11: Admin Closes Patient Case

| Field | Detail |
|---|---|
| Actor | Admin |
| Precondition | Patient is active |
| Trigger | Patient has improved or passed away |
| Linked FR | FR-21, FR-49, FR-13 |

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

## UC-12: View Patient Summary Report

| Field | Detail |
|---|---|
| Actor | Staff, Admin |
| Precondition | Patient exists |
| Trigger | User views patient details |
| Linked FR | FR-57 through FR-60 |

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

## UC-13: Admin Views Dashboard Notifications

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

**Alternate Flows:**
- No pending items: system shows "All clear" message
- Multiple pending items: system shows aggregated counts

**Postcondition:** Admin is aware of all pending actions

---

## UC-14: Staff Views Dashboard

| Field | Detail |
|---|---|
| Actor | Staff |
| Precondition | Staff is authenticated, email verified, and active |
| Trigger | Staff logs in or navigates to dashboard |
| Linked FR | FR-50 through FR-56 |

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

## UC-15: Staff Views Profile

| Field | Detail |
|---|---|
| Actor | Staff |
| Precondition | Staff is authenticated, email verified, and active |
| Trigger | Staff navigates to profile page |
| Linked FR | FR-08 |

**Main Flow:**
1. Staff navigates to profile page
2. System displays staff profile information (name, email, phone, role, status, email verification status)
3. Staff can view their assigned patients count
4. Staff can view their today's visits count

**Postcondition:** Staff profile information displayed

---

## UC-16: Staff Updates Profile

| Field | Detail |
|---|---|
| Actor | Staff |
| Precondition | Staff is authenticated, email verified, and active |
| Trigger | Staff updates profile information |
| Linked FR | FR-14 |

**Main Flow:**
1. Staff navigates to profile page
2. Staff updates name or phone number
3. Staff submits changes
4. System validates input
5. System updates staff record
6. System returns updated profile

**Alternate Flows:**
- Validation fails: system shows field-specific errors

**Postcondition:** Staff profile updated

---

## UC-17: Staff Views Alerts

| Field | Detail |
|---|---|
| Actor | Staff |
| Precondition | Staff is authenticated, email verified, and active |
| Trigger | Staff navigates to alerts section |
| Linked FR | FR-55 |

**Main Flow:**
1. Staff navigates to alerts section
2. System displays list of alerts
3. System shows unread count
4. Staff can filter by read status or type
5. Staff clicks alert to view patient details
6. Staff marks alert as read

**Postcondition:** Alert read status updated

