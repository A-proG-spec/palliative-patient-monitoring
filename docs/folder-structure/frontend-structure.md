# UPDATED: PALLIATIVE PATIENT MONITORING SYSTEM - FRONTEND FOLDER & FILE STRUCTURE

```markdown
# PALLIATIVE PATIENT MONITORING SYSTEM - FRONTEND FOLDER & FILE STRUCTURE

## 1. Overview

This document defines the complete frontend folder structure for the Palliative Patient Monitoring System.

**Technology Stack:**
- React 18+ with TypeScript
- Vite (Build Tool)
- Tailwind CSS
- React Router v6
- TanStack Query (React Query)
- Zustand (State Management)
- React Hook Form + Zod
- Recharts (for graphs)
- Sonner (Toast Notifications)

## 2. Complete Folder Structure

```
frontend/
├── public/
│   └── favicon.svg
├── src/
│   ├── api/
│   │   ├── admin.ts
│   │   ├── admissions.ts
│   │   ├── auth.ts
│   │   ├── client.ts
│   │   ├── index.ts
│   │   ├── labs.ts
│   │   ├── medications.ts
│   │   ├── patients.ts
│   │   ├── profile.ts                  # NEW - Profile API calls
│   │   ├── referrals.ts
│   │   ├── signatures.ts               # NEW - Digital signature API calls
│   │   ├── staff.ts                    # NEW - Staff API calls
│   │   └── visits.ts
│   ├── assets/
│   │   ├── images/
│   │   └── icons/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Checkbox.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Label.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Textarea.tsx
│   │   │   └── index.ts
│   │   ├── common/
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── Pagination.tsx
│   │   │   ├── PrintButton.tsx          # NEW - Print/export button
│   │   │   ├── Sidebar.tsx
│   │   │   └── StatusBadge.tsx
│   │   ├── layouts/
│   │   │   ├── AuthLayout.tsx
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── PrintLayout.tsx           # NEW - Minimal layout for print views
│   │   │   ├── PublicLayout.tsx
│   │   │   └── index.ts
│   │   ├── admin/
│   │   │   ├── AdminVisitList.tsx        # NEW - Full visit list with edit
│   │   │   ├── AdminMedicationList.tsx   # NEW - Full medication list
│   │   │   ├── AdminLabList.tsx          # NEW - Full lab test list
│   │   │   ├── AdminReferralList.tsx     # NEW - Full referral list
│   │   │   ├── AdminAdmissionList.tsx    # NEW - Full admission list with edit
│   │   │   ├── DashboardStats.tsx
│   │   │   ├── NotificationList.tsx
│   │   │   ├── CloseCaseModal.tsx
│   │   │   ├── ReferralApprovalList.tsx
│   │   │   ├── StaffApprovalList.tsx
│   │   │   ├── VisitEditModal.tsx        # NEW - Admin edit visit modal
│   │   │   ├── AdmissionEditModal.tsx    # NEW - Admin edit admission modal
│   │   │   └── index.ts
│   │   ├── patients/
│   │   │   ├── PatientCard.tsx
│   │   │   ├── PatientForm.tsx
│   │   │   ├── PatientList.tsx
│   │   │   ├── PatientPrintView.tsx      # NEW - Print-friendly patient view
│   │   │   ├── PatientProgressGraph.tsx
│   │   │   ├── PatientSummary.tsx
│   │   │   └── index.ts
│   │   ├── visits/
│   │   │   ├── VisitForm.tsx
│   │   │   ├── VisitList.tsx
│   │   │   ├── SignatureSection.tsx      # NEW - Digital signature section
│   │   │   └── index.ts
│   │   ├── medications/
│   │   │   ├── MedicationForm.tsx
│   │   │   ├── MedicationList.tsx
│   │   │   └── index.ts
│   │   ├── labs/
│   │   │   ├── LabForm.tsx
│   │   │   ├── LabList.tsx
│   │   │   └── index.ts
│   │   ├── referrals/
│   │   │   ├── ReferralForm.tsx
│   │   │   ├── ReferralList.tsx
│   │   │   └── index.ts
│   │   ├── admissions/
│   │   │   ├── AdmissionForm.tsx
│   │   │   ├── AdmissionList.tsx
│   │   │   └── index.ts
│   │   ├── staff/
│   │   │   ├── StaffDashboardStats.tsx
│   │   │   ├── PatientAssignmentList.tsx
│   │   │   ├── RecentVisitsList.tsx
│   │   │   ├── UpcomingVisitsList.tsx
│   │   │   ├── AlertList.tsx
│   │   │   └── index.ts
│   │   └── profile/                     # NEW - Profile components
│   │       ├── ProfileInfo.tsx
│   │       ├── ChangePassword.tsx
│   │       ├── ActivityStats.tsx
│   │       └── index.ts
│   ├── constants/
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useAdmin.ts
│   │   ├── useAdmissions.ts
│   │   ├── useAuth.ts
│   │   ├── useLabs.ts
│   │   ├── useMedications.ts
│   │   ├── usePatientProgress.ts
│   │   ├── usePatients.ts
│   │   ├── useProfile.ts                # NEW - Profile hooks
│   │   ├── useReferrals.ts
│   │   ├── useSignatures.ts             # NEW - Digital signature hooks
│   │   ├── useStaff.ts
│   │   ├── useVisits.ts
│   │   └── index.ts
│   ├── lib/
│   │   ├── axios.ts
│   │   ├── queryClient.ts
│   │   ├── toast.ts                     # NEW - Toast utility
│   │   └── utils.ts
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── AdminDashboardPage.tsx
│   │   │   ├── AdminPatientListPage.tsx
│   │   │   ├── AdminPatientDetailPage.tsx
│   │   │   ├── AdminPatientPrintPage.tsx  # NEW - Admin print view
│   │   │   ├── ReferralManagementPage.tsx
│   │   │   ├── StaffManagementPage.tsx
│   │   │   ├── ReportsPage.tsx
│   │   │   └── SettingsPage.tsx
│   │   ├── staff/
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── PatientDetailPage.tsx
│   │   │   ├── PatientListPage.tsx
│   │   │   ├── PatientPrintPage.tsx       # NEW - Staff print view
│   │   │   ├── PatientRegistrationPage.tsx
│   │   │   ├── PatientSummaryPage.tsx
│   │   │   ├── RecordAdmissionPage.tsx
│   │   │   ├── RecordVisitPage.tsx
│   │   │   ├── OrderLabPage.tsx
│   │   │   ├── OrderMedicationPage.tsx
│   │   │   └── RequestReferralPage.tsx
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── VerifyEmailPage.tsx
│   │   │   └── ResendVerificationPage.tsx
│   │   ├── LandingPage.tsx
│   │   ├── NotFoundPage.tsx
│   │   ├── ProfilePage.tsx               # NEW - Profile page
│   │   ├── UnauthorizedPage.tsx          # NEW - Unauthorized page
│   │   └── index.ts
│   ├── routes/
│   │   ├── ProtectedRoute.tsx
│   │   ├── PublicRoute.tsx
│   │   ├── AdminRoute.tsx                # NEW - Admin route guard
│   │   ├── StaffRoute.tsx                # NEW - Staff route guard
│   │   └── index.tsx
│   ├── store/
│   │   ├── auth.store.ts
│   │   └── index.ts
│   ├── styles/
│   │   ├── globals.css
│   │   └── print.css                    # NEW - Print-specific styles
│   ├── types/
│   │   ├── admin.types.ts
│   │   ├── admission.types.ts
│   │   ├── auth.types.ts
│   │   ├── lab.types.ts
│   │   ├── medication.types.ts
│   │   ├── patient.types.ts
│   │   ├── print.types.ts               # NEW - Print-related types
│   │   ├── profile.types.ts             # NEW - Profile types
│   │   ├── referral.types.ts
│   │   ├── signature.types.ts           # NEW - Digital signature types
│   │   ├── staff.types.ts
│   │   ├── toast.types.ts               # NEW - Toast types
│   │   ├── visit.types.ts
│   │   └── index.ts
│   ├── schemas/
│   │   ├── auth.schema.ts
│   │   ├── patient.schema.ts
│   │   ├── visit.schema.ts
│   │   ├── medication.schema.ts
│   │   ├── lab.schema.ts
│   │   ├── referral.schema.ts
│   │   ├── admission.schema.ts
│   │   ├── profile.schema.ts            # NEW - Profile schemas
│   │   └── signature.schema.ts          # NEW - Digital signature schemas
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── tests/
│   ├── components/
│   │   ├── admin/
│   │   ├── patients/
│   │   ├── visits/
│   │   ├── medications/
│   │   ├── labs/
│   │   ├── referrals/
│   │   └── admissions/
│   ├── hooks/
│   │   ├── useAdmin.test.ts
│   │   ├── useAuth.test.ts
│   │   ├── usePatients.test.ts
│   │   ├── useVisits.test.ts
│   │   ├── useMedications.test.ts
│   │   ├── useLabs.test.ts
│   │   ├── useReferrals.test.ts
│   │   └── useAdmissions.test.ts
│   ├── pages/
│   │   ├── admin/
│   │   ├── staff/
│   │   └── auth/
│   ├── setup.ts
│   └── utils/
│       └── testHelpers.ts
├── .env.example
├── .eslintrc.js
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 3. File Descriptions

### 3.1 API Layer (`src/api/`)

| File | Purpose |
|---|---|
| `client.ts` | Axios instance configuration with interceptors (includes blob support for PDF) |
| `auth.ts` | Authentication API calls (register, login, verify email, resend verification, logout, get user) |
| `profile.ts` | **NEW** - Profile API calls (get profile, update profile, change password, activity stats) |
| `signatures.ts` | **NEW** - Digital signature API calls (sign visit, get visit signatures) |
| `patients.ts` | Patient API calls (CRUD operations, print/export) |
| `visits.ts` | Home visit API calls |
| `medications.ts` | Medication API calls |
| `labs.ts` | Laboratory test API calls |
| `referrals.ts` | Referral API calls |
| `admissions.ts` | Hospital admission API calls |
| `admin.ts` | Admin API calls (staff approval, dashboard stats, notifications, close case, full patient detail, visit edit, admission edit, print/export) |
| `staff.ts` | Staff API calls (dashboard stats, alerts, profile) |
| `index.ts` | API exports |

### 3.2 Assets (`src/assets/`)

| Folder | Purpose |
|---|---|
| `images/` | Static images, logos |
| `icons/` | Icon assets |

### 3.3 Components (`src/components/`)

#### UI Components (`src/components/ui/`)

| File | Purpose |
|---|---|
| `Badge.tsx` | Status badge component |
| `Button.tsx` | Reusable button with variants |
| `Card.tsx` | Card container component |
| `Checkbox.tsx` | Checkbox input |
| `Input.tsx` | Text input with validation states |
| `Label.tsx` | Form label component |
| `Select.tsx` | Dropdown select component |
| `Textarea.tsx` | Textarea input |

#### Common Components (`src/components/common/`)

| File | Purpose |
|---|---|
| `EmptyState.tsx` | Empty state placeholder |
| `ErrorBoundary.tsx` | React error boundary |
| `Footer.tsx` | Public footer |
| `LoadingSpinner.tsx` | Loading indicator |
| `Navbar.tsx` | Public navigation bar |
| `Pagination.tsx` | Pagination component |
| `PrintButton.tsx` | **NEW** - Reusable print/export PDF button |
| `Sidebar.tsx` | Admin/staff sidebar navigation |
| `StatusBadge.tsx` | Status indicator with colors |

#### Layouts (`src/components/layouts/`)

| File | Purpose |
|---|---|
| `AuthLayout.tsx` | Layout for authentication pages |
| `DashboardLayout.tsx` | Layout for authenticated users |
| `PrintLayout.tsx` | **NEW** - Minimal layout for print views (no navigation, sidebars) |
| `PublicLayout.tsx` | Layout for public pages |

#### Feature Components

| Folder | Purpose | New Files |
|---|---|---|
| `admin/` | Admin-specific components | `AdminVisitList.tsx`, `AdminMedicationList.tsx`, `AdminLabList.tsx`, `AdminReferralList.tsx`, `AdminAdmissionList.tsx`, `VisitEditModal.tsx`, `AdmissionEditModal.tsx` |
| `patients/` | Patient management components | `PatientPrintView.tsx` |
| `visits/` | Home visit components | `SignatureSection.tsx` |
| `profile/` | **NEW** - Profile components | `ProfileInfo.tsx`, `ChangePassword.tsx`, `ActivityStats.tsx` |

### 3.4 Constants (`src/constants/`)

| File | Purpose |
|---|---|
| `index.ts` | Application constants (routes, query keys, enums) |

### 3.5 Hooks (`src/hooks/`)

| File | Purpose | Depends On |
|---|---|---|
| `useAuth.ts` | Authentication hooks (register, login, verify email, resend verification, logout, get user) | `api/auth.ts`, `store/auth.store.ts` |
| `useAdmin.ts` | Admin hooks (staff approval, dashboard stats, notifications, close case, full patient detail, visit edit, admission edit, print) | `api/admin.ts` |
| `usePatients.ts` | Patient hooks (list, detail, register, summary, progress, print) | `api/patients.ts` |
| `useVisits.ts` | Visit hooks (record, list, detail) | `api/visits.ts` |
| `useMedications.ts` | Medication hooks (order, list, update) | `api/medications.ts` |
| `useLabs.ts` | Lab hooks (order, list, update) | `api/labs.ts` |
| `useReferrals.ts` | Referral hooks (request, list, detail) | `api/referrals.ts` |
| `useAdmissions.ts` | Admission hooks (record, list, update) | `api/admissions.ts` |
| `useStaff.ts` | Staff dashboard hooks (dashboard stats, profile, alerts) | `api/staff.ts` |
| `useProfile.ts` | **NEW** - Profile hooks (get profile, update profile, change password, activity stats) | `api/profile.ts` |
| `useSignatures.ts` | **NEW** - Digital signature hooks (sign visit, get visit signatures) | `api/signatures.ts` |
| `usePatientProgress.ts` | Patient progress hooks (KPS/PPS graph data) | `api/patients.ts` |
| `index.ts` | All hooks exported | - |

### 3.6 Lib (`src/lib/`)

| File | Purpose |
|---|---|
| `axios.ts` | Axios instance with interceptors (includes blob response handling) |
| `queryClient.ts` | React Query client configuration |
| `toast.ts` | **NEW** - Toast notification utility (success, error, warning, info, loading, promise) |
| `utils.ts` | Utility functions |

### 3.7 Pages (`src/pages/`)

#### Admin Pages (`src/pages/admin/`)

| File | Purpose | Route |
|---|---|---|
| `AdminDashboardPage.tsx` | Admin dashboard with statistics and notifications | `/admin` |
| `AdminPatientListPage.tsx` | View all patients | `/admin/patients` |
| `AdminPatientDetailPage.tsx` | View patient details with full records and edit visits/admissions | `/admin/patients/:patientId` |
| `AdminPatientPrintPage.tsx` | **NEW** - Admin print/export view | `/admin/patients/:patientId/print` |
| `StaffManagementPage.tsx` | Manage staff registrations | `/admin/staff` |
| `ReferralManagementPage.tsx` | Manage referral approvals | `/admin/referrals` |
| `ReportsPage.tsx` | View system reports | `/admin/reports` |
| `SettingsPage.tsx` | System settings | `/admin/settings` |

#### Staff Pages (`src/pages/staff/`)

| File | Purpose | Route |
|---|---|---|
| `DashboardPage.tsx` | Staff dashboard | `/dashboard` |
| `PatientListPage.tsx` | List of patients | `/patients` |
| `PatientRegistrationPage.tsx` | Register new patient | `/patients/new` |
| `PatientDetailPage.tsx` | Patient details | `/patients/:patientId` |
| `PatientSummaryPage.tsx` | Patient summary report | `/patients/:patientId/summary` |
| `PatientPrintPage.tsx` | **NEW** - Staff print/export view | `/patients/:patientId/print` |
| `RecordVisitPage.tsx` | Record home visit | `/patients/:patientId/visits` |
| `OrderMedicationPage.tsx` | Order medication | `/patients/:patientId/medications` |
| `OrderLabPage.tsx` | Order lab test | `/patients/:patientId/labs` |
| `RequestReferralPage.tsx` | Request referral | `/patients/:patientId/referrals` |
| `RecordAdmissionPage.tsx` | Record hospital admission | `/patients/:patientId/admissions` |

#### Auth Pages (`src/pages/auth/`)

| File | Purpose | Route |
|---|---|---|
| `LoginPage.tsx` | User login | `/login` |
| `RegisterPage.tsx` | Staff registration | `/register` |
| `VerifyEmailPage.tsx` | Email verification | `/verify-email` |
| `ResendVerificationPage.tsx` | Resend verification email | `/resend-verification` |

#### Public Pages

| File | Purpose | Route |
|---|---|---|
| `LandingPage.tsx` | Landing page | `/` |
| `NotFoundPage.tsx` | 404 page | `*` |
| `UnauthorizedPage.tsx` | **NEW** - Unauthorized access page | `/unauthorized` |
| `ProfilePage.tsx` | **NEW** - User profile page | `/profile` |

### 3.8 Routes (`src/routes/`)

| File | Purpose |
|---|---|
| `ProtectedRoute.tsx` | Protects routes requiring authentication |
| `PublicRoute.tsx` | Redirects authenticated users away from public routes |
| `AdminRoute.tsx` | **NEW** - Admin route guard (redirects non-admin to unauthorized) |
| `StaffRoute.tsx` | **NEW** - Staff route guard (redirects non-staff to unauthorized) |
| `index.tsx` | Router configuration |

### 3.9 Store (`src/store/`)

| File | Purpose |
|---|---|
| `auth.store.ts` | Authentication state management (Zustand) |
| `index.ts` | Store exports |

### 3.10 Styles (`src/styles/`)

| File | Purpose |
|---|---|
| `globals.css` | Global styles and Tailwind imports |
| `print.css` | **NEW** - Print-specific styles (page setup, table styling, badge colors, header/footer) |

### 3.11 Types (`src/types/`)

| File | Purpose |
|---|---|
| `auth.types.ts` | Authentication types |
| `admin.types.ts` | Admin types (includes full patient detail, visit edit, admission edit, print types) |
| `patient.types.ts` | Patient types (includes print/export types) |
| `visit.types.ts` | Visit types |
| `medication.types.ts` | Medication types |
| `lab.types.ts` | Lab types |
| `referral.types.ts` | Referral types |
| `admission.types.ts` | Admission types |
| `staff.types.ts` | Staff types |
| `print.types.ts` | **NEW** - Print-related types (PrintButtonProps, PrintLayoutProps) |
| `profile.types.ts` | **NEW** - Profile types (Profile, UpdateProfileRequest, ChangePasswordRequest, ActivityStats) |
| `signature.types.ts` | **NEW** - Digital signature types (Signature, SignVisitRequest, VisitSignaturesResponse) |
| `toast.types.ts` | **NEW** - Toast types (ToastType, ToastOptions) |
| `index.ts` | All types exported |

### 3.12 Schemas (`src/schemas/`)

| File | Purpose |
|---|---|
| `auth.schema.ts` | Authentication form validation schemas |
| `patient.schema.ts` | Patient form validation schemas |
| `visit.schema.ts` | Visit form validation schemas |
| `medication.schema.ts` | Medication form validation schemas |
| `lab.schema.ts` | Lab form validation schemas |
| `referral.schema.ts` | Referral form validation schemas |
| `admission.schema.ts` | Admission form validation schemas |
| `profile.schema.ts` | **NEW** - Profile form validation schemas (update profile, change password) |
| `signature.schema.ts` | **NEW** - Digital signature form validation schema |

### 3.13 Root Files

| File | Purpose |
|---|---|
| `App.tsx` | Main application component (includes Toaster for toast notifications) |
| `main.tsx` | Application entry point |
| `vite-env.d.ts` | Vite environment types |

## 4. File Creation Order

### Phase 1: Configuration & Types
1. `src/styles/globals.css`
2. `src/styles/print.css` **NEW**
3. `src/types/` (all type files including new ones)
4. `src/constants/index.ts`

### Phase 2: API Client
5. `src/lib/utils.ts`
6. `src/lib/axios.ts` (with blob support)
7. `src/lib/queryClient.ts`
8. `src/lib/toast.ts` **NEW**
9. `src/api/client.ts`
10. `src/api/index.ts`

### Phase 3: Store
11. `src/store/auth.store.ts`
12. `src/store/index.ts`

### Phase 4: UI Components
13. `src/components/ui/` (all UI components)
14. `src/components/common/StatusBadge.tsx`
15. `src/components/common/LoadingSpinner.tsx`
16. `src/components/common/EmptyState.tsx`
17. `src/components/common/PrintButton.tsx` **NEW**

### Phase 5: Layouts
18. `src/components/layouts/PublicLayout.tsx`
19. `src/components/layouts/AuthLayout.tsx`
20. `src/components/layouts/DashboardLayout.tsx`
21. `src/components/layouts/PrintLayout.tsx` **NEW**
22. `src/components/common/Navbar.tsx`
23. `src/components/common/Sidebar.tsx`
24. `src/components/common/Footer.tsx`
25. `src/components/common/ErrorBoundary.tsx`

### Phase 6: API Files
26. `src/api/auth.ts`
27. `src/api/profile.ts` **NEW**
28. `src/api/signatures.ts` **NEW**
29. `src/api/patients.ts` (includes print/export)
30. `src/api/visits.ts`
31. `src/api/medications.ts`
32. `src/api/labs.ts`
33. `src/api/referrals.ts`
34. `src/api/admissions.ts`
35. `src/api/admin.ts` (includes full detail, visit edit, admission edit, print)
36. `src/api/staff.ts`

### Phase 7: Schemas
37. `src/schemas/auth.schema.ts`
38. `src/schemas/patient.schema.ts`
39. `src/schemas/visit.schema.ts`
40. `src/schemas/medication.schema.ts`
41. `src/schemas/lab.schema.ts`
42. `src/schemas/referral.schema.ts`
43. `src/schemas/admission.schema.ts`
44. `src/schemas/profile.schema.ts` **NEW**
45. `src/schemas/signature.schema.ts` **NEW**

### Phase 8: Hooks
46. `src/hooks/useAuth.ts`
47. `src/hooks/useAdmin.ts` (includes full detail, visit edit, admission edit, print)
48. `src/hooks/usePatients.ts` (includes print)
49. `src/hooks/useVisits.ts`
50. `src/hooks/useMedications.ts`
51. `src/hooks/useLabs.ts`
52. `src/hooks/useReferrals.ts`
53. `src/hooks/useAdmissions.ts`
54. `src/hooks/useStaff.ts`
55. `src/hooks/useProfile.ts` **NEW**
56. `src/hooks/useSignatures.ts` **NEW**
57. `src/hooks/usePatientProgress.ts`
58. `src/hooks/index.ts`

### Phase 9: Feature Components
59. `src/components/visits/SignatureSection.tsx` **NEW**
60. `src/components/admin/` (all admin components including new ones)
61. `src/components/patients/` (all patient components including PatientPrintView)
62. `src/components/profile/` **NEW** (ProfileInfo, ChangePassword, ActivityStats)

### Phase 10: Pages
63. `src/pages/auth/LoginPage.tsx`
64. `src/pages/auth/RegisterPage.tsx`
65. `src/pages/auth/VerifyEmailPage.tsx`
66. `src/pages/auth/ResendVerificationPage.tsx`
67. `src/pages/LandingPage.tsx`
68. `src/pages/UnauthorizedPage.tsx` **NEW**
69. `src/pages/ProfilePage.tsx` **NEW**
70. `src/pages/admin/AdminDashboardPage.tsx`
71. `src/pages/admin/AdminPatientListPage.tsx`
72. `src/pages/admin/AdminPatientDetailPage.tsx` (full detail with edit)
73. `src/pages/admin/AdminPatientPrintPage.tsx` **NEW**
74. `src/pages/admin/StaffManagementPage.tsx`
75. `src/pages/admin/ReferralManagementPage.tsx`
76. `src/pages/admin/ReportsPage.tsx`
77. `src/pages/admin/SettingsPage.tsx`
78. `src/pages/staff/DashboardPage.tsx`
79. `src/pages/staff/PatientListPage.tsx`
80. `src/pages/staff/PatientRegistrationPage.tsx`
81. `src/pages/staff/PatientDetailPage.tsx`
82. `src/pages/staff/PatientSummaryPage.tsx` (with print)
83. `src/pages/staff/PatientPrintPage.tsx` **NEW**
84. `src/pages/staff/RecordVisitPage.tsx` (with signatures)
85. `src/pages/staff/OrderMedicationPage.tsx`
86. `src/pages/staff/OrderLabPage.tsx`
87. `src/pages/staff/RequestReferralPage.tsx`
88. `src/pages/staff/RecordAdmissionPage.tsx`
89. `src/pages/NotFoundPage.tsx`

### Phase 11: Routing
90. `src/routes/PublicRoute.tsx`
91. `src/routes/ProtectedRoute.tsx`
92. `src/routes/AdminRoute.tsx` **NEW**
93. `src/routes/StaffRoute.tsx` **NEW**
94. `src/routes/index.tsx` (includes print routes, profile, unauthorized)

### Phase 12: App
95. `src/App.tsx` (imports print.css, adds Toaster)
96. `src/main.tsx`

## 5. Import Path Aliases

Configure `vite.config.ts` with these path aliases:

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@api': path.resolve(__dirname, './src/api'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@components': path.resolve(__dirname, './src/components'),
      '@constants': path.resolve(__dirname, './src/constants'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@routes': path.resolve(__dirname, './src/routes'),
      '@store': path.resolve(__dirname, './src/store'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@types': path.resolve(__dirname, './src/types'),
      '@schemas': path.resolve(__dirname, './src/schemas'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
});
```

## 6. Naming Conventions

| File Type | Naming Convention | Example |
|---|---|---|
| Pages | `*Page.tsx` | `LoginPage.tsx` |
| Components | `PascalCase.tsx` | `PatientCard.tsx` |
| Hooks | `use*.ts` | `usePatients.ts` |
| Types | `*.types.ts` | `patient.types.ts` |
| Schemas | `*.schema.ts` | `auth.schema.ts` |
| Constants | `*.ts` (index) | `index.ts` |
| Styles | `*.css` | `globals.css`, `print.css` |
| Tests | `*.test.tsx` | `LoginPage.test.tsx` |

## 7. Environment Variables

```env
# .env.example

# API
VITE_API_URL=http://localhost:5000/api/v1

# App
VITE_APP_NAME=Palliative Care System
VITE_APP_ENV=development
```