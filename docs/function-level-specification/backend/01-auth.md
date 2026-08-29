# function-level-specification/backend/01-auth.md


# PALLIATIVE PATIENT MONITORING SYSTEM - BACKEND FUNCTION-LEVEL SPEC: AUTH

## 1. Overview

This document defines the function-level specification for authentication features including registration, email verification, login, logout, and user session management.

**Files Covered:**
- `src/schemas/auth.schema.ts`
- `src/services/auth.service.ts`
- `src/controllers/auth.controller.ts`
- `src/routes/auth.routes.ts`
- `src/utils/email.ts`
- `src/utils/token.ts`

---

## 2. Schema Definitions

### src/schemas/auth.schema.ts

| Schema | Shape |
|---|---|
| registerSchema | `z.object({ body: z.object({ name: z.string().min(2), email: z.string().email(), phone: z.string().min(10), password: z.string().min(8) }) })` |
| loginSchema | `z.object({ body: z.object({ email: z.string().email(), password: z.string().min(8) }) })` |
| verifyEmailQuerySchema | `z.object({ query: z.object({ token: z.string().min(1) }) })` |
| resendVerificationSchema | `z.object({ body: z.object({ email: z.string().email() }) })` |

---

## 3. Utility Functions

### src/utils/token.ts

#### generateVerificationToken

| Field | Detail |
|---|---|
| Signature | `generateVerificationToken(): string` |
| Purpose | Generate a random token for email verification |
| Output | Random string token |
| Side Effects | None |

#### generateJWT

| Field | Detail |
|---|---|
| Signature | `generateJWT(userId: string, email: string): string` |
| Purpose | Generate JWT access token for authenticated users |
| Inputs | userId, email |
| Output | JWT token string |
| Side Effects | None |

### src/utils/email.ts

#### sendVerificationEmail

| Field | Detail |
|---|---|
| Signature | `sendVerificationEmail(email: string, name: string, token: string): Promise<void>` |
| Purpose | Send verification email to staff member |
| Inputs | email, name, token |
| Output | None |
| Throws | Error if email sending fails |
| Side Effects | Sends email via SMTP |

**Email Template:**

```
Subject: Verify Your Email - Palliative Care System

Dear {name},

Welcome to the Palliative Patient Monitoring System!

Please click the link below to verify your email address:

{VERIFICATION_URL}/verify-email?token={token}

This link will expire in 24 hours.

If you did not register for this account, please ignore this email.

Best regards,
Palliative Care System Team
```

---

## 4. Service Functions

### src/services/auth.service.ts

#### registerStaff

| Field | Detail |
|---|---|
| Signature | `registerStaff(name: string, email: string, phone: string, password: string): Promise<{ id: string; name: string; email: string; phone: string; status: string; isEmailVerified: boolean; createdAt: Date }>` |
| Purpose | Register a new staff member with pending status |
| Inputs | name, email, phone, password |
| Output | Created staff object (without password) |
| Throws | `ApiError(400, "Email already registered")` |
| Side Effects | Hashes password with bcrypt, creates staff record in database, generates verification token, sends verification email |
| Edge Cases | Email already exists -> throws 400 |

**Implementation Details:**
1. Check if email already exists
2. Hash password
3. Generate verification token
4. Create staff record with `status: "Pending"`, `isEmailVerified: false`, `emailVerificationToken`, `emailVerificationTokenExpires: 24 hours from now`
5. Send verification email
6. Return staff object (without password)

---

#### verifyEmail

| Field | Detail |
|---|---|
| Signature | `verifyEmail(token: string): Promise<{ email: string; isEmailVerified: boolean }>` |
| Purpose | Verify staff email address using token |
| Inputs | token |
| Output | Email and verification status |
| Throws | `ApiError(400, "Invalid verification link")` |
| Throws | `ApiError(400, "Verification link has expired. Please request a new one.")` |
| Throws | `ApiError(404, "User not found")` |
| Side Effects | Updates staff isEmailVerified to true, clears verification token |

**Implementation Details:**
1. Find staff by verification token
2. Check if token exists
3. Check if token is expired
4. Check if email already verified
5. Update `isEmailVerified: true`, clear `emailVerificationToken` and `emailVerificationTokenExpires`
6. Return email and verification status

---

#### resendVerificationEmail

| Field | Detail |
|---|---|
| Signature | `resendVerificationEmail(email: string): Promise<{ email: string }>` |
| Purpose | Resend verification email to staff member |
| Inputs | email |
| Output | Email address |
| Throws | `ApiError(404, "No account found with this email")` |
| Throws | `ApiError(400, "Email already verified. Please login.")` |
| Throws | `ApiError(429, "Please wait before requesting another email")` |
| Side Effects | Generates new verification token, sends new verification email |

**Implementation Details:**
1. Find staff by email
2. Check if staff exists
3. Check if email already verified
4. Check rate limiting (e.g., 5 minutes between requests)
5. Generate new verification token
6. Update staff with new token and expiration
7. Send verification email
8. Return email address

---

#### loginUser

| Field | Detail |
|---|---|
| Signature | `loginUser(email: string, password: string): Promise<{ token: string; user: { id: string; name: string; email: string; phone?: string; role?: string; type: string; status?: string; isEmailVerified?: boolean; createdAt?: Date } }>` |
| Purpose | Authenticate user and issue JWT token |
| Inputs | email, password |
| Output | JWT token and user object |
| Throws | `ApiError(401, "Invalid email or password")` |
| Throws | `ApiError(401, "Please verify your email before logging in")` |
| Throws | `ApiError(401, "Account pending admin approval")` |
| Throws | `ApiError(401, "Account has been rejected")` |
| Side Effects | None (read-only) |

**Implementation Details:**
1. Find user (staff or admin) by email
2. If staff:
   a. Check if email is verified (`isEmailVerified === true`)
   b. Check if status is "Active"
   c. Check if status is "Pending" -> throw specific error
   d. Check if status is "Rejected" -> throw specific error
3. If admin:
   a. No email verification or status checks needed
4. Compare password
5. Generate JWT token
6. Return token and user object

---

#### getCurrentUser

| Field | Detail |
|---|---|
| Signature | `getCurrentUser(userId: string): Promise<{ id: string; name: string; email: string; phone?: string; role?: string; type: string; status?: string; isEmailVerified?: boolean; createdAt?: Date }>` |
| Purpose | Get current authenticated user |
| Inputs | userId |
| Output | User object |
| Throws | `ApiError(404, "User not found")` |
| Side Effects | Read-only |

---

#### logoutUser

| Field | Detail |
|---|---|
| Signature | `logoutUser(token: string): Promise<void>` |
| Purpose | Invalidate user session |
| Inputs | token |
| Output | None |
| Throws | None |
| Side Effects | None (stateless JWT) |

---

## 5. Controller Functions

### src/controllers/auth.controller.ts

| Handler | Calls | Response |
|---|---|---|
| register | `authService.registerStaff(req.body.name, req.body.email, req.body.phone, req.body.password)` | 201, `SuccessResponse(201, "Registration successful. Please check your email to verify your account.", result)` |
| verifyEmail | `authService.verifyEmail(req.query.token)` | 200, `SuccessResponse(200, "Email verified successfully. Please wait for admin approval.", result)` |
| resendVerification | `authService.resendVerificationEmail(req.body.email)` | 200, `SuccessResponse(200, "Verification email sent. Please check your inbox.", result)` |
| login | `authService.loginUser(req.body.email, req.body.password)` | 200, `SuccessResponse(200, "Login successful", { token, user })` |
| getMe | `authService.getCurrentUser(req.user.id)` | 200, `SuccessResponse(200, "OK", user)` |
| logout | `authService.logoutUser(req.token)` | 200, `SuccessResponse(200, "Logged out successfully", {})` |

---

## 6. Route Definitions

### src/routes/auth.routes.ts

| Method | Path | Middleware Chain | Handler |
|---|---|---|---|
| POST | /register | `validate(registerSchema)` | register |
| GET | /verify-email | `validate(verifyEmailQuerySchema)` | verifyEmail |
| POST | /resend-verification | `validate(resendVerificationSchema)` | resendVerification |
| POST | /login | `validate(loginSchema)` | login |
| GET | /me | `authMiddleware` | getMe |
| POST | /logout | `authMiddleware` | logout |

Mounted at: `/api/v1/auth`

---

## 7. Implementation Notes

### Password Hashing

```typescript
// src/utils/password.ts

import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
```

### JWT Functions

```typescript
// src/utils/jwt.ts

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

export const generateToken = (userId: string, email: string): string => {
  return jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

export const verifyToken = (token: string): { id: string; email: string } => {
  return jwt.verify(token, JWT_SECRET) as { id: string; email: string };
};
```

### Verification Token Generation

```typescript
// src/utils/token.ts

import crypto from 'crypto';

export const generateVerificationToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};
```

### Auth Middleware

```typescript
// src/middlewares/auth.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@/utils/jwt';
import { Staff } from '@/models/Staff';
import { Admin } from '@/models/Admin';
import { ApiError } from '@/utils/ApiError';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new ApiError(401, 'Unauthorized');
    }

    const decoded = verifyToken(token);

    // Try to find user as staff
    let user = await Staff.findById(decoded.id).select('-password');

    if (user) {
      req.user = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        type: 'staff',
        status: user.status,
        isEmailVerified: user.isEmailVerified,
      };
      return next();
    }

    // Try to find user as admin
    let admin = await Admin.findById(decoded.id).select('-password');

    if (admin) {
      req.user = {
        id: admin._id.toString(),
        name: admin.name,
        email: admin.email,
        type: 'admin',
      };
      return next();
    }

    throw new ApiError(401, 'Unauthorized');
  } catch (error) {
    next(error);
  }
};
```

### Type Extensions

```typescript
// src/types/express.d.ts

import { User } from './index';

declare global {
  namespace Express {
    interface Request {
      user: User;
      token: string;
    }
  }
}
```

---

## 8. Test File Map

| Source File | Test File | Test Type |
|---|---|---|
| `src/schemas/auth.schema.ts` | `tests/schemas/auth.schema.test.ts` | Unit |
| `src/services/auth.service.ts` | `tests/services/auth.service.test.ts` | Unit |
| `src/controllers/auth.controller.ts` | `tests/controllers/auth.controller.test.ts` | Unit |
| `src/routes/auth.routes.ts` | `tests/routes/auth.routes.test.ts` | Integration |
| `src/utils/email.ts` | `tests/utils/email.test.ts` | Unit |
| `src/utils/token.ts` | `tests/utils/token.test.ts` | Unit |

---

## 9. Test Cases

### auth.schema.test.ts

| Case | Action | Expected Result |
|---|---|---|
| registerSchema rejects invalid email | parse `{ body: { email: "not-an-email", password: "password", name: "John", phone: "+251911111111" } }` | Validation fails |
| registerSchema rejects short password | parse `{ body: { email: "john@example.com", password: "short", name: "John", phone: "+251911111111" } }` | Validation fails |
| registerSchema rejects short name | parse `{ body: { email: "john@example.com", password: "validpassword", name: "J", phone: "+251911111111" } }` | Validation fails |
| registerSchema accepts valid data | parse `{ body: { email: "john@example.com", password: "validpassword", name: "John Doe", phone: "+251911111111" } }` | Passes |
| loginSchema rejects invalid email | parse `{ body: { email: "not-an-email", password: "password" } }` | Validation fails |
| loginSchema rejects short password | parse `{ body: { email: "john@example.com", password: "short" } }` | Validation fails |
| loginSchema accepts valid data | parse `{ body: { email: "john@example.com", password: "validpassword" } }` | Passes |
| verifyEmailQuerySchema requires token | parse `{ query: {} }` | Validation fails |
| verifyEmailQuerySchema accepts token | parse `{ query: { token: "abc123" } }` | Passes |
| resendVerificationSchema requires email | parse `{ body: {} }` | Validation fails |
| resendVerificationSchema accepts valid email | parse `{ body: { email: "john@example.com" } }` | Passes |

### auth.service.test.ts

#### registerStaff

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Valid registration | Mock email not exists, mock bcrypt.hash, mock sendVerificationEmail | call `registerStaff(name, email, phone, password)` | Resolves with staff object, status Pending, isEmailVerified false, verification email sent |
| Email already exists | Mock email exists | call `registerStaff(name, existingEmail, phone, password)` | Throws ApiError(400, "Email already registered") |

#### verifyEmail

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Valid token | Mock staff found with valid token, not expired | call `verifyEmail(token)` | Resolves with email, isEmailVerified true |
| Invalid token | Mock staff not found | call `verifyEmail(token)` | Throws ApiError(400, "Invalid verification link") |
| Expired token | Mock staff found with expired token | call `verifyEmail(token)` | Throws ApiError(400, "Verification link has expired. Please request a new one.") |
| Already verified | Mock staff found with isEmailVerified true | call `verifyEmail(token)` | Resolves with email, isEmailVerified true |

#### resendVerificationEmail

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Valid email not verified | Mock staff found, not verified | call `resendVerificationEmail(email)` | Resolves with email, new token generated, email sent |
| Email not found | Mock staff not found | call `resendVerificationEmail(email)` | Throws ApiError(404, "No account found with this email") |
| Already verified | Mock staff found, isEmailVerified true | call `resendVerificationEmail(email)` | Throws ApiError(400, "Email already verified. Please login.") |

#### loginUser

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Valid staff credentials (email verified & active) | Mock staff found, password matches, isEmailVerified true, status Active | call `loginUser(email, password)` | Resolves with token and user object, type staff |
| Valid admin credentials | Mock admin found, password matches | call `loginUser(email, password)` | Resolves with token and user object, type admin |
| Email not found | Mock user not found | call `loginUser(email, password)` | Throws ApiError(401, "Invalid email or password") |
| Wrong password | Mock user found, password mismatches | call `loginUser(email, wrongPassword)` | Throws ApiError(401, "Invalid email or password") |
| Email not verified | Mock staff found, isEmailVerified false | call `loginUser(email, password)` | Throws ApiError(401, "Please verify your email before logging in") |
| Account pending | Mock staff found, status Pending | call `loginUser(email, password)` | Throws ApiError(401, "Account pending admin approval") |
| Account rejected | Mock staff found, status Rejected | call `loginUser(email, password)` | Throws ApiError(401, "Account has been rejected") |

### email.test.ts

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Email sent successfully | Mock nodemailer transporter | call `sendVerificationEmail(email, name, token)` | Resolves without error |
| Email fails | Mock nodemailer rejects | call `sendVerificationEmail(email, name, token)` | Throws error |

---

## 10. Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW (BACKEND)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    REGISTRATION FLOW                                 │  │
│  │                                                                      │  │
│  │  POST /auth/register                                                │  │
│  │         -> validate(registerSchema)                                 │  │
│  │         -> authController.register                                  │  │
│  │         -> authService.registerStaff                                │  │
│  │         -> Check email exists                                       │  │
│  │         -> Hash password                                            │  │
│  │         -> Generate verification token                              │  │
│  │         -> Create staff with status Pending, isEmailVerified false  │  │
│  │         -> Send verification email                                  │  │
│  │         -> Return staff object                                      │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    ▼                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    EMAIL VERIFICATION FLOW                           │  │
│  │                                                                      │  │
│  │  GET /auth/verify-email?token=xxx                                   │  │
│  │         -> validate(verifyEmailQuerySchema)                         │  │
│  │         -> authController.verifyEmail                               │  │
│  │         -> authService.verifyEmail                                  │  │
│  │         -> Find staff by token                                      │  │
│  │         -> Check token not expired                                  │  │
│  │         -> Update isEmailVerified = true                            │  │
│  │         -> Clear verification token                                 │  │
│  │         -> Return success message                                   │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    ▼                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    LOGIN FLOW                                        │  │
│  │                                                                      │  │
│  │  POST /auth/login                                                   │  │
│  │         -> validate(loginSchema)                                    │  │
│  │         -> authController.login                                     │  │
│  │         -> authService.loginUser                                    │  │
│  │         -> Find user (staff or admin)                               │  │
│  │         -> If staff, check isEmailVerified                         │  │
│  │         -> If staff, check status                                   │  │
│  │         -> Compare password                                         │  │
│  │         -> Generate JWT token                                       │  │
│  │         -> Return token and user                                    │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    ▼                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    AUTHENTICATED FLOW                                │  │
│  │                                                                      │  │
│  │  Request -> authMiddleware                                          │  │
│  │         -> Extract token from header                                │  │
│  │         -> Verify token                                             │  │
│  │         -> Find user (staff or admin)                               │  │
│  │         -> Attach user to req.user                                  │  │
│  │         -> Proceed to route handler                                 │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    ▼                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    RESEND VERIFICATION FLOW                          │  │
│  │                                                                      │  │
│  │  POST /auth/resend-verification                                     │  │
│  │         -> validate(resendVerificationSchema)                       │  │
│  │         -> authController.resendVerification                        │  │
│  │         -> authService.resendVerificationEmail                      │  │
│  │         -> Find staff by email                                      │  │
│  │         -> Check not already verified                               │  │
│  │         -> Generate new verification token                          │  │
│  │         -> Send verification email                                  │  │
│  │         -> Return success message                                   │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```