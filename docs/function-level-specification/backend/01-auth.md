# function-level-specification/backend/01-auth.md


# PALLIATIVE PATIENT MONITORING SYSTEM - BACKEND FUNCTION-LEVEL SPEC: AUTH

## 1. Overview

This document defines the function-level specification for authentication features including registration, login, logout, and user session management.

**Files Covered:**
- `src/schemas/auth.schema.ts`
- `src/services/auth.service.ts`
- `src/controllers/auth.controller.ts`
- `src/routes/auth.routes.ts`

---

## 2. Schema Definitions

### src/schemas/auth.schema.ts

| Schema | Shape |
|---|---|
| registerSchema | `z.object({ body: z.object({ name: z.string().min(2), email: z.string().email(), phone: z.string().min(10), password: z.string().min(8) }) })` |
| loginSchema | `z.object({ body: z.object({ email: z.string().email(), password: z.string().min(8) }) })` |

---

## 3. Service Functions

### src/services/auth.service.ts

#### registerStaff

| Field | Detail |
|---|---|
| Signature | `registerStaff(name: string, email: string, phone: string, password: string): Promise<{ id: string; name: string; email: string; phone: string; status: string; createdAt: Date }>` |
| Purpose | Register a new staff member with pending status |
| Inputs | name, email, phone, password |
| Output | Created staff object (without password) |
| Throws | `ApiError(400, "Email already registered")` |
| Side Effects | Hashes password with bcrypt, creates staff record in database, creates notification for admin |
| Edge Cases | Email already exists -> throws 400 |

#### loginUser

| Field | Detail |
|---|---|
| Signature | `loginUser(email: string, password: string): Promise<{ token: string; user: { id: string; name: string; email: string; phone?: string; role?: string; type: string; status?: string; createdAt?: Date } }>` |
| Purpose | Authenticate user and issue JWT token |
| Inputs | email, password |
| Output | JWT token and user object |
| Throws | `ApiError(401, "Invalid email or password")` |
| Throws | `ApiError(401, "Account pending admin approval")` |
| Throws | `ApiError(401, "Account has been rejected")` |
| Side Effects | None (read-only) |
| Edge Cases | Email not found -> throws 401 with generic message |
| Edge Cases | Password incorrect -> throws 401 with generic message |
| Edge Cases | Staff status is Pending -> throws 401 with specific message |
| Edge Cases | Staff status is Rejected -> throws 401 with specific message |

#### getCurrentUser

| Field | Detail |
|---|---|
| Signature | `getCurrentUser(userId: string): Promise<{ id: string; name: string; email: string; phone?: string; role?: string; type: string; status?: string; createdAt?: Date }>` |
| Purpose | Get current authenticated user |
| Inputs | userId |
| Output | User object |
| Throws | `ApiError(404, "User not found")` |
| Side Effects | Read-only |

#### logoutUser

| Field | Detail |
|---|---|
| Signature | `logoutUser(token: string): Promise<void>` |
| Purpose | Invalidate user session |
| Inputs | token |
| Output | None |
| Throws | None |
| Side Effects | If using token blacklist, adds token to blacklist |
| Edge Cases | Token already expired -> no-op |

---

## 4. Controller Functions

### src/controllers/auth.controller.ts

| Handler | Calls | Response |
|---|---|---|
| register | `authService.registerStaff(req.body.name, req.body.email, req.body.phone, req.body.password)` | 201, `SuccessResponse(201, "Registration successful, pending admin approval", result)` |
| login | `authService.loginUser(req.body.email, req.body.password)` | 200, `SuccessResponse(200, "Login successful", { token, user })` |
| getMe | `authService.getCurrentUser(req.user.id)` | 200, `SuccessResponse(200, "OK", user)` |
| logout | `authService.logoutUser(req.token)` | 200, `SuccessResponse(200, "Logged out successfully", {})` |

---

## 5. Route Definitions

### src/routes/auth.routes.ts

| Method | Path | Middleware Chain | Handler |
|---|---|---|---|
| POST | /register | `validate(registerSchema)` | register |
| POST | /login | `validate(loginSchema)` | login |
| GET | /me | `authMiddleware` | getMe |
| POST | /logout | `authMiddleware` | logout |

Mounted at: `/api/v1/auth`

---

## 6. Implementation Notes

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

## 7. Test File Map

| Source File | Test File | Test Type |
|---|---|---|
| `src/schemas/auth.schema.ts` | `tests/schemas/auth.schema.test.ts` | Unit |
| `src/services/auth.service.ts` | `tests/services/auth.service.test.ts` | Unit |
| `src/controllers/auth.controller.ts` | `tests/controllers/auth.controller.test.ts` | Unit |
| `src/routes/auth.routes.ts` | `tests/routes/auth.routes.test.ts` | Integration |

---

## 8. Test Cases

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

### auth.service.test.ts

#### registerStaff

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Valid registration | Mock email not exists, mock bcrypt.hash | call `registerStaff(name, email, phone, password)` | Resolves with staff object, status Pending |
| Email already exists | Mock email exists | call `registerStaff(name, existingEmail, phone, password)` | Throws ApiError(400, "Email already registered") |

#### loginUser

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Valid staff credentials | Mock staff found, password matches, status Active | call `loginUser(email, password)` | Resolves with token and user object, type staff |
| Valid admin credentials | Mock admin found, password matches | call `loginUser(email, password)` | Resolves with token and user object, type admin |
| Email not found | Mock user not found | call `loginUser(email, password)` | Throws ApiError(401, "Invalid email or password") |
| Wrong password | Mock user found, password mismatches | call `loginUser(email, wrongPassword)` | Throws ApiError(401, "Invalid email or password") |
| Account pending | Mock staff found, status Pending | call `loginUser(email, password)` | Throws ApiError(401, "Account pending admin approval") |
| Account rejected | Mock staff found, status Rejected | call `loginUser(email, password)` | Throws ApiError(401, "Account has been rejected") |

#### getCurrentUser

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| User exists | Mock user found | call `getCurrentUser(userId)` | Resolves with user object |
| User not found | Mock user not found | call `getCurrentUser(userId)` | Throws ApiError(404, "User not found") |

---

## 9. Flow Diagram

```
+-----------------------------------------------------------+
|                    AUTHENTICATION FLOW                      |
+-----------------------------------------------------------+
|                                                           |
|  +-----------------------------------------------------+ |
|  |                    REGISTRATION FLOW                  | |
|  |                                                     | |
|  |  POST /auth/register                                | |
|  |         -> validate(registerSchema)                 | |
|  |         -> authController.register                  | |
|  |         -> authService.registerStaff                | |
|  |         -> Check email exists                       | |
|  |         -> Hash password                            | |
|  |         -> Create staff with status Pending         | |
|  |         -> Create admin notification                | |
|  |         -> Return staff object                      | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    LOGIN FLOW                        | |
|  |                                                     | |
|  |  POST /auth/login                                   | |
|  |         -> validate(loginSchema)                    | |
|  |         -> authController.login                     | |
|  |         -> authService.loginUser                    | |
|  |         -> Find user (staff or admin)              | |
|  |         -> If staff, check status                  | |
|  |         -> Compare password                        | |
|  |         -> Generate JWT token                      | |
|  |         -> Return token and user                   | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    AUTHENTICATED FLOW                | |
|  |                                                     | |
|  |  Request -> authMiddleware                          | |
|  |         -> Extract token from header                | |
|  |         -> Verify token                             | |
|  |         -> Find user (staff or admin)              | |
|  |         -> Attach user to req.user                 | |
|  |         -> Proceed to route handler                | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    GET ME FLOW                       | |
|  |                                                     | |
|  |  GET /auth/me                                       | |
|  |         -> authMiddleware                           | |
|  |         -> authController.getMe                     | |
|  |         -> authService.getCurrentUser(userId)       | |
|  |         -> Return user object                       | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    LOGOUT FLOW                       | |
|  |                                                     | |
|  |  POST /auth/logout                                  | |
|  |         -> authMiddleware                           | |
|  |         -> authController.logout                    | |
|  |         -> authService.logoutUser(token)            | |
|  |         -> (Optional) Add token to blacklist        | |
|  |         -> Return success message                   | |
|  +-----------------------------------------------------+ |
|                                                           |
+-----------------------------------------------------------+
