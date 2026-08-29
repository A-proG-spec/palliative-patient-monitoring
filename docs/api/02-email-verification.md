# api/02-email-verification.md


# PALLIATIVE PATIENT MONITORING SYSTEM - EMAIL VERIFICATION API SPECIFICATION

## 1. Overview

This document defines the API endpoints for email verification functionality. These endpoints are used to verify staff email addresses during the registration process.

**Base Path:** `/api/v1/auth`

---

## 2. Endpoint Table

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /verify-email | Public | Verify email address using token |
| POST | /resend-verification | Public | Resend verification email |

---

## 3. Endpoint Details

### GET /verify-email

**Purpose:** Verify staff email address using the token sent via email

**Auth:** Public

**Query Params:**

| Param | Type | Required | Description |
|---|---|---|---|
| token | string | Yes | Email verification token sent via email |

**Success Response (200) - Email Verified:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Email verified successfully. Please wait for admin approval.",
  "data": {
    "email": "john@example.com",
    "isEmailVerified": true
  }
}
```

**Success Response (200) - Already Verified:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Email already verified. Please login.",
  "data": {
    "email": "john@example.com",
    "isEmailVerified": true
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 400 | Invalid token | "Invalid verification link" |
| 400 | Token expired | "Verification link has expired. Please request a new one." |
| 404 | Staff not found | "User not found" |

**Verification Link Expiry:** 24 hours from generation

---

### POST /resend-verification

**Purpose:** Resend verification email to staff member

**Auth:** Public

**Request Body:**

```json
{
  "email": "john@example.com"
}
```

**Validation Rules:**

| Field | Rule |
|---|---|
| email | Required, valid email format |

**Success Response (200):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Verification email sent. Please check your inbox.",
  "data": {
    "email": "john@example.com"
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 404 | Email not found | "No account found with this email" |
| 400 | Email already verified | "Email already verified. Please login." |
| 429 | Too many requests | "Please wait before requesting another email" |

**Rate Limiting:** 1 request per 5 minutes per email

---

## 4. Verification Email Template

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

## 5. Verification Token Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    VERIFICATION TOKEN LIFECYCLE                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    TOKEN GENERATION                                  │  │
│  │                                                                      │  │
│  │  Staff registers → System generates random token (32 bytes hex)     │  │
│  │  Token stored in Staff.emailVerificationToken                        │  │
│  │  Expiry set to 24 hours from now                                     │  │
│  │  Email sent with verification link                                   │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    ▼                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    TOKEN VERIFICATION                                │  │
│  │                                                                      │  │
│  │  Staff clicks link → System validates token                          │  │
│  │  Check: Token exists                                                │  │
│  │  Check: Token not expired                                            │  │
│  │  Check: Email not already verified                                   │  │
│  │  Update: isEmailVerified = true                                     │  │
│  │  Clear: emailVerificationToken = null                                │  │
│  │  Clear: emailVerificationTokenExpires = null                         │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    ▼                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    TOKEN EXPIRY                                      │  │
│  │                                                                      │  │
│  │  Token not verified within 24 hours → Token expires                 │  │
│  │  Staff must request new verification email                          │  │
│  │  New token generated with fresh 24-hour expiry                      │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Type Definitions

```typescript
// src/types/auth.types.ts

export interface VerifyEmailResponse {
  email: string;
  isEmailVerified: boolean;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ResendVerificationResponse {
  email: string;
}

export interface VerificationTokenPayload {
  staffId: string;
  email: string;
  token: string;
  expires: Date;
}
```

---

## 7. Email Service Configuration

```typescript
// src/utils/email.ts

export interface EmailConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
}

export interface VerificationEmailData {
  to: string;
  name: string;
  token: string;
}
```

---

## 8. Environment Variables

```env
# .env.example

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com
VERIFICATION_TOKEN_EXPIRY=86400  # 24 hours in seconds

# Frontend URL for verification links
FRONTEND_URL=http://localhost:5173
```

---

## 9. Sequence Diagram

```
┌─────────┐          ┌─────────┐          ┌─────────┐          ┌─────────┐
│  Staff  │          │   API   │          │  Email  │          │ Database│
└────┬────┘          └────┬────┘          └────┬────┘          └────┬────┘
     │                    │                    │                    │
     │  Register          │                    │                    │
     │───────────────────▶│                    │                    │
     │                    │                    │                    │
     │                    │  Generate Token    │                    │
     │                    │───────────────────▶│                    │
     │                    │                    │                    │
     │                    │  Store Token       │                    │
     │                    │────────────────────────────────────────▶│
     │                    │                    │                    │
     │  Success Response  │                    │                    │
     │◀───────────────────│                    │                    │
     │                    │                    │                    │
     │                    │  Send Email        │                    │
     │                    │───────────────────▶│                    │
     │                    │                    │                    │
     │  Email Received    │                    │                    │
     │◀───────────────────────────────────────│                    │
     │                    │                    │                    │
     │  Click Link        │                    │                    │
     │───────────────────▶│                    │                    │
     │                    │                    │                    │
     │                    │  Verify Token      │                    │
     │                    │────────────────────────────────────────▶│
     │                    │                    │                    │
     │                    │  Update Verified   │                    │
     │                    │────────────────────────────────────────▶│
     │                    │                    │                    │
     │  Verification      │                    │                    │
     │  Success Page      │                    │                    │
     │◀───────────────────│                    │                    │
     │                    │                    │                    │
     │  Or Token Expired  │                    │                    │
     │  Request Resend    │                    │                    │
     │───────────────────▶│                    │                    │
     │                    │                    │                    │
     │                    │  Generate New Token│                    │
     │                    │───────────────────▶│                    │
     │                    │                    │                    │
     │  Resend Success    │                    │                    │
     │◀───────────────────│                    │                    │
     │                    │                    │                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 10. Summary of Changes

| Change | Before | After |
|---|---|---|
| Email Verification | Not available | Added GET /verify-email endpoint |
| Resend Verification | Not available | Added POST /resend-verification endpoint |
| Verification Token | Not available | Added to Staff schema |
| Email Service | Not available | Added Nodemailer configuration |
| Environment Variables | No email config | Added SMTP and verification token expiry vars |
| Verification Link | Not available | Added frontend URL for email links |
```
```