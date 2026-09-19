import { z } from 'zod';

// ─────────────────────────────────────────────────────────────
// Sign Visit — matches backend `signVisitSchema.body`
//
// NOTE: The backend ONLY accepts 'Physician' and 'Nurse' when
// signing a visit. 'TeamLeader' is auto-signed at visit creation
// by the service layer and cannot be re-added here.
// ─────────────────────────────────────────────────────────────
export const signVisitSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['Physician', 'Nurse'], {
    message: 'Invalid role. Must be Physician or Nurse',
  }),
});

// ─────────────────────────────────────────────────────────────
// Sign Progress Note — matches backend `signProgressNoteSchema.body`
//
// The progress-note sign endpoint ALSO accepts 'Reviewer'.
// This is kept in a separate export so the two flows don't
// accidentally share a schema with the wrong enum.
// ─────────────────────────────────────────────────────────────
export const signProgressNoteSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['Physician', 'Nurse', 'Reviewer'], {
    message: 'Invalid role. Must be Physician, Nurse, or Reviewer',
  }),
});

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
export type SignVisitFormData = z.infer<typeof signVisitSchema>;
export type SignProgressNoteFormData = z.infer<typeof signProgressNoteSchema>;