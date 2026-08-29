# folder-structure/frontend-structure.md

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

## 2. Complete Folder Structure

```
frontend/
├── public/
│   └── favicon.svg
├── src/
│   ├── api/
│   │   ├── auth.ts
│   │   ├── patients.ts
│   │   ├── visits.ts
│   │   ├── medications.ts
│   │   ├── labs.ts
│   │   ├── referrals.ts
│   │   ├── admissions.ts
│   │   ├── admin.ts
│   │   ├── client.ts
│   │   └── index.ts
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
│   │   │   ├── Sidebar.tsx
│   │   │   └── StatusBadge.tsx
│   │   ├── layouts/
│   │   │   ├── AuthLayout.tsx
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── PublicLayout.tsx
│   │   │   └── index.ts
│   │   ├── admin/
│   │   │   ├── DashboardStats.tsx
│   │   │   ├── NotificationList.tsx
│   │   │   ├── PatientDischargeModal.tsx
│   │   │   ├── ReferralApprovalList.tsx
│   │   │   ├── StaffApprovalList.tsx
│   │   │   └── index.ts
│   │   ├── patients/
│   │   │   ├── PatientCard.tsx
│   │   │   ├── PatientForm.tsx
│   │   │   ├── PatientList.tsx
│   │   │   ├── PatientProgressGraph.tsx
│   │   │   ├── PatientSummary.tsx
│   │   │   └── index.ts
│   │   ├── visits/
│   │   │   ├── VisitForm.tsx
│   │   │   ├── VisitList.tsx
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
│   │   └── admissions/
│   │       ├── AdmissionForm.tsx
│   │       ├── AdmissionList.tsx
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
│   │   ├── useReferrals.ts
│   │   ├── useVisits.ts
│   │   └── index.ts
│   ├── lib/
│   │   ├── axios.ts
│   │   ├── queryClient.ts
│   │   └── utils.ts
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── AdminDashboardPage.tsx
│   │   │   ├── ReferralManagementPage.tsx
│   │   │   └── StaffManagementPage.tsx
│   │   ├── staff/
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── PatientDetailPage.tsx
│   │   │   ├── PatientListPage.tsx
│   │   │   ├── PatientRegistrationPage.tsx
│   │   │   ├── PatientSummaryPage.tsx
│   │   │   ├── RecordAdmissionPage.tsx
│   │   │   ├── RecordVisitPage.tsx
│   │   │   ├── OrderLabPage.tsx
│   │   │   ├── OrderMedicationPage.tsx
│   │   │   └── RequestReferralPage.tsx
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   ├── LandingPage.tsx
│   │   ├── NotFoundPage.tsx
│   │   └── index.ts
│   ├── routes/
│   │   ├── ProtectedRoute.tsx
│   │   ├── PublicRoute.tsx
│   │   └── index.tsx
│   ├── store/
│   │   ├── auth.store.ts
│   │   └── index.ts
│   ├── styles/
│   │   └── globals.css
│   ├── types/
│   │   ├── admin.types.ts
│   │   ├── admission.types.ts
│   │   ├── auth.types.ts
│   │   ├── lab.types.ts
│   │   ├── medication.types.ts
│   │   ├── patient.types.ts
│   │   ├── referral.types.ts
│   │   ├── visit.types.ts
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
|
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
| `client.ts` | Axios instance configuration with interceptors |
| `auth.ts` | Authentication API calls (register, login, logout, get user) |
| `patients.ts` | Patient API calls (CRUD operations) |
| `visits.ts` | Home visit API calls |
| `medications.ts` | Medication API calls |
| `labs.ts` | Laboratory test API calls |
| `referrals.ts` | Referral API calls |
| `admissions.ts` | Hospital admission API calls |
| `admin.ts` | Admin API calls (staff approval, dashboard stats, notifications) |
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
| `Sidebar.tsx` | Admin/staff sidebar navigation |
| `StatusBadge.tsx` | Status indicator with colors |

#### Layouts (`src/components/layouts/`)

| File | Purpose |
|---|---|
| `AuthLayout.tsx` | Layout for authentication pages |
| `DashboardLayout.tsx` | Layout for authenticated users |
| `PublicLayout.tsx` | Layout for public pages |

#### Feature Components

| Folder | Purpose |
|---|---|
| `admin/` | Admin-specific components |
| `patients/` | Patient management components |
| `visits/` | Home visit components |
| `medications/` | Medication components |
| `labs/` | Laboratory test components |
| `referrals/` | Referral components |
| `admissions/` | Hospital admission components |

### 3.4 Constants (`src/constants/`)

| File | Purpose |
|---|---|
| `index.ts` | Application constants (routes, query keys, enums) |

### 3.5 Hooks (`src/hooks/`)

| File | Purpose | Depends On |
|---|---|---|
| `useAuth.ts` | Authentication hooks (login, register, logout, get user) | `api/auth.ts`, `store/auth.store.ts` |
| `useAdmin.ts` | Admin hooks (staff approval, dashboard stats, notifications) | `api/admin.ts` |
| `usePatients.ts` | Patient hooks (list, detail, register, summary) | `api/patients.ts` |
| `useVisits.ts` | Visit hooks (record, list, detail) | `api/visits.ts` |
| `useMedications.ts` | Medication hooks (order, list, update) | `api/medications.ts` |
| `useLabs.ts` | Lab hooks (order, list, update) | `api/labs.ts` |
| `useReferrals.ts` | Referral hooks (request, list, detail) | `api/referrals.ts` |
| `useAdmissions.ts` | Admission hooks (record, list, update) | `api/admissions.ts` |
| `usePatientProgress.ts` | Patient progress hooks (KPS/PPS graph data) | `api/patients.ts` |

### 3.6 Lib (`src/lib/`)

| File | Purpose |
|---|---|
| `axios.ts` | Axios instance with interceptors |
| `queryClient.ts` | React Query client configuration |
| `utils.ts` | Utility functions |

### 3.7 Pages (`src/pages/`)

#### Admin Pages (`src/pages/admin/`)

| File | Purpose | Route |
|---|---|---|
| `AdminDashboardPage.tsx` | Admin dashboard with statistics and notifications | `/admin` |
| `StaffManagementPage.tsx` | Manage staff registrations | `/admin/staff` |
| `ReferralManagementPage.tsx` | Manage referral approvals | `/admin/referrals` |

#### Staff Pages (`src/pages/staff/`)

| File | Purpose | Route |
|---|---|---|
| `DashboardPage.tsx` | Staff dashboard | `/dashboard` |
| `PatientListPage.tsx` | List of patients | `/patients` |
| `PatientRegistrationPage.tsx` | Register new patient | `/patients/new` |
| `PatientDetailPage.tsx` | Patient details | `/patients/:id` |
| `PatientSummaryPage.tsx` | Patient summary report | `/patients/:id/summary` |
| `RecordVisitPage.tsx` | Record home visit | `/patients/:id/visits` |
| `OrderMedicationPage.tsx` | Order medication | `/patients/:id/medications` |
| `OrderLabPage.tsx` | Order lab test | `/patients/:id/labs` |
| `RequestReferralPage.tsx` | Request referral | `/patients/:id/referrals` |
| `RecordAdmissionPage.tsx` | Record hospital admission | `/patients/:id/admissions` |

#### Auth Pages (`src/pages/auth/`)

| File | Purpose | Route |
|---|---|---|
| `LoginPage.tsx` | User login | `/login` |
| `RegisterPage.tsx` | Staff registration | `/register` |

#### Public Pages

| File | Purpose | Route |
|---|---|---|
| `LandingPage.tsx` | Landing page | `/` |
| `NotFoundPage.tsx` | 404 page | `*` |

### 3.8 Routes (`src/routes/`)

| File | Purpose |
|---|---|
| `ProtectedRoute.tsx` | Protects routes requiring authentication |
| `PublicRoute.tsx` | Redirects authenticated users away from public routes |
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

### 3.11 Types (`src/types/`)

| File | Purpose |
|---|---|
| `auth.types.ts` | Authentication types |
| `admin.types.ts` | Admin types |
| `patient.types.ts` | Patient types |
| `visit.types.ts` | Visit types |
| `medication.types.ts` | Medication types |
| `lab.types.ts` | Lab types |
| `referral.types.ts` | Referral types |
| `admission.types.ts` | Admission types |
| `index.ts` | All types exported |

### 3.12 Root Files

| File | Purpose |
|---|---|
| `App.tsx` | Main application component |
| `main.tsx` | Application entry point |
| `vite-env.d.ts` | Vite environment types |

## 4. File Creation Order

### Phase 1: Configuration & Types
1. `src/styles/globals.css`
2. `src/types/` (all type files)
3. `src/constants/index.ts`

### Phase 2: API Client
4. `src/lib/utils.ts`
5. `src/lib/axios.ts`
6. `src/lib/queryClient.ts`
7. `src/api/client.ts`
8. `src/api/index.ts`

### Phase 3: Store
9. `src/store/auth.store.ts`
10. `src/store/index.ts`

### Phase 4: UI Components
11. `src/components/ui/` (all UI components)
12. `src/components/common/StatusBadge.tsx`
13. `src/components/common/LoadingSpinner.tsx`
14. `src/components/common/EmptyState.tsx`

### Phase 5: Layouts
15. `src/components/layouts/PublicLayout.tsx`
16. `src/components/layouts/AuthLayout.tsx`
17. `src/components/layouts/DashboardLayout.tsx`
18. `src/components/common/Navbar.tsx`
19. `src/components/common/Sidebar.tsx`
20. `src/components/common/Footer.tsx`
21. `src/components/common/ErrorBoundary.tsx`

### Phase 6: API Files
22. `src/api/auth.ts`
23. `src/api/patients.ts`
24. `src/api/visits.ts`
25. `src/api/medications.ts`
26. `src/api/labs.ts`
27. `src/api/referrals.ts`
28. `src/api/admissions.ts`
29. `src/api/admin.ts`

### Phase 7: Hooks
30. `src/hooks/useAuth.ts`
31. `src/hooks/useAdmin.ts`
32. `src/hooks/usePatients.ts`
33. `src/hooks/useVisits.ts`
34. `src/hooks/useMedications.ts`
35. `src/hooks/useLabs.ts`
36. `src/hooks/useReferrals.ts`
37. `src/hooks/useAdmissions.ts`
38. `src/hooks/usePatientProgress.ts`
39. `src/hooks/index.ts`

### Phase 8: Pages
40. `src/pages/auth/LoginPage.tsx`
41. `src/pages/auth/RegisterPage.tsx`
42. `src/pages/LandingPage.tsx`
43. `src/pages/admin/AdminDashboardPage.tsx`
44. `src/pages/admin/StaffManagementPage.tsx`
45. `src/pages/admin/ReferralManagementPage.tsx`
46. `src/pages/staff/DashboardPage.tsx`
47. `src/pages/staff/PatientListPage.tsx`
48. `src/pages/staff/PatientRegistrationPage.tsx`
49. `src/pages/staff/PatientDetailPage.tsx`
50. `src/pages/staff/PatientSummaryPage.tsx`
51. `src/pages/staff/RecordVisitPage.tsx`
52. `src/pages/staff/OrderMedicationPage.tsx`
53. `src/pages/staff/OrderLabPage.tsx`
54. `src/pages/staff/RequestReferralPage.tsx`
55. `src/pages/staff/RecordAdmissionPage.tsx`
56. `src/pages/NotFoundPage.tsx`

### Phase 9: Feature Components
57. `src/components/admin/` (all admin components)
58. `src/components/patients/` (all patient components)
59. `src/components/visits/` (all visit components)
60. `src/components/medications/` (all medication components)
61. `src/components/labs/` (all lab components)
62. `src/components/referrals/` (all referral components)
63. `src/components/admissions/` (all admission components)

### Phase 10: Routing
64. `src/routes/PublicRoute.tsx`
65. `src/routes/ProtectedRoute.tsx`
66. `src/routes/index.tsx`

### Phase 11: App
67. `src/App.tsx`
68. `src/main.tsx`

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
| Constants | `*.ts` (index) | `index.ts` |
| Styles | `*.css` | `globals.css` |
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

## 8. Route Summary

| Route | Component | Layout | Auth |
|---|---|---|---|
| `/` | `LandingPage` | `PublicLayout` | None |
| `/login` | `LoginPage` | `AuthLayout` | None |
| `/register` | `RegisterPage` | `AuthLayout` | None |
| `/admin` | `AdminDashboardPage` | `DashboardLayout` | Admin |
| `/admin/staff` | `StaffManagementPage` | `DashboardLayout` | Admin |
| `/admin/referrals` | `ReferralManagementPage` | `DashboardLayout` | Admin |
| `/dashboard` | `DashboardPage` | `DashboardLayout` | Staff |
| `/patients` | `PatientListPage` | `DashboardLayout` | Staff |
| `/patients/new` | `PatientRegistrationPage` | `DashboardLayout` | Staff |
| `/patients/:id` | `PatientDetailPage` | `DashboardLayout` | Staff |
| `/patients/:id/summary` | `PatientSummaryPage` | `DashboardLayout` | Staff |
| `/patients/:id/visits` | `RecordVisitPage` | `DashboardLayout` | Staff |
| `/patients/:id/medications` | `OrderMedicationPage` | `DashboardLayout` | Staff |
| `/patients/:id/labs` | `OrderLabPage` | `DashboardLayout` | Staff |
| `/patients/:id/referrals` | `RequestReferralPage` | `DashboardLayout` | Staff |
| `/patients/:id/admissions` | `RecordAdmissionPage` | `DashboardLayout` | Staff |
| `*` | `NotFoundPage` | None | None |
