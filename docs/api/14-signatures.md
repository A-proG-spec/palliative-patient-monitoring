# api/14-signatures.md


# PALLIATIVE PATIENT MONITORING SYSTEM - DIGITAL SIGNATURE API SPECIFICATION

## 1. Overview

This document defines the API endpoints for digital signature functionality used during home visit recording. Team members (Physicians and Nurses) can verify their identity by entering their email and password to "sign" a visit record, confirming their participation and approval of the clinical documentation.

**Base Path:** `/api/v1`

**Auth:** All endpoints require authentication (Bearer JWT with staff role)

---

## 2. Endpoint Table

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /visits/:visitId/sign | Staff | Sign a visit as a team member |
| GET | /visits/:visitId/signatures | Staff | Get all signatures for a visit |
| DELETE | /visits/:visitId/signatures/:signatureId | Admin | Remove a signature (admin only) |

---

## 3. Endpoint Details

### POST /visits/:visitId/sign

**Purpose:** Sign a visit as a team member (Physician or Nurse) by verifying credentials

**Auth:** Staff (any staff member can sign)

**URL Parameters:**

| Param | Type | Description |
|---|---|---|
| visitId | string | Visit ID (MongoDB ObjectId) |

**Request Body:**

```json
{
  "email": "jane@example.com",
  "password": "securepassword123",
  "role": "Nurse"
}
```

**Validation Rules:**

| Field | Rule |
|---|---|
| email | Required, valid email format, must match staff record |
| password | Required, must match staff password |
| role | Required, must be "TeamLeader", "Physician", or "Nurse" |

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Signature added successfully",
  "data": {
    "id": "507f1f77bcf86cd799439030",
    "visitId": "507f1f77bcf86cd799439013",
    "staffId": "507f1f77bcf86cd799439008",
    "staffName": "Jane Doe",
    "role": "Nurse",
    "signedAt": "2026-09-01T10:30:00Z",
    "ipAddress": "192.168.1.100"
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 404 | Visit not found | "Visit not found" |
| 401 | Invalid credentials | "Invalid email or password" |
| 403 | Role mismatch | "You are not authorized to sign as this role" |
| 403 | Account not active | "Your account is not active" |
| 400 | Already signed | "You have already signed this visit" |
| 400 | Visit already finalized | "This visit has been finalized and cannot be signed" |

**Error Response Example (Invalid Credentials):**

```json
{
  "statusCode": 401,
  "success": false,
  "message": "Invalid email or password",
  "errors": []
}
```

**Error Response Example (Role Mismatch):**

```json
{
  "statusCode": 403,
  "success": false,
  "message": "You are not authorized to sign as this role",
  "errors": [
    {
      "field": "role",
      "message": "User is a Nurse, cannot sign as Physician"
    }
  ]
}
```

**Error Response Example (Already Signed):**

```json
{
  "statusCode": 400,
  "success": false,
  "message": "You have already signed this visit",
  "errors": []
}
```

---

### GET /visits/:visitId/signatures

**Purpose:** Get all signatures for a visit

**Auth:** Staff, Admin

**URL Parameters:**

| Param | Type | Description |
|---|---|---|
| visitId | string | Visit ID (MongoDB ObjectId) |

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "OK",
  "data": {
    "visitId": "507f1f77bcf86cd799439013",
    "visitDate": "2026-08-29T08:00:00Z",
    "teamLeader": {
      "staffId": "507f1f77bcf86cd799439010",
      "staffName": "Dr. Smith",
      "role": "TeamLeader",
      "signedAt": "2026-08-29T10:30:00Z",
      "autoSigned": true,
      "ipAddress": "192.168.1.50"
    },
    "physician": {
      "staffId": "507f1f77bcf86cd799439009",
      "staffName": "Dr. Kebede",
      "role": "Physician",
      "signedAt": "2026-08-29T10:35:00Z",
      "autoSigned": false,
      "ipAddress": "192.168.1.75"
    },
    "nurse": {
      "staffId": "507f1f77bcf86cd799439008",
      "staffName": "Jane Doe",
      "role": "Nurse",
      "signedAt": "2026-08-29T10:40:00Z",
      "autoSigned": false,
      "ipAddress": "192.168.1.100"
    },
    "allSigned": true,
    "totalSignatures": 3
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 404 | Visit not found | "Visit not found" |
| 401 | Missing or invalid token | "Unauthorized" |

---

### DELETE /visits/:visitId/signatures/:signatureId (Admin Only)

**Purpose:** Remove a signature from a visit (admin only)

**Auth:** Admin

**URL Parameters:**

| Param | Type | Description |
|---|---|---|
| visitId | string | Visit ID (MongoDB ObjectId) |
| signatureId | string | Signature ID (MongoDB ObjectId) |

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Signature removed successfully",
  "data": {
    "id": "507f1f77bcf86cd799439030",
    "removedAt": "2026-09-01T11:00:00Z",
    "removedBy": {
      "id": "507f1f77bcf86cd799439001",
      "name": "Admin User"
    }
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 404 | Signature not found | "Signature not found" |
| 404 | Visit not found | "Visit not found" |
| 403 | Non-admin user | "Only admin can remove signatures" |

---

## 4. Type Definitions

```typescript
// src/types/signature.types.ts

export interface Signature {
  id: string;
  visitId: string;
  staffId: string;
  staffName: string;
  role: 'TeamLeader' | 'Physician' | 'Nurse';
  signedAt: string;
  autoSigned: boolean;
  ipAddress?: string;
  userAgent?: string;
}

export interface SignVisitRequest {
  email: string;
  password: string;
  role: 'TeamLeader' | 'Physician' | 'Nurse';
}

export interface SignVisitResponse {
  id: string;
  visitId: string;
  staffId: string;
  staffName: string;
  role: string;
  signedAt: string;
  ipAddress?: string;
}

export interface VisitSignaturesResponse {
  visitId: string;
  visitDate: string;
  teamLeader: Signature | null;
  physician: Signature | null;
  nurse: Signature | null;
  allSigned: boolean;
  totalSignatures: number;
}

export interface SignatureRemovalResponse {
  id: string;
  removedAt: string;
  removedBy: {
    id: string;
    name: string;
  };
}

// ============================================
// DATABASE SCHEMA TYPES
// ============================================

export interface ISignature {
  visitId: mongoose.Types.ObjectId;
  staffId: mongoose.Types.ObjectId;
  staffName: string;
  role: 'TeamLeader' | 'Physician' | 'Nurse';
  signedAt: Date;
  autoSigned: boolean;
  ipAddress?: string;
  userAgent?: string;
}
```

---

## 5. Validation Schemas

```typescript
// src/schemas/signature.schema.ts

import { z } from 'zod';

export const signVisitSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
    role: z.enum(['TeamLeader', 'Physician', 'Nurse'], {
      message: 'Invalid role. Must be TeamLeader, Physician, or Nurse',
    }),
  }),
});

export const getSignaturesParamsSchema = z.object({
  params: z.object({
    visitId: z.string().min(1, 'Visit ID is required'),
  }),
});

export const removeSignatureParamsSchema = z.object({
  params: z.object({
    visitId: z.string().min(1, 'Visit ID is required'),
    signatureId: z.string().min(1, 'Signature ID is required'),
  }),
});

export type SignVisitSchema = z.infer<typeof signVisitSchema>;
export type GetSignaturesParamsSchema = z.infer<typeof getSignaturesParamsSchema>;
export type RemoveSignatureParamsSchema = z.infer<typeof removeSignatureParamsSchema>;
```

---

## 6. Service Functions

### src/services/signature.service.ts

#### signVisit

| Field | Detail |
|---|---|
| Signature | `signVisit(visitId: string, email: string, password: string, role: string, ipAddress?: string): Promise<SignVisitResponse>` |
| Purpose | Sign a visit as a team member using email + password verification |
| Inputs | visitId, email, password, role, ipAddress (optional) |
| Output | Signature response |
| Throws | `ApiError(404, "Visit not found")` |
| Throws | `ApiError(401, "Invalid email or password")` |
| Throws | `ApiError(403, "You are not authorized to sign as this role")` |
| Throws | `ApiError(403, "Your account is not active")` |
| Throws | `ApiError(400, "You have already signed this visit")` |
| Throws | `ApiError(400, "This visit has been finalized and cannot be signed")` |
| Side Effects | Creates signature record |

**Implementation Details:**

1. Find visit by ID
2. Verify visit exists and is not finalized
3. Find staff by email
4. Verify password matches
5. Verify staff status is "Active"
6. Verify staff role matches requested role (or is allowed to sign as that role)
7. Check if staff has already signed this visit
8. Create signature record with staff ID, name, role, timestamp, IP
9. Return signature response

---

#### getVisitSignatures

| Field | Detail |
|---|---|
| Signature | `getVisitSignatures(visitId: string): Promise<VisitSignaturesResponse>` |
| Purpose | Get all signatures for a visit |
| Inputs | visitId |
| Output | Visit signatures response |
| Throws | `ApiError(404, "Visit not found")` |
| Side Effects | Read-only |

---

#### removeSignature (Admin Only)

| Field | Detail |
|---|---|
| Signature | `removeSignature(visitId: string, signatureId: string, adminId: string): Promise<SignatureRemovalResponse>` |
| Purpose | Remove a signature from a visit (admin only) |
| Inputs | visitId, signatureId, adminId |
| Output | Signature removal response |
| Throws | `ApiError(404, "Visit not found")` |
| Throws | `ApiError(404, "Signature not found")` |
| Throws | `ApiError(403, "Only admin can remove signatures")` |
| Side Effects | Deletes signature record, logs removal in audit trail |

---

## 7. Controller Functions

### src/controllers/signature.controller.ts

| Handler | Calls | Response |
|---|---|---|
| signVisit | `signatureService.signVisit(req.params.visitId, req.body.email, req.body.password, req.body.role, req.ip)` | 200, `SuccessResponse(200, "Signature added successfully", result)` |
| getVisitSignatures | `signatureService.getVisitSignatures(req.params.visitId)` | 200, `SuccessResponse(200, "OK", result)` |
| removeSignature | `signatureService.removeSignature(req.params.visitId, req.params.signatureId, req.user.id)` | 200, `SuccessResponse(200, "Signature removed successfully", result)` |

---

## 8. Route Definitions

### src/routes/signature.routes.ts

| Method | Path | Middleware Chain | Handler |
|---|---|---|---|
| POST | /visits/:visitId/sign | `authMiddleware, validate(signVisitSchema)` | signVisit |
| GET | /visits/:visitId/signatures | `authMiddleware` | getVisitSignatures |
| DELETE | /visits/:visitId/signatures/:signatureId | `authMiddleware, roleMiddleware(['admin']), validate(removeSignatureParamsSchema)` | removeSignature |

Mounted at: `/api/v1`

---

## 9. Signature Verification Logic

### Role Verification

```typescript
// src/services/signature.service.ts (internal function)

const verifyRoleMatches = (staffRole: string | null, requestedRole: string): boolean => {
  // Team Leader can sign as Team Leader, Physician, or Nurse
  if (staffRole === 'TeamLeader') {
    return ['TeamLeader', 'Physician', 'Nurse'].includes(requestedRole);
  }
  
  // Physician can sign as Physician or Nurse
  if (staffRole === 'Physician') {
    return ['Physician', 'Nurse'].includes(requestedRole);
  }
  
  // Nurse can sign as Nurse only
  if (staffRole === 'Nurse') {
    return requestedRole === 'Nurse';
  }
  
  return false;
};
```

### Auto-Sign for Team Leader

```typescript
// src/services/signature.service.ts (internal function)

const autoSignTeamLeader = async (visitId: string, staffId: string): Promise<void> => {
  // Team Leader who creates the visit is automatically signed
  const signature = await Signature.create({
    visitId,
    staffId,
    staffName: staff.name,
    role: 'TeamLeader',
    signedAt: new Date(),
    autoSigned: true,
  });
};
```

---

## 10. Database Schema

### Signature Model

```typescript
// src/models/Signature.ts

import mongoose, { Schema, Document } from 'mongoose';

export interface ISignature extends Document {
  visitId: mongoose.Types.ObjectId;
  staffId: mongoose.Types.ObjectId;
  staffName: string;
  role: 'TeamLeader' | 'Physician' | 'Nurse';
  signedAt: Date;
  autoSigned: boolean;
  ipAddress?: string;
  userAgent?: string;
}

const SignatureSchema = new Schema<ISignature>({
  visitId: { 
    type: Schema.Types.ObjectId, 
    ref: 'HomeVisit', 
    required: true 
  },
  staffId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Staff', 
    required: true 
  },
  staffName: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['TeamLeader', 'Physician', 'Nurse'], 
    required: true 
  },
  signedAt: { 
    type: Date, 
    default: Date.now 
  },
  autoSigned: { 
    type: Boolean, 
    default: false 
  },
  ipAddress: String,
  userAgent: String,
}, {
  timestamps: true,
});

// Indexes
SignatureSchema.index({ visitId: 1 });
SignatureSchema.index({ staffId: 1 });
SignatureSchema.index({ visitId: 1, staffId: 1 }, { unique: true });

export const Signature = mongoose.model<ISignature>('Signature', SignatureSchema);
```

---

## 11. Test Cases

### POST /visits/:visitId/sign

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Valid signature | Mock visit found, staff credentials valid | POST /visits/:visitId/sign | 200, signature added |
| Visit not found | Mock visit not found | POST /visits/:visitId/sign | 404, "Visit not found" |
| Invalid email | Mock staff not found | POST /visits/:visitId/sign | 401, "Invalid email or password" |
| Invalid password | Mock staff found, wrong password | POST /visits/:visitId/sign | 401, "Invalid email or password" |
| Role mismatch | Mock staff is Nurse, requesting Physician | POST /visits/:visitId/sign | 403, "You are not authorized to sign as this role" |
| Account not active | Mock staff status is "Pending" | POST /visits/:visitId/sign | 403, "Your account is not active" |
| Already signed | Mock staff already signed | POST /visits/:visitId/sign | 400, "You have already signed this visit" |

### GET /visits/:visitId/signatures

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Visit with signatures | Mock visit found with signatures | GET /visits/:visitId/signatures | 200, returns all signatures |
| Visit with no signatures | Mock visit found, no signatures | GET /visits/:visitId/signatures | 200, returns null for all roles |
| Visit not found | Mock visit not found | GET /visits/:visitId/signatures | 404, "Visit not found" |

### DELETE /visits/:visitId/signatures/:signatureId

| Case | Setup | Action | Expected Result |
|---|---|---|---|
| Valid removal | Mock signature found, admin authenticated | DELETE /visits/:visitId/signatures/:signatureId | 200, signature removed |
| Signature not found | Mock signature not found | DELETE /visits/:visitId/signatures/:signatureId | 404, "Signature not found" |
| Non-admin user | Mock staff authenticated | DELETE /visits/:visitId/signatures/:signatureId | 403, "Only admin can remove signatures" |

---

## 12. Flow Diagram

```
+-----------------------------------------------------------+
|              DIGITAL SIGNATURE FLOW (BACKEND)              |
+-----------------------------------------------------------+
|                                                           |
|  +-----------------------------------------------------+ |
|  |                    SIGN VISIT                       | |
|  |                                                     | |
|  |  POST /visits/:visitId/sign                        | |
|  |         -> authMiddleware                           | |
|  |         -> validate(signVisitSchema)               | |
|  |         -> signatureController.signVisit           | |
|  |         -> signatureService.signVisit              | |
|  |         -> Find visit by ID                        | |
|  |         -> Find staff by email                     | |
|  |         -> Verify password                         | |
|  |         -> Verify staff status is "Active"        | |
|  |         -> Verify role matches                     | |
|  |         -> Check not already signed                | |
|  |         -> Create signature record                 | |
|  |         -> Return signature response               | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    GET SIGNATURES                    | |
|  |                                                     | |
|  |  GET /visits/:visitId/signatures                    | |
|  |         -> authMiddleware                           | |
|  |         -> signatureController.getVisitSignatures   | |
|  |         -> signatureService.getVisitSignatures      | |
|  |         -> Find visit by ID                        | |
|  |         -> Get all signatures for visit             | |
|  |         -> Group by role (TeamLeader, Physician,   | |
|  |            Nurse)                                   | |
|  |         -> Return signatures with status            | |
|  +-----------------------------------------------------+ |
|                           |                               |
|                           v                               |
|  +-----------------------------------------------------+ |
|  |                    REMOVE SIGNATURE (Admin)          | |
|  |                                                     | |
|  |  DELETE /visits/:visitId/signatures/:signatureId   | |
|  |         -> authMiddleware                           | |
|  |         -> roleMiddleware(['admin'])                | |
|  |         -> signatureController.removeSignature      | |
|  |         -> signatureService.removeSignature         | |
|  |         -> Find visit by ID                        | |
|  |         -> Find signature by ID                     | |
|  |         -> Verify admin role                        | |
|  |         -> Delete signature                         | |
|  |         -> Log removal in audit trail               | |
|  |         -> Return removal response                  | |
|  +-----------------------------------------------------+ |
|                                                           |
+-----------------------------------------------------------+
```
