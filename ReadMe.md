# Documentation Files to Update for Email Verification

Based on the email verification feature being added when staff registers, here are the documentation files that need to be updated:

---

## Files to Update

| # | File | Changes Needed |
|---|---|---|
| 1 | `requirements.md` | Add FR for email verification |
| 2 | `usecases.md` | Update UC-01 with verification steps |
| 3 | `database.md` | Add verification fields to Staff schema |
| 4 | `api/01-auth.md` | Add verification endpoints and update registration |
| 5 | `frontend-specification/01-auth.md` | Add verification UI and flows |
| 6 | `function-level-specification/backend/01-auth.md` | Add verification service functions |
| 7 | `function-level-specification/frontend/01-auth.md` | Add verification hooks and pages |
| 8 | `folder-structure/backend-structure.md` | Add email service file |
| 9 | `folder-structure/frontend-structure.md` | Add verification pages if needed |

---

## New Files to Create

| # | File | Purpose |
|---|---|---|
| 1 | `api/01-email-verification.md` | Email verification API specification |
| 2 | `frontend-specification/01-email-verification.md` | Email verification frontend specification |

---

## Summary Table

| Priority | Files | Action |
|---|---|---|
| High | `requirements.md` | Update |
| High | `usecases.md` | Update |
| High | `database.md` | Update |
| High | `api/01-auth.md` | Update |
| High | `frontend-specification/01-auth.md` | Update |
| High | `function-level-specification/backend/01-auth.md` | Update |
| High | `function-level-specification/frontend/01-auth.md` | Update |
| Medium | `folder-structure/backend-structure.md` | Update |
| Medium | `folder-structure/frontend-structure.md` | Update |
| New | `api/01-email-verification.md` | Create |
| New | `frontend-specification/01-email-verification.md` | Create |

---

## Detailed Changes Required

### 1. requirements.md

| Change | Details |
|---|---|
| Add FR | Staff receives verification email upon registration |
| Add FR | Staff must verify email before logging in |
| Add FR | Admin cannot approve unverified staff |

### 2. usecases.md

| Change | Details |
|---|---|
| Update UC-01 | Add step: "System sends verification email to staff" |
| Update UC-01 | Add alternate flow for email verification failure |
| Update UC-02 | Add precondition: "Staff email must be verified" |

### 3. database.md

| Change | Details |
|---|---|
| Add to Staff Schema | `isEmailVerified: { type: Boolean, default: false }` |
| Add to Staff Schema | `emailVerificationToken: { type: String }` |
| Add to Staff Schema | `emailVerificationTokenExpires: { type: Date }` |

### 4. api/01-auth.md

| Change | Details |
|---|---|
| Update POST /auth/register | Return message: "Verification email sent" |
| Add POST /auth/verify-email | New endpoint for email verification |
| Add POST /auth/resend-verification | New endpoint for resending verification email |
| Update POST /auth/login | Check `isEmailVerified` before allowing login |

---

## Branch Name

```
feature/email-verification
```