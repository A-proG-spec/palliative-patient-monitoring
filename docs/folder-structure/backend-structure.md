# folder-structure/backend-structure.md


# PALLIATIVE PATIENT MONITORING SYSTEM - BACKEND FOLDER & FILE STRUCTURE

## 1. Overview

This document defines the complete backend folder structure for the Palliative Patient Monitoring System. The structure follows the MERN stack architecture with TypeScript and Mongoose ODM.

**Technology Stack:**
- Node.js + Express.js
- TypeScript
- MongoDB + Mongoose (ODM)
- JWT Authentication
- Nodemailer (Email Service)
- Zod Validation
- Winston Logger

## 2. Complete Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   ├── env.ts
│   │   └── logger.ts
│   ├── constants/
│   │   └── index.ts
│   ├── controllers/
│   │   ├── admin.controller.ts
│   │   ├── admission.controller.ts
│   │   ├── auth.controller.ts
│   │   ├── lab.controller.ts
│   │   ├── medication.controller.ts
│   │   ├── patient.controller.ts
│   │   ├── referral.controller.ts
│   │   ├── staff.controller.ts
│   │   └── visit.controller.ts
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── rateLimiter.middleware.ts
│   │   ├── role.middleware.ts
│   │   └── validate.middleware.ts
│   ├── models/
│   │   ├── Admin.ts
│   │   ├── Counter.ts
│   │   ├── HospitalAdmission.ts
│   │   ├── LaboratoryTest.ts
│   │   ├── Medication.ts
│   │   ├── Notification.ts
│   │   ├── Patient.ts
│   │   ├── Referral.ts
│   │   ├── Staff.ts
│   │   └── HomeVisit.ts
│   ├── routes/
│   │   ├── admin.routes.ts
│   │   ├── admission.routes.ts
│   │   ├── auth.routes.ts
│   │   ├── lab.routes.ts
│   │   ├── medication.routes.ts
│   │   ├── patient.routes.ts
│   │   ├── referral.routes.ts
│   │   ├── staff.routes.ts
│   │   ├── visit.routes.ts
│   │   └── index.ts
│   ├── schemas/
│   │   ├── admin.schema.ts
│   │   ├── admission.schema.ts
│   │   ├── auth.schema.ts
│   │   ├── lab.schema.ts
│   │   ├── medication.schema.ts
│   │   ├── patient.schema.ts
│   │   ├── referral.schema.ts
│   │   ├── staff.schema.ts
│   │   └── visit.schema.ts
│   ├── services/
│   │   ├── admin.service.ts
│   │   ├── admission.service.ts
│   │   ├── auth.service.ts
│   │   ├── lab.service.ts
│   │   ├── medication.service.ts
│   │   ├── patient.service.ts
│   │   ├── referral.service.ts
│   │   ├── staff.service.ts
│   │   └── visit.service.ts
│   ├── types/
│   │   ├── admin.types.ts
│   │   ├── admission.types.ts
│   │   ├── auth.types.ts
│   │   ├── lab.types.ts
│   │   ├── medication.types.ts
│   │   ├── patient.types.ts
│   │   ├── referral.types.ts
│   │   ├── staff.types.ts
│   │   ├── visit.types.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── ApiError.ts
│   │   ├── ApiResponse.ts
│   │   ├── asyncHandler.ts
│   │   ├── email.ts
│   │   ├── jwt.ts
│   │   ├── password.ts
│   │   └── token.ts
│   ├── app.ts
│   └── server.ts
├── scripts/
│   └── seed-admin.ts
├── tests/
│   ├── controllers/
│   │   ├── admin.controller.test.ts
│   │   ├── admission.controller.test.ts
│   │   ├── auth.controller.test.ts
│   │   ├── lab.controller.test.ts
│   │   ├── medication.controller.test.ts
│   │   ├── patient.controller.test.ts
│   │   ├── referral.controller.test.ts
│   │   ├── staff.controller.test.ts
│   │   └── visit.controller.test.ts
│   ├── services/
│   │   ├── admin.service.test.ts
│   │   ├── admission.service.test.ts
│   │   ├── auth.service.test.ts
│   │   ├── lab.service.test.ts
│   │   ├── medication.service.test.ts
│   │   ├── patient.service.test.ts
│   │   ├── referral.service.test.ts
│   │   ├── staff.service.test.ts
│   │   └── visit.service.test.ts
│   ├── setup.ts
│   └── utils/
│       └── testHelpers.ts
├── .env.example
├── .eslintrc.js
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 3. File Descriptions

### 3.1 Config Files (`src/config/`)

| File | Purpose |
|---|---|
| `database.ts` | MongoDB connection setup using Mongoose |
| `env.ts` | Environment variables validation and loading |
| `logger.ts` | Winston logger configuration |

### 3.2 Constants (`src/constants/`)

| File | Purpose |
|---|---|
| `index.ts` | Application-wide constants (status codes, messages, enums) |

### 3.3 Controllers (`src/controllers/`)

| File | Purpose | Depends On |
|---|---|---|
| `auth.controller.ts` | Handles authentication requests (register, login, verify email, resend verification) | `auth.service.ts` |
| `admin.controller.ts` | Handles admin operations (staff approval, dashboard stats, close case) | `admin.service.ts` |
| `patient.controller.ts` | Handles patient CRUD operations | `patient.service.ts` |
| `visit.controller.ts` | Handles home visit records | `visit.service.ts` |
| `medication.controller.ts` | Handles medication orders | `medication.service.ts` |
| `lab.controller.ts` | Handles laboratory test orders | `lab.service.ts` |
| `referral.controller.ts` | Handles referral requests | `referral.service.ts` |
| `admission.controller.ts` | Handles hospital admissions | `admission.service.ts` |
| `staff.controller.ts` | Handles staff dashboard and profile | `staff.service.ts` |

### 3.4 Middlewares (`src/middlewares/`)

| File | Purpose |
|---|---|
| `auth.middleware.ts` | JWT token verification and user authentication |
| `role.middleware.ts` | Role-based access control (Admin, Staff) |
| `validate.middleware.ts` | Zod schema validation for requests |
| `error.middleware.ts` | Global error handling |
| `rateLimiter.middleware.ts` | Rate limiting for API endpoints |

### 3.5 Models (`src/models/`)

| File | Purpose | Schema Reference |
|---|---|---|
| `Admin.ts` | Admin user model | `IAdmin` |
| `Staff.ts` | Staff member model with email verification fields | `IStaff` |
| `Patient.ts` | Patient model | `IPatient` |
| `Counter.ts` | Auto-increment counter for patient display IDs | `ICounter` |
| `HomeVisit.ts` | Home visit record model | `IHomeVisit` |
| `Medication.ts` | Medication record model | `IMedication` |
| `LaboratoryTest.ts` | Lab test record model | `ILaboratoryTest` |
| `Referral.ts` | Referral record model | `IReferral` |
| `HospitalAdmission.ts` | Admission record model | `IHospitalAdmission` |
| `Notification.ts` | Notification model | `INotification` |

### 3.6 Routes (`src/routes/`)

| File | Mount Path | Auth |
|---|---|---|
| `auth.routes.ts` | `/api/v1/auth` | Public |
| `admin.routes.ts` | `/api/v1/admin` | Admin |
| `patient.routes.ts` | `/api/v1/patients` | Staff |
| `visit.routes.ts` | `/api/v1/patients/:patientId/visits` | Staff |
| `medication.routes.ts` | `/api/v1/patients/:patientId/medications` | Staff |
| `lab.routes.ts` | `/api/v1/patients/:patientId/labs` | Staff |
| `referral.routes.ts` | `/api/v1/patients/:patientId/referrals` | Staff |
| `admission.routes.ts` | `/api/v1/patients/:patientId/admissions` | Staff |
| `staff.routes.ts` | `/api/v1/staff` | Staff |
| `index.ts` | Router registration | - |

### 3.7 Schemas (`src/schemas/`)

| File | Purpose | Zod Schemas |
|---|---|---|
| `auth.schema.ts` | Auth request validation | `registerSchema`, `loginSchema`, `verifyEmailQuerySchema`, `resendVerificationSchema` |
| `admin.schema.ts` | Admin request validation | `approveStaffSchema`, `closeCaseSchema` |
| `patient.schema.ts` | Patient request validation | `createPatientSchema`, `getPatientsQuerySchema` |
| `visit.schema.ts` | Visit request validation | `createVisitSchema` |
| `medication.schema.ts` | Medication request validation | `createMedicationSchema`, `updateMedicationSchema` |
| `lab.schema.ts` | Lab request validation | `createLabSchema`, `updateLabSchema` |
| `referral.schema.ts` | Referral request validation | `createReferralSchema` |
| `admission.schema.ts` | Admission request validation | `createAdmissionSchema`, `updateAdmissionSchema` |
| `staff.schema.ts` | Staff dashboard request validation | `getDashboardStatsSchema`, `getAssignedPatientsQuerySchema` |

### 3.8 Services (`src/services/`)

| File | Purpose | Depends On |
|---|---|---|
| `auth.service.ts` | Authentication business logic (register, login, verify email, resend verification) | `models/Staff`, `models/Admin`, `utils/jwt`, `utils/password`, `utils/token`, `utils/email` |
| `admin.service.ts` | Admin business logic | `models/Staff`, `models/Patient`, `models/Referral`, `models/Notification` |
| `patient.service.ts` | Patient business logic | `models/Patient`, `models/Staff`, `models/Counter` |
| `visit.service.ts` | Visit business logic | `models/HomeVisit`, `models/Patient` |
| `medication.service.ts` | Medication business logic | `models/Medication`, `models/Patient` |
| `lab.service.ts` | Lab business logic | `models/LaboratoryTest`, `models/Patient` |
| `referral.service.ts` | Referral business logic | `models/Referral`, `models/Patient`, `models/Notification` |
| `admission.service.ts` | Admission business logic | `models/HospitalAdmission`, `models/Patient`, `models/Referral` |
| `staff.service.ts` | Staff dashboard and profile logic | `models/Staff`, `models/HomeVisit`, `models/Patient`, `models/Referral` |

### 3.9 Types (`src/types/`)

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
| `staff.types.ts` | Staff types |
| `index.ts` | All types exported |

### 3.10 Utils (`src/utils/`)

| File | Purpose |
|---|---|
| `ApiError.ts` | Custom error class |
| `ApiResponse.ts` | Standard API response formatter |
| `asyncHandler.ts` | Async request handler wrapper |
| `email.ts` | Email service (verification emails using Nodemailer) |
| `jwt.ts` | JWT token generation and verification |
| `password.ts` | Password hashing and comparison |
| `token.ts` | Verification token generation |

### 3.11 Scripts (`scripts/`)

| File | Purpose |
|---|---|
| `seed-admin.ts` | Admin user seed script (Mongoose-based) |

### 3.12 Root Files

| File | Purpose |
|---|---|
| `app.ts` | Express app configuration |
| `server.ts` | Server startup and initialization |
| `.env.example` | Environment variables template |
| `package.json` | Project dependencies and scripts |
| `tsconfig.json` | TypeScript configuration |
| `README.md` | Project documentation |

## 4. File Creation Order

### Phase 1: Configuration
1. `.env.example`
2. `src/config/env.ts`
3. `src/config/database.ts`
4. `src/config/logger.ts`

### Phase 2: Utils & Types
5. `src/types/` (all type files)
6. `src/utils/ApiError.ts`
7. `src/utils/ApiResponse.ts`
8. `src/utils/asyncHandler.ts`
9. `src/utils/jwt.ts`
10. `src/utils/password.ts`
11. `src/utils/token.ts`
12. `src/utils/email.ts`

### Phase 3: Models
13. `src/models/Counter.ts`
14. `src/models/Admin.ts`
15. `src/models/Staff.ts`
16. `src/models/Patient.ts`
17. `src/models/HomeVisit.ts`
18. `src/models/Medication.ts`
19. `src/models/LaboratoryTest.ts`
20. `src/models/Referral.ts`
21. `src/models/HospitalAdmission.ts`
22. `src/models/Notification.ts`

### Phase 4: Services
23. `src/services/auth.service.ts`
24. `src/services/admin.service.ts`
25. `src/services/patient.service.ts`
26. `src/services/visit.service.ts`
27. `src/services/medication.service.ts`
28. `src/services/lab.service.ts`
29. `src/services/referral.service.ts`
30. `src/services/admission.service.ts`
31. `src/services/staff.service.ts`

### Phase 5: Schemas
32. `src/schemas/auth.schema.ts`
33. `src/schemas/admin.schema.ts`
34. `src/schemas/patient.schema.ts`
35. `src/schemas/visit.schema.ts`
36. `src/schemas/medication.schema.ts`
37. `src/schemas/lab.schema.ts`
38. `src/schemas/referral.schema.ts`
39. `src/schemas/admission.schema.ts`
40. `src/schemas/staff.schema.ts`

### Phase 6: Middlewares
41. `src/middlewares/auth.middleware.ts`
42. `src/middlewares/role.middleware.ts`
43. `src/middlewares/validate.middleware.ts`
44. `src/middlewares/error.middleware.ts`
45. `src/middlewares/rateLimiter.middleware.ts`

### Phase 7: Controllers
46. `src/controllers/auth.controller.ts`
47. `src/controllers/admin.controller.ts`
48. `src/controllers/patient.controller.ts`
49. `src/controllers/visit.controller.ts`
50. `src/controllers/medication.controller.ts`
51. `src/controllers/lab.controller.ts`
52. `src/controllers/referral.controller.ts`
53. `src/controllers/admission.controller.ts`
54. `src/controllers/staff.controller.ts`

### Phase 8: Routes
55. `src/routes/auth.routes.ts`
56. `src/routes/admin.routes.ts`
57. `src/routes/patient.routes.ts`
58. `src/routes/visit.routes.ts`
59. `src/routes/medication.routes.ts`
60. `src/routes/lab.routes.ts`
61. `src/routes/referral.routes.ts`
62. `src/routes/admission.routes.ts`
63. `src/routes/staff.routes.ts`
64. `src/routes/index.ts`

### Phase 9: App & Server
65. `src/constants/index.ts`
66. `src/app.ts`
67. `src/server.ts`

### Phase 10: Seed Script
68. `scripts/seed-admin.ts`

## 5. Import Path Aliases

Configure `tsconfig.json` with these path aliases:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@config/*": ["src/config/*"],
      "@controllers/*": ["src/controllers/*"],
      "@models/*": ["src/models/*"],
      "@routes/*": ["src/routes/*"],
      "@schemas/*": ["src/schemas/*"],
      "@services/*": ["src/services/*"],
      "@types/*": ["src/types/*"],
      "@utils/*": ["src/utils/*"],
      "@constants/*": ["src/constants/*"],
      "@middlewares/*": ["src/middlewares/*"]
    }
  }
}
```

## 6. Naming Conventions

| File Type | Naming Convention | Example |
|---|---|---|
| Controllers | `*.controller.ts` | `auth.controller.ts` |
| Services | `*.service.ts` | `auth.service.ts` |
| Models | `*.ts` (PascalCase) | `Staff.ts` |
| Routes | `*.routes.ts` | `auth.routes.ts` |
| Schemas | `*.schema.ts` | `auth.schema.ts` |
| Types | `*.types.ts` | `auth.types.ts` |
| Middlewares | `*.middleware.ts` | `auth.middleware.ts` |
| Tests | `*.test.ts` | `auth.service.test.ts` |

## 7. Environment Variables

```env
# .env.example

# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/palliative-care

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Password
BCRYPT_SALT_ROUNDS=10

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com
VERIFICATION_TOKEN_EXPIRY=86400

# Admin Seed (for first-time setup)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=adminpassword
ADMIN_NAME=Admin User
