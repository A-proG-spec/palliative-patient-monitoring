## `docs/folder-structure/backend-structure.md`

---

# Backend Project Structure

## 1.0 Overview

**Technology Stack:**
- Node.js + Express.js
- TypeScript
- MongoDB + Mongoose ODM
- JWT Authentication
- Zod Validation

**Base Directory:** `/backend`

---

## 2.0 Complete Directory Tree

```
backend/
├── scripts/
│   └── seed-admin.ts                      # Admin user seeding script
├── src/
│   ├── config/
│   │   ├── database.ts                    # MongoDB connection
│   │   ├── email.ts                       # Nodemailer configuration
│   │   ├── env.ts                         # Environment variables
│   │   ├── index.ts                       # Config exports
│   │   └── logger.ts                      # Winston logger
│   ├── constants/
│   │   └── index.ts                       # Application constants
│   ├── controllers/
│   │   ├── admin.controller.ts            # Admin endpoints
│   │   ├── admission.controller.ts        # Hospital admission endpoints
│   │   ├── auth.controller.ts             # Authentication endpoints
│   │   ├── index.ts                       # Controller exports
│   │   ├── lab.controller.ts              # Laboratory test endpoints
│   │   ├── medication.controller.ts       # Medication endpoints
│   │   ├── patient.controller.ts          # Patient endpoints
│   │   ├── referral.controller.ts         # Referral endpoints
│   │   ├── staff.controller.ts            # Staff endpoints
│   │   └── visit.controller.ts            # Home visit endpoints
│   ├── middlewares/
│   │   ├── auth.middleware.ts             # JWT authentication
│   │   ├── error.middleware.ts            # Global error handler
│   │   ├── index.ts                       # Middleware exports
│   │   ├── rateLimiter.middleware.ts      # Rate limiting
│   │   ├── role.middleware.ts             # Role-based access control
│   │   └── validate.middleware.ts         # Request validation
│   ├── models/
│   │   ├── Admin.ts                       # Admin model
│   │   ├── Counter.ts                     # Auto-increment counter
│   │   ├── HomeVisit.ts                   # Home visit model
│   │   ├── HospitalAdmission.ts           # Hospital admission model
│   │   ├── index.ts                       # Model exports
│   │   ├── LaboratoryTest.ts              # Lab test model
│   │   ├── Medication.ts                  # Medication model
│   │   ├── Notification.ts                # Notification model
│   │   ├── Patient.ts                     # Patient model
│   │   ├── Referral.ts                    # Referral model
│   │   └── Staff.ts                       # Staff model
│   ├── routes/
│   │   ├── admin.routes.ts                # Admin routes
│   │   ├── admission.routes.ts            # Admission routes
│   │   ├── auth.routes.ts                 # Auth routes
│   │   ├── index.ts                       # Route exports
│   │   ├── lab.routes.ts                  # Lab routes
│   │   ├── medication.routes.ts           # Medication routes
│   │   ├── patient.routes.ts              # Patient routes
│   │   ├── referral.routes.ts             # Referral routes
│   │   ├── staff.routes.ts                # Staff routes
│   │   └── visit.routes.ts                # Visit routes
│   ├── schemas/
│   │   ├── admin.schema.ts                # Admin validation schemas
│   │   ├── admission.schema.ts            # Admission validation schemas
│   │   ├── auth.schema.ts                 # Auth validation schemas
│   │   ├── index.ts                       # Schema exports
│   │   ├── lab.schema.ts                  # Lab validation schemas
│   │   ├── medication.schema.ts           # Medication validation schemas
│   │   ├── patient.schema.ts              # Patient validation schemas
│   │   ├── referral.schema.ts             # Referral validation schemas
│   │   ├── staff.schema.ts                # Staff validation schemas
│   │   └── visit.schema.ts                # Visit validation schemas
│   ├── services/
│   │   ├── admin.service.ts               # Admin business logic
│   │   ├── admission.service.ts           # Admission business logic
│   │   ├── auth.service.ts                # Auth business logic
│   │   ├── lab.service.ts                 # Lab business logic
│   │   ├── medication.service.ts          # Medication business logic
│   │   ├── patient.service.ts             # Patient business logic
│   │   ├── referral.service.ts            # Referral business logic
│   │   ├── staff.service.ts               # Staff business logic
│   │   └── visit.service.ts               # Visit business logic
│   ├── types/
│   │   └── index.ts                       # TypeScript type definitions
│   ├── utils/
│   │   ├── ApiError.ts                    # Custom API error class
│   │   ├── ApiResponse.ts                 # API response formatter
│   │   ├── asyncHandler.ts                # Async route handler
│   │   ├── email.ts                       # Email utilities
│   │   ├── index.ts                       # Utility exports
│   │   ├── jwt.ts                         # JWT utilities
│   │   ├── password.ts                    # Password hashing utilities
│   │   └── token.ts                       # Token generation utilities
│   ├── app.ts                             # Express app configuration
│   └── server.ts                          # Server entry point
├── package-lock.json
├── package.json
└── tsconfig.json
```

---

## 3.0 File Descriptions

### 3.1 Config Files (`src/config/`)

| File | Description |
|------|-------------|
| `database.ts` | MongoDB connection setup with Mongoose |
| `email.ts` | Nodemailer transport configuration |
| `env.ts` | Environment variable validation and loading |
| `index.ts` | Central export of all config modules |
| `logger.ts` | Winston logger configuration |

### 3.2 Constants (`src/constants/`)

| File | Description |
|------|-------------|
| `index.ts` | Application-wide constants (enums, status codes, roles, etc.) |

### 3.3 Controllers (`src/controllers/`)

| File | Description |
|------|-------------|
| `admin.controller.ts` | Admin dashboard, staff approval, referral approval, reports |
| `admission.controller.ts` | CRUD operations for hospital admissions |
| `auth.controller.ts` | Registration, login, email verification, password reset |
| `lab.controller.ts` | CRUD operations for laboratory tests |
| `medication.controller.ts` | CRUD operations for medications |
| `patient.controller.ts` | CRUD operations for patients, summary, progress |
| `referral.controller.ts` | CRUD operations for referrals |
| `staff.controller.ts` | Staff dashboard, profile, activity |
| `visit.controller.ts` | CRUD operations for home visits |

### 3.4 Middlewares (`src/middlewares/`)

| File | Description |
|------|-------------|
| `auth.middleware.ts` | JWT token validation and user extraction |
| `error.middleware.ts` | Global error handling middleware |
| `index.ts` | Central export of all middleware |
| `rateLimiter.middleware.ts` | Rate limiting for API endpoints |
| `role.middleware.ts` | Role-based access control (Admin vs Staff) |
| `validate.middleware.ts` | Zod-based request validation |

### 3.5 Models (`src/models/`)

| File | Description |
|------|-------------|
| `Admin.ts` | Admin schema (name, email, password) |
| `Counter.ts` | Auto-increment counter for patient IDs |
| `HomeVisit.ts` | Home visit schema (21 sections) |
| `HospitalAdmission.ts` | Hospital admission schema |
| `index.ts` | Central export of all models |
| `LaboratoryTest.ts` | Lab test schema |
| `Medication.ts` | Medication schema |
| `Notification.ts` | System notification schema |
| `Patient.ts` | Patient schema |
| `Referral.ts` | Referral schema |
| `Staff.ts` | Staff schema |

### 3.6 Routes (`src/routes/`)

| File | Description |
|------|-------------|
| `admin.routes.ts` | Admin endpoints (dashboard, staff, referrals, reports) |
| `admission.routes.ts` | Admission endpoints (CRUD) |
| `auth.routes.ts` | Auth endpoints (register, login, verify, reset) |
| `index.ts` | Central export of all routes |
| `lab.routes.ts` | Lab endpoints (CRUD) |
| `medication.routes.ts` | Medication endpoints (CRUD) |
| `patient.routes.ts` | Patient endpoints (CRUD, summary, progress) |
| `referral.routes.ts` | Referral endpoints (CRUD) |
| `staff.routes.ts` | Staff endpoints (dashboard, profile) |
| `visit.routes.ts` | Visit endpoints (CRUD) |

### 3.7 Schemas (`src/schemas/`)

| File | Description |
|------|-------------|
| `admin.schema.ts` | Zod schemas for admin requests |
| `admission.schema.ts` | Zod schemas for admission requests |
| `auth.schema.ts` | Zod schemas for auth requests |
| `index.ts` | Central export of all schemas |
| `lab.schema.ts` | Zod schemas for lab requests |
| `medication.schema.ts` | Zod schemas for medication requests |
| `patient.schema.ts` | Zod schemas for patient requests |
| `referral.schema.ts` | Zod schemas for referral requests |
| `staff.schema.ts` | Zod schemas for staff requests |
| `visit.schema.ts` | Zod schemas for visit requests |

### 3.8 Services (`src/services/`)

| File | Description |
|------|-------------|
| `admin.service.ts` | Admin business logic (approvals, reports, stats) |
| `admission.service.ts` | Admission business logic (create, update, discharge) |
| `auth.service.ts` | Auth business logic (register, login, verify) |
| `lab.service.ts` | Lab business logic (create, update result) |
| `medication.service.ts` | Medication business logic (order, update status) |
| `patient.service.ts` | Patient business logic (register, get, summary, progress) |
| `referral.service.ts` | Referral business logic (request, approve, decline) |
| `staff.service.ts` | Staff business logic (dashboard, profile) |
| `visit.service.ts` | Visit business logic (record, get, sign) |

### 3.9 Types (`src/types/`)

| File | Description |
|------|-------------|
| `index.ts` | TypeScript type definitions for all entities |

### 3.10 Utils (`src/utils/`)

| File | Description |
|------|-------------|
| `ApiError.ts` | Custom error class with status codes |
| `ApiResponse.ts` | Standardised API response formatter |
| `asyncHandler.ts` | Wrapper for async route handlers |
| `email.ts` | Email sending utilities (verification, notifications) |
| `index.ts` | Central export of all utilities |
| `jwt.ts` | JWT generation and verification |
| `password.ts` | Bcrypt password hashing and comparison |
| `token.ts` | Token generation (verification, reset) |

---

## 4.0 Module Dependencies

```
┌─────────────────────────────────────────────────────────────────┐
│                         Server.ts                               │
│                     (Entry Point)                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                           App.ts                                │
│              (Express App Configuration)                        │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   Routes      │    │  Middlewares  │    │   Configs     │
│  (Routing)    │    │  (Auth, Role, │    │  (DB, Email,  │
│               │    │   Validation) │    │   Logger)     │
└───────────────┘    └───────────────┘    └───────────────┘
        │                     │
        ▼                     ▼
┌───────────────┐    ┌───────────────┐
│  Controllers  │    │  Schemas      │
│  (Handlers)   │    │  (Validation) │
└───────────────┘    └───────────────┘
        │                     │
        ▼                     ▼
┌───────────────┐    ┌───────────────┐
│   Services    │    │   Utils       │
│  (Business    │    │  (Helpers,    │
│   Logic)      │    │   JWT, Email) │
└───────────────┘    └───────────────┘
        │
        ▼
┌───────────────┐
│    Models     │
│  (Database)   │
└───────────────┘
```

---

## 5.0 File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Controller | `*.controller.ts` | `patient.controller.ts` |
| Model | `*.ts` (PascalCase) | `Patient.ts` |
| Route | `*.routes.ts` | `patient.routes.ts` |
| Schema | `*.schema.ts` | `patient.schema.ts` |
| Service | `*.service.ts` | `patient.service.ts` |
| Middleware | `*.middleware.ts` | `auth.middleware.ts` |
| Utility | `*.ts` (camelCase) | `jwt.ts` |
| Type | `*.types.ts` | `patient.types.ts` |

---

## 6.0 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (development, staging, production) | Yes |
| `PORT` | Server port | Yes |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `JWT_EXPIRY` | JWT expiry time (e.g., "24h") | Yes |
| `EMAIL_HOST` | SMTP host | Yes |
| `EMAIL_PORT` | SMTP port | Yes |
| `EMAIL_USER` | SMTP username | Yes |
| `EMAIL_PASS` | SMTP password | Yes |
| `EMAIL_FROM` | From email address | Yes |
| `FRONTEND_URL` | Frontend URL for email links | Yes |
| `BCRYPT_ROUNDS` | Bcrypt salt rounds (default: 10) | No |

---

## 7.0 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run seed` | Seed database with initial data |
| `npm run seed:admin` | Seed admin user |

---

## 8.0 Version History
=