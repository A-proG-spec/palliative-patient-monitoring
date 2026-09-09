## `docs/folder-structure/frontend-structure.md`

---

# Frontend Project Structure

## 1.0 Overview

**Technology Stack:**
- React 18 + TypeScript
- Vite (Build Tool)
- Tailwind CSS (Styling)
- React Router v6 (Routing)
- TanStack Query v5 (Server State)
- Zustand (Client State)
- React Hook Form + Zod (Forms)
- Recharts (Charts)
- Framer Motion (Animations)
- Lucide React (Icons)

**Base Directory:** `/frontend`

---

## 2.0 Complete Directory Tree

```
frontend/
├── public/
│   ├── favicon.svg                      # Favicon
│   └── icons.svg                        # SVG icon sprite
├── src/
│   ├── api/
│   │   ├── mocks/
│   │   │   ├── admin.mock.ts            # Admin API mock data
│   │   │   ├── admissions.mock.ts       # Admissions mock data
│   │   │   ├── auth.mock.ts             # Auth mock data
│   │   │   ├── imaging.mock.ts          # Imaging mock data
│   │   │   ├── labs.mock.ts             # Labs mock data
│   │   │   ├── medications.mock.ts      # Medications mock data
│   │   │   ├── patients.mock.ts         # Patients mock data
│   │   │   ├── progress-notes.mock.ts   # Progress notes mock data
│   │   │   ├── referrals.mock.ts        # Referrals mock data
│   │   │   ├── signatures.mock.ts       # Signatures mock data
│   │   │   ├── staff.mock.ts            # Staff mock data
│   │   │   └── visits.mock.ts           # Visits mock data
│   │   ├── admin.ts                     # Admin API client
│   │   ├── admissions.ts                # Admissions API client
│   │   ├── auth.ts                      # Auth API client
│   │   ├── client.ts                    # Axios client configuration
│   │   ├── imaging.ts                   # Imaging API client
│   │   ├── index.ts                     # API exports
│   │   ├── labs.ts                      # Labs API client
│   │   ├── medications.ts               # Medications API client
│   │   ├── patients.ts                  # Patients API client
│   │   ├── profile.ts                   # Profile API client
│   │   ├── progress-notes.ts            # Progress notes API client
│   │   ├── referrals.ts                 # Referrals API client
│   │   ├── signatures.ts                # Signatures API client
│   │   ├── staff.ts                     # Staff API client
│   │   └── visits.ts                    # Visits API client
│   ├── assets/
│   │   ├── hero.png                     # Landing page hero image
│   │   ├── typescript.svg               # TypeScript logo
│   │   └── vite.svg                     # Vite logo
│   ├── components/
│   │   ├── admin/
│   │   │   ├── CloseCaseModal.tsx       # Close case confirmation modal
│   │   │   ├── DashboardStats.tsx       # Admin dashboard stats cards
│   │   │   ├── DischargePatientModal.tsx # Discharge patient form
│   │   │   ├── index.ts                 # Admin component exports
│   │   │   ├── NotificationList.tsx     # Admin notification list
│   │   │   ├── ReferralApprovalList.tsx # Admin referral approval list
│   │   │   ├── StaffApprovalList.tsx    # Admin staff approval list
│   │   │   └── VisitEditModal.tsx       # Admin visit edit modal
│   │   ├── admissions/
│   │   │   ├── AdmissionForm.tsx        # Admission form
│   │   │   ├── AdmissionList.tsx        # Admission list
│   │   │   └── index.ts                 # Admission component exports
│   │   ├── common/
│   │   │   ├── BackButton.tsx           # Back navigation button
│   │   │   ├── EmptyState.tsx           # Empty state component
│   │   │   ├── ErrorBoundary.tsx        # React error boundary
│   │   │   ├── Footer.tsx               # Application footer
│   │   │   ├── LoadingSpinner.tsx       # Loading spinner
│   │   │   ├── Navbar.tsx               # Public navbar
│   │   │   ├── Pagination.tsx           # Pagination component
│   │   │   ├── Sidebar.tsx              # Dashboard sidebar
│   │   │   └── StatusBadge.tsx          # Status badge component
│   │   ├── imaging/
│   │   │   ├── ImagingList.tsx          # Imaging order list
│   │   │   └── ImagingResultEntry.tsx   # Imaging report entry
│   │   ├── labs/
│   │   │   ├── index.ts                 # Lab component exports
│   │   │   ├── LabForm.tsx              # Lab order form
│   │   │   ├── LabList.tsx              # Lab test list
│   │   │   └── LabResultEntry.tsx       # Lab result entry
│   │   ├── layouts/
│   │   │   ├── AuthLayout.tsx           # Authentication layout
│   │   │   ├── DashboardLayout.tsx      # Dashboard layout
│   │   │   ├── index.ts                 # Layout exports
│   │   │   ├── PrintLayout.tsx          # Print layout
│   │   │   └── PublicLayout.tsx         # Public layout
│   │   ├── medications/
│   │   │   ├── index.ts                 # Medication component exports
│   │   │   ├── MedicationForm.tsx       # Medication order form
│   │   │   └── MedicationList.tsx       # Medication list
│   │   ├── patients/
│   │   │   ├── index.ts                 # Patient component exports
│   │   │   ├── PatientCard.tsx          # Patient card
│   │   │   ├── PatientForm.tsx          # Patient registration form
│   │   │   ├── PatientList.tsx          # Patient list
│   │   │   ├── PatientProgressGraph.tsx # Progress chart
│   │   │   └── PatientSummary.tsx       # Patient summary
│   │   ├── profile/
│   │   │   ├── ActivityStats.tsx        # Activity statistics
│   │   │   ├── ChangePassword.tsx       # Change password form
│   │   │   └── ProfileInfo.tsx          # Profile information
│   │   ├── referrals/
│   │   │   ├── index.ts                 # Referral component exports
│   │   │   ├── ReferralForm.tsx         # Referral request form
│   │   │   └── ReferralList.tsx         # Referral list
│   │   ├── staff/
│   │   │   ├── AlertList.tsx            # Staff alerts list
│   │   │   ├── index.ts                 # Staff component exports
│   │   │   ├── PatientAssignmentList.tsx # Patient assignment list
│   │   │   ├── RecentVisitsList.tsx     # Recent visits list
│   │   │   ├── StaffDashboardStats.tsx  # Staff dashboard stats
│   │   │   └── UpcomingVisitsList.tsx   # Upcoming visits list
│   │   ├── ui/
│   │   │   ├── Badge.tsx                # Badge component
│   │   │   ├── Button.tsx               # Button component
│   │   │   ├── Card.tsx                 # Card component
│   │   │   ├── Checkbox.tsx             # Checkbox component
│   │   │   ├── index.ts                 # UI component exports
│   │   │   ├── Input.tsx                # Input component
│   │   │   ├── Label.tsx                # Label component
│   │   │   ├── Select.tsx               # Select dropdown
│   │   │   └── Textarea.tsx             # Textarea component
│   │   └── visits/
│   │       ├── index.ts                 # Visit component exports
│   │       ├── SignatureSection.tsx     # Digital signature section
│   │       ├── VisitForm.tsx            # Visit recording form
│   │       └── VisitList.tsx            # Visit list
│   ├── constants/
│   │   └── index.ts                     # Application constants
│   ├── context/
│   │   └── ToastContext.tsx             # Toast notification context
│   ├── hooks/
│   │   ├── index.ts                     # Hook exports
│   │   ├── useAdmin.ts                  # Admin hooks
│   │   ├── useAdmissions.ts             # Admissions hooks
│   │   ├── useAuth.ts                   # Auth hooks
│   │   ├── useImaging.ts                # Imaging hooks
│   │   ├── useLabs.ts                   # Lab hooks
│   │   ├── useMedications.ts            # Medication hooks
│   │   ├── usePatientProgress.ts        # Patient progress hooks
│   │   ├── usePatients.ts               # Patient hooks
│   │   ├── useProfile.ts                # Profile hooks
│   │   ├── useProgressNotes.ts          # Progress note hooks
│   │   ├── useReferrals.ts              # Referral hooks
│   │   ├── useSignatures.ts             # Signature hooks
│   │   ├── useStaff.ts                  # Staff hooks
│   │   └── useVisits.ts                 # Visit hooks
│   ├── lib/
│   │   ├── axios.ts                     # Axios configuration
│   │   ├── config.ts                    # App configuration
│   │   ├── printDischargeSummary.ts     # Print discharge summary utility
│   │   ├── printPatientReport.ts        # Print patient report utility
│   │   ├── queryClient.ts               # TanStack Query client
│   │   └── utils.ts                     # Utility functions
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── AdminDashboardPage.tsx   # Admin dashboard
│   │   │   ├── AdminPatientDetailPage.tsx # Admin patient detail
│   │   │   ├── AdminPatientListPage.tsx # Admin patient list
│   │   │   ├── DischargePatientPage.tsx # Discharge patient page
│   │   │   ├── ReferralManagementPage.tsx # Referral management
│   │   │   ├── ReportsPage.tsx          # Reports page
│   │   │   ├── SettingsPage.tsx         # Settings page
│   │   │   └── StaffManagementPage.tsx  # Staff management
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx            # Login page
│   │   │   ├── RegisterPage.tsx         # Registration page
│   │   │   ├── ResendVerificationPage.tsx # Resend verification page
│   │   │   └── VerifyEmailPage.tsx      # Email verification page
│   │   ├── staff/
│   │   │   ├── AdmissionDetailPage.tsx  # Admission detail
│   │   │   ├── DashboardPage.tsx        # Staff dashboard
│   │   │   ├── LabDetailPage.tsx        # Lab detail
│   │   │   ├── MedicationDetailPage.tsx # Medication detail
│   │   │   ├── OrderImagingPage.tsx     # Order imaging
│   │   │   ├── OrderLabPage.tsx         # Order lab test
│   │   │   ├── OrderMedicationPage.tsx  # Order medication
│   │   │   ├── PatientDetailPage.tsx    # Patient detail
│   │   │   ├── PatientListPage.tsx      # Patient list
│   │   │   ├── PatientProgressPage.tsx  # Patient progress
│   │   │   ├── PatientRegistrationPage.tsx # Patient registration
│   │   │   ├── PatientSummaryPage.tsx   # Patient summary
│   │   │   ├── RecordAdmissionPage.tsx  # Record admission
│   │   │   ├── RecordProgressNotePage.tsx # Record progress note
│   │   │   ├── RecordVisitPage.tsx      # Record visit
│   │   │   ├── ReferralDetailPage.tsx   # Referral detail
│   │   │   ├── RequestReferralPage.tsx  # Request referral
│   │   │   ├── VisitDetailPage.tsx      # Visit detail
│   │   │   └── VisitsListPage.tsx       # Visits list
│   │   ├── index.ts                     # Page exports
│   │   ├── LandingPage.tsx              # Landing page
│   │   ├── NotFoundPage.tsx             # 404 page
│   │   ├── PatientPrintPage.tsx         # Patient print page
│   │   ├── ProfilePage.tsx              # Profile page
│   │   └── UnauthorizedPage.tsx         # Unauthorised page
│   ├── routes/
│   │   ├── index.tsx                    # Route configuration
│   │   ├── ProtectedRoute.tsx           # Protected route wrapper
│   │   └── PublicRoute.tsx              # Public route wrapper
│   ├── schemas/
│   │   ├── admission.schema.ts          # Admission validation schemas
│   │   ├── auth.schema.ts               # Auth validation schemas
│   │   ├── lab.schema.ts                # Lab validation schemas
│   │   ├── medication.schema.ts         # Medication validation schemas
│   │   ├── patient.schema.ts            # Patient validation schemas
│   │   ├── profile.schema.ts            # Profile validation schemas
│   │   ├── referral.schema.ts           # Referral validation schemas
│   │   ├── signature.schema.ts          # Signature validation schemas
│   │   └── visit.schema.ts              # Visit validation schemas
│   ├── store/
│   │   ├── auth.store.ts                # Authentication store
│   │   └── index.ts                     # Store exports
│   ├── styles/
│   │   └── globals.css                  # Global styles
│   ├── types/
│   │   ├── admin.types.ts               # Admin type definitions
│   │   ├── admission.types.ts           # Admission type definitions
│   │   ├── auth.types.ts                # Auth type definitions
│   │   ├── index.ts                     # Type exports
│   │   ├── lab.types.ts                 # Lab type definitions
│   │   ├── medication.types.ts          # Medication type definitions
│   │   ├── patient.types.ts             # Patient type definitions
│   │   ├── profile.types.ts             # Profile type definitions
│   │   ├── referral.types.ts            # Referral type definitions
│   │   ├── signature.types.ts           # Signature type definitions
│   │   ├── staff.types.ts               # Staff type definitions
│   │   └── visit.types.ts               # Visit type definitions
│   ├── App.tsx                          # Root application component
│   ├── counter.ts                       # Counter utility (legacy)
│   ├── main.ts                          # Entry point (legacy)
│   ├── main.tsx                         # Entry point
│   ├── style.css                        # Legacy styles
│   └── vite-env.d.ts                    # Vite environment types
├── tests/
│   ├── utils/
│   │   └── testHelpers.ts               # Test helper functions
│   └── setup.ts                         # Test setup
├── index.html                           # HTML entry point
├── package-lock.json
├── package.json
├── postcss.config.js                    # PostCSS configuration
├── README.md                            # Project README
├── tailwind.config.js                   # Tailwind configuration
├── tsconfig.json                        # TypeScript configuration
├── tsconfig.node.json                   # Node TypeScript configuration
└── vite.config.ts                       # Vite configuration
```

---

## 3.0 File Descriptions

### 3.1 API (`src/api/`)

| File | Description |
|------|-------------|
| `admin.ts` | Admin API client (dashboard, staff, referrals, reports) |
| `admissions.ts` | Admission API client (CRUD) |
| `auth.ts` | Authentication API client (login, register, verify) |
| `client.ts` | Axios client with interceptors |
| `imaging.ts` | Imaging order API client |
| `index.ts` | Central export of all API clients |
| `labs.ts` | Lab test API client |
| `medications.ts` | Medication API client |
| `patients.ts` | Patient API client |
| `profile.ts` | Profile API client |
| `progress-notes.ts` | Progress note API client |
| `referrals.ts` | Referral API client |
| `signatures.ts` | Signature API client |
| `staff.ts` | Staff API client |
| `visits.ts` | Visit API client |

### 3.2 Components (`src/components/`)

| Directory | Description |
|-----------|-------------|
| `admin/` | Admin-specific components (dashboard stats, approval lists, modals) |
| `admissions/` | Admission form and list components |
| `common/` | Shared components (BackButton, Footer, Sidebar, StatusBadge) |
| `imaging/` | Imaging order and report entry components |
| `labs/` | Lab order and result entry components |
| `layouts/` | Layout components (Auth, Dashboard, Print, Public) |
| `medications/` | Medication order and list components |
| `patients/` | Patient registration, card, list, and summary components |
| `profile/` | Profile information, activity stats, change password |
| `referrals/` | Referral form and list components |
| `staff/` | Staff dashboard components (alerts, stats, lists) |
| `ui/` | Reusable UI primitives (Button, Input, Select, Card, Badge) |
| `visits/` | Visit recording form, list, and signature components |

### 3.3 Hooks (`src/hooks/`)

| File | Description |
|------|-------------|
| `useAdmin.ts` | React Query hooks for admin operations |
| `useAdmissions.ts` | React Query hooks for admissions |
| `useAuth.ts` | React Query hooks for authentication |
| `useImaging.ts` | React Query hooks for imaging orders |
| `useLabs.ts` | React Query hooks for lab tests |
| `useMedications.ts` | React Query hooks for medications |
| `usePatientProgress.ts` | React Query hook for patient progress |
| `usePatients.ts` | React Query hooks for patients |
| `useProfile.ts` | React Query hooks for user profile |
| `useProgressNotes.ts` | React Query hooks for progress notes |
| `useReferrals.ts` | React Query hooks for referrals |
| `useSignatures.ts` | React Query hooks for signatures |
| `useStaff.ts` | React Query hooks for staff operations |
| `useVisits.ts` | React Query hooks for visits |

### 3.4 Pages (`src/pages/`)

| Directory | Description |
|-----------|-------------|
| `admin/` | Admin pages (Dashboard, Patient List, Patient Detail, Discharge, Reports, Settings, Staff Management) |
| `auth/` | Authentication pages (Login, Register, Verify Email, Resend Verification) |
| `staff/` | Staff pages (Dashboard, Patient CRUD, Visit CRUD, Medication CRUD, Lab CRUD, Imaging CRUD, Referral CRUD, Admission CRUD, Progress Note CRUD) |
| Root | Public pages (Landing, NotFound, Unauthorized, Profile, PatientPrint) |

### 3.5 Schemas (`src/schemas/`)

| File | Description |
|------|-------------|
| `admission.schema.ts` | Zod schemas for admission form validation |
| `auth.schema.ts` | Zod schemas for auth form validation |
| `lab.schema.ts` | Zod schemas for lab form validation |
| `medication.schema.ts` | Zod schemas for medication form validation |
| `patient.schema.ts` | Zod schemas for patient form validation |
| `profile.schema.ts` | Zod schemas for profile form validation |
| `referral.schema.ts` | Zod schemas for referral form validation |
| `signature.schema.ts` | Zod schemas for signature validation |
| `visit.schema.ts` | Zod schemas for visit form validation |

### 3.6 Types (`src/types/`)

| File | Description |
|------|-------------|
| `admin.types.ts` | Admin-related TypeScript types |
| `admission.types.ts` | Admission-related TypeScript types |
| `auth.types.ts` | Authentication-related TypeScript types |
| `index.ts` | Central export of all types |
| `lab.types.ts` | Lab-related TypeScript types |
| `medication.types.ts` | Medication-related TypeScript types |
| `patient.types.ts` | Patient-related TypeScript types |
| `profile.types.ts` | Profile-related TypeScript types |
| `referral.types.ts` | Referral-related TypeScript types |
| `signature.types.ts` | Signature-related TypeScript types |
| `staff.types.ts` | Staff-related TypeScript types |
| `visit.types.ts` | Visit-related TypeScript types |

---

## 4.0 Module Dependencies

```
┌─────────────────────────────────────────────────────────────────┐
│                         App.tsx                                 │
│                  (Root Component)                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          Routes                                 │
│                  (Route Configuration)                          │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   Pages       │    │  Components   │    │  Hooks        │
│  (Views)      │    │  (Reusable)   │    │  (Query,      │
│               │    │               │    │   State)      │
└───────────────┘    └───────────────┘    └───────────────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   Schemas     │    │  UI Library   │    │  API Client   │
│  (Validation) │    │  (Primitives) │    │  (HTTP Calls) │
└───────────────┘    └───────────────┘    └───────────────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   Types       │    │   Styles      │    │   Store       │
│  (TypeScript) │    │  (Tailwind)   │    │  (Zustand)    │
└───────────────┘    └───────────────┘    └───────────────┘
```

---

## 5.0 File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Component | `PascalCase.tsx` | `PatientList.tsx` |
| Hook | `usePascalCase.ts` | `usePatients.ts` |
| Schema | `kebab-case.schema.ts` | `patient.schema.ts` |
| Type | `kebab-case.types.ts` | `patient.types.ts` |
| Page | `PascalCasePage.tsx` | `PatientListPage.tsx` |
| Layout | `PascalCaseLayout.tsx` | `DashboardLayout.tsx` |
| Utility | `camelCase.ts` | `utils.ts` |
| Store | `kebab-case.store.ts` | `auth.store.ts` |
| API | `kebab-case.ts` | `patients.ts` |

---

## 6.0 Path Aliases

| Alias | Path |
|-------|------|
| `@/*` | `src/*` |
| `@api/*` | `src/api/*` |
| `@assets/*` | `src/assets/*` |
| `@components/*` | `src/components/*` |
| `@constants/*` | `src/constants/*` |
| `@hooks/*` | `src/hooks/*` |
| `@lib/*` | `src/lib/*` |
| `@pages/*` | `src/pages/*` |
| `@routes/*` | `src/routes/*` |
| `@store/*` | `src/store/*` |
| `@styles/*` | `src/styles/*` |
| `@types/*` | `src/types/*` |
| `@schemas/*` | `src/schemas/*` |

---

## 7.0 NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server (Vite) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests (when added) |

---

## 8.0 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API URL | Yes |
| `VITE_APP_NAME` | Application name | No |
| `VITE_APP_ENV` | Environment (development, staging, production) | No |
| `VITE_USE_MOCK` | Enable mock mode (true/false) | Yes |

---
