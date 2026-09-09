# 📄 Document 9 of 9

## `docs/frontend-specification/19-progress-notes.md`

---

# Frontend Specification — Patient Progress Notes

## 1.0 Overview

### 1.1 Purpose

The Patient Progress Notes feature allows palliative care staff to record comprehensive clinical progress notes for hospitalised patients. This feature mirrors the physical "PALLIATIVE PATIENT PROGRESS NOTE FORM" used at Y12HMC and follows a structured, multi-section format.

### 1.2 Related Forms

- `PALLIATIVE PATIENT PROGRESS NOTE FORM.docx`

### 1.3 User Roles

| Role | Can Record Notes | Can View Notes | Can Edit Notes |
|------|------------------|----------------|----------------|
| Team Leader | ✅ | ✅ | ✅ |
| Physician | ✅ | ✅ | ✅ |
| Nurse | ✅ | ✅ | ✅ |
| Admin | ❌ | ✅ | ❌ |

---

## 2.0 Page: Record Progress Note

### 2.1 Route

```
/patients/:id/progress-note/new
```

### 2.2 Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back to Patient                                            │
│                                                                 │
│  [📓] PATIENT PROGRESS NOTE                                    │
│       Yekatit 12 Hospital Medical College (Y12HMC)             │
│       Patient: Sarah Johnson · PAT-001                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Header  │  1–2 Status & Vitals  │  3 Symptoms  │  4–6  │ │ ← Tab Strip
│  │  Resp/Nut/Elim  │  7–8 Skin & Psych  │  9–11 Spiritual/ │ │
│  │  Family/Goals  │  12–13 Meds & Nursing  │  14–15 Inves- │ │
│  │  tigations & MDT  │  16–18 Assessment & SOAP  │  19–20  │ │
│  │  Notes & Auth  │                                          │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                                                          │ │
│  │  ← HEADER SECTION →                                      │ │
│  │                                                          │ │
│  │  Hospital: [Yekatit 12 Hospital Medical College]         │ │
│  │  Palliative Care Unit: [Palliative Care Unit]            │ │
│  │  Patient Name: [Sarah Johnson]                           │ │
│  │  Patient/MRN No.: [PAT-001]                              │ │
│  │  Date: [2026-09-10]  Time: [14:30]                      │ │
│  │  Day of Admission: [Day 5]                               │ │
│  │  Attending Clinician: [Dr. John Smith]                   │ │
│  │                                                          │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  [Prev] [Next]                                [Cancel] [Save]  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Tab Structure

The progress note is divided into 9 tabs for manageable data entry:

| Tab | Sections Covered | Key Fields |
|-----|------------------|------------|
| **Header** | Header Information | Hospital, Unit, Patient, Date, Clinician |
| **1–2 Status & Vitals** | 1. Current Clinical Status, 2. Vital Signs | General condition, LOC, Orientation, Functional status, Vital signs (current + previous) |
| **3 Symptoms** | 3. Symptom Assessment | 12 symptoms with severity, Pain review with score/location/management |
| **4–6 Resp/Nut/Elim** | 4. Respiratory Status, 5. Nutrition & Hydration, 6. Elimination | Breathing, Oxygen therapy, Oral intake, Diet, Urine output, Bowel movement |
| **7–8 Skin & Psych** | 7. Skin & Wound Status, 8. Psychological/Emotional | Skin condition, Pressure injury, Mood/behavior, Psychological distress |
| **9–11 Spiritual/Family/Goals** | 9. Spiritual/Cultural, 10. Family/Caregiver, 11. Goals of Care | Spiritual distress, Family concerns, Goals of care, Code status |
| **12–13 Meds & Nursing** | 12. Medication Review, 13. Nursing/Supportive Care | Medication table, PRN effectiveness, Nursing care checklist |
| **14–15 Investigations & MDT** | 14. Investigations/Results, 15. MDT Review | Lab tests, Imaging, MDT disciplines with follow-up |
| **16–18 Assessment & SOAP** | 16. Clinical Assessment, 17. Plan, 18. SOAP | Overall assessment, Problems, Plans for all domains, SOAP format |
| **19–20 Notes & Auth** | 19. Additional Progress Notes, 20. Authorization | Additional entries, Signatures, Facility stamp |

---

## 3.0 Tab Content Details

### 3.1 Tab 1: Header

```
┌─────────────────────────────────────────────────────────────────┐
│  → Header Information                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Hospital/Facility Name: Yekatit 12 Hospital Medical College] │
│  [Palliative Care Unit: Palliative Care Unit]                  │
│  [Patient Name *: Sarah Johnson]                               │
│  [Patient/MRN No.: PAT-001]                                    │
│  [Date *: 2026-09-10]  [Time: 14:30]                         │
│  [Day of Admission: Day 5]                                     │
│  [Attending/Responsible Clinician *: Dr. John Smith]          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Validation:**
- Patient Name: Required
- Date: Required
- Attending Clinician: Required

---

### 3.2 Tab 2: Current Clinical Status & Vital Signs

```
┌─────────────────────────────────────────────────────────────────┐
│  1. CURRENT CLINICAL STATUS                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  General Condition: [▼ Stable ▼]                               │
│  Level of Consciousness: [▼ Alert ▼]                           │
│  Orientation: [▼ Oriented ▼]                                   │
│  Functional Status: [▼ Independent ▼]                          │
│                                                                 │
│  [Changes Since Previous Review]                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Patient reports feeling slightly better today.       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  2. VITAL SIGNS                                                 │
│                                                                 │
│  ┌──────────────┬──────────────────┬───────────────────────┐  │
│  │ Vital Sign   │ Current          │ Previous / Trend      │  │
│  ├──────────────┼──────────────────┼───────────────────────┤  │
│  │ Temperature  │ [36.8  °C]       │ [37.2  °C]           │  │
│  │ Pulse/HR     │ [88   bpm]       │ [92   bpm]           │  │
│  │ Respiratory  │ [18   /min]      │ [20   /min]          │  │
│  │ BP           │ [120/80 mmHg]    │ [130/85 mmHg]        │  │
│  │ SpO₂         │ [96   %]         │ [94   %]            │  │
│  │ Oxygen Flow  │ [2    L/min]     │ [2    L/min]         │  │
│  └──────────────┴──────────────────┴───────────────────────┘  │
│                                                                 │
│  [Other Relevant Observations]                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Options:**
- General Condition: Stable, Improving, Deteriorating, Critical, Actively Dying
- Level of Consciousness: Alert, Drowsy, Confused, Delirious, Unresponsive
- Orientation: Oriented, Partially Oriented, Disoriented, Unable to Assess
- Functional Status: Independent, Requires Assistance, Bedbound, Fully Dependent

---

### 3.3 Tab 3: Symptom Assessment

```
┌─────────────────────────────────────────────────────────────────┐
│  3. SYMPTOM ASSESSMENT                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┬──────┬────────┬──────────┬──────────┐       │
│  │ Symptom      │ None │ Mild   │ Moderate │ Severe   │ Notes │
│  ├──────────────┼──────┼────────┼──────────┼──────────┤       │
│  │ Pain         │  ○   │  ○     │  ●       │  ○       │ [___] │
│  │ SOB          │  ●   │  ○     │  ○       │  ○       │ [___] │
│  │ Nausea       │  ○   │  ●     │  ○       │  ○       │ [___] │
│  │ Vomiting     │  ●   │  ○     │  ○       │  ○       │ [___] │
│  │ Constipation │  ○   │  ○     │  ○       │  ●       │ [___] │
│  │ Diarrhea     │  ●   │  ○     │  ○       │  ○       │ [___] │
│  │ Fatigue      │  ○   │  ○     │  ●       │  ○       │ [___] │
│  │ Anxiety      │  ○   │  ●     │  ○       │  ○       │ [___] │
│  │ Delirium     │  ●   │  ○     │  ○       │  ○       │ [___] │
│  │ Insomnia     │  ○   │  ○     │  ●       │  ○       │ [___] │
│  │ Appetite Loss│  ○   │  ○     │  ○       │  ●       │ [___] │
│  │ Other        │  ○   │  ○     │  ○       │  ○       │ [___] │
│  └──────────────┴──────┴────────┴──────────┴──────────┘       │
│                                                                 │
│  ── PAIN REVIEW ─────────────────────────────────────────────── │
│                                                                 │
│  Pain Score: [7] / 10                                           │
│  Location: [Right lower chest, radiating to back]              │
│  Character: [Sharp, intermittent]                              │
│  Current Pain Management: [Morphine 10mg PO Q4H]               │
│  Response to Treatment:  ○ Good  ○ Partial  ● Poor  ○ N/A     │
│  Breakthrough Pain Episodes:  ○ No  ● Yes                     │
│  Frequency: [2-3 episodes per day]                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Symptoms List:**
- Pain
- Shortness of Breath
- Nausea
- Vomiting
- Constipation
- Diarrhea
- Fatigue
- Anxiety
- Delirium/Confusion
- Insomnia
- Appetite Loss
- Other

**Pain Response Options:**
- Good
- Partial
- Poor
- Not Applicable

---

### 3.4 Tab 4: Respiratory, Nutrition & Elimination

```
┌─────────────────────────────────────────────────────────────────┐
│  4. RESPIRATORY STATUS                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Breathing: [▼ Comfortable ▼]                                  │
│  Oxygen Therapy:  ○ No  ● Yes                                 │
│  Delivery: [▼ Nasal Cannula ▼]                                 │
│  ┌─ Other: [______________] ──────────────────────────────┐   │
│                                                                 │
│  Respiratory Secretions: [▼ None ▼]                            │
│  Cough:  ○ No  ● Yes                                          │
│  [Other Respiratory Findings]                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Mild wheeze on expiration                             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  5. NUTRITION AND HYDRATION                                     │
│                                                                 │
│  Oral Intake: [▼ Reduced ▼]                                    │
│  Diet: [Soft diet]                                              │
│  Fluid Intake: [1.2L per day]                                  │
│  Feeding Assistance:  ○ No  ● Yes                             │
│  Enteral Feeding:  ● No  ○ Yes                                │
│  IV Fluids:  ● No  ○ Yes                                      │
│  Nausea/Vomiting Affecting Intake:  ○ No  ● Yes               │
│  [Nutrition/Hydration Concerns]                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Patient reports nausea after meals                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  6. ELIMINATION                                                 │
│                                                                 │
│  Urine Output: [▼ Normal ▼]                                    │
│  Urinary Catheter:  ● No  ○ Yes                               │
│  Bowel Movement: [▼ Constipated ▼]                             │
│  Last Bowel Movement: [2026-09-08]                             │
│  [Other Elimination Concerns]                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  No bowel movement for 2 days                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Breathing Options:**
- Comfortable
- Mild Distress
- Moderate Distress
- Severe Distress

**Respiratory Secretions Options:**
- None
- Mild
- Moderate
- Excessive

**Oral Intake Options:**
- Good
- Reduced
- Minimal
- None

**Urine Output Options:**
- Normal
- Reduced
- Minimal
- Unable to Assess

**Bowel Movement Options:**
- Normal
- Constipated
- Diarrhea
- No Recent BM

---

### 3.5 Tab 5: Skin & Psychological

```
┌─────────────────────────────────────────────────────────────────┐
│  7. SKIN AND WOUND STATUS                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Skin: [▼ Intact ▼]                                            │
│  ┌─ Other: [______________] ──────────────────────────────┐   │
│                                                                 │
│  Pressure Injury:  ○ No  ● Yes                                 │
│  Location/Stage: [Sacrum, Stage 1]                             │
│  Wound Care Provided:  ● No  ○ Yes                            │
│  [Wound/Pressure Injury Changes]                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Redness noted over sacrum area                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  8. PSYCHOLOGICAL / EMOTIONAL STATUS                            │
│                                                                 │
│  Mood/Behavior: (Select all that apply)                        │
│  ☐ Calm  ☑ Anxious  ☐ Fearful  ☐ Sad  ☐ Depressed           │
│  ☐ Agitated  ☐ Withdrawn                                      │
│                                                                 │
│  Psychological Distress: [▼ Moderate ▼]                        │
│                                                                 │
│  [Patient's Main Concerns Today]                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Worried about pain and prognosis                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Counseling Provided:  ● No  ○ Yes                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Skin Options:**
- Intact
- Dry
- Fragile
- Edematous
- Other

**Mood/Behavior Options:**
- Calm
- Anxious
- Fearful
- Sad
- Depressed
- Agitated
- Withdrawn

**Psychological Distress Options:**
- None
- Mild
- Moderate
- Severe

---

### 3.6 Tab 6: Spiritual, Family & Goals of Care

```
┌─────────────────────────────────────────────────────────────────┐
│  9. SPIRITUAL / CULTURAL NEEDS                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Spiritual Distress Identified:  ● No  ○ Yes                   │
│                                                                 │
│  [Patient's Spiritual/Cultural Concerns]                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Spiritual Care Provided:  ○ No  ● Yes                        │
│  Referral Required:  ● No  ○ Yes                              │
│  [Notes: Prayer offered per patient request]                   │
│                                                                 │
│  10. FAMILY / CAREGIVER UPDATE                                  │
│                                                                 │
│  Family/Caregiver Present:  ○ No  ● Yes                       │
│                                                                 │
│  [Family/Caregiver Concerns]                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Daughter concerned about mother's pain management     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [Education/Support Provided]                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Explained pain management options and medication     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Family Meeting Held:  ● No  ○ Yes                            │
│  ┌─ Participants: [______________] ──────────────────────┐   │
│                                                                 │
│  11. GOALS OF CARE REVIEW                                      │
│                                                                 │
│  Current Goals of Care: (Select all that apply)                │
│  ☑ Comfort/Symptom Control  ☐ Quality of Life                  │
│  ☐ Functional Support  ☐ Disease-Directed Treatment           │
│  ☐ End-of-Life Care  ☐ Home/Hospice Care                      │
│  ☐ Other: [________________]                                   │
│                                                                 │
│  Goals Reviewed Today:  ○ No  ● Yes                           │
│  Change in Goals Identified:  ● No  ○ Yes                     │
│                                                                 │
│  [Patient/Decision-Maker Preferences]                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Patient prefers comfort-focused care                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Code Status: [▼ DNAR/DNR ▼]                                   │
│  ┌─ Other: [______________] ──────────────────────────────┐   │
│                                                                 │
│  Advance Care Plan Reviewed:  ● No  ○ Yes                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### 3.7 Tab 7: Medications & Nursing Care

```
┌─────────────────────────────────────────────────────────────────┐
│  12. MEDICATION REVIEW                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Current Medication Regimen Reviewed:  ○ No  ● Yes             │
│  Changes Made:  ● No  ○ Yes                                   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Medication/Treatment  │ Dose │ Route │ Freq  │ Reason  │   │
│  ├────────────────────────┼──────┼───────┼───────┼─────────┤   │
│  │  Morphine              │ 10mg │ Oral  │ Q4H   │ Pain    │   │
│  │  Ondansetron           │ 4mg  │ Oral  │ Q6H   │ Nausea  │   │
│  │  [________________]    │ [__] │ [__]  │ [__]  │ [____]  │   │
│  └─────────────────────────────────────────────────────────┘   │
│  [Add Row]                                                     │
│                                                                 │
│  PRN/Breakthrough Medication Used:  ○ No  ● Yes                │
│  Effectiveness: [▼ Effective ▼]                                │
│  Medication Side Effects:  ○ None  ● Yes                       │
│  ┌─ Details: [Mild drowsiness] ──────────────────────────┐   │
│                                                                 │
│  13. NURSING / SUPPORTIVE CARE PROVIDED                         │
│                                                                 │
│  (Select all that apply)                                        │
│  ☑ Positioning/Comfort Measures  ☐ Personal Hygiene            │
│  ☐ Oral Care  ☑ Pressure-Injury Prevention                     │
│  ☐ Wound Care  ☐ Oxygen Therapy                               │
│  ☑ Symptom Monitoring  ☑ Medication Administration            │
│  ☐ Nutrition/Hydration Support  ☐ Emotional Support            │
│  ☐ Family/Caregiver Education  ☐ Other: [____]                │
│                                                                 │
│  [Response to Supportive Care]                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Patient reports relief after repositioning            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**PRN Effectiveness Options:**
- Effective
- Partially Effective
- Ineffective

---

### 3.8 Tab 8: Investigations & MDT Review

```
┌─────────────────────────────────────────────────────────────────┐
│  14. INVESTIGATIONS / RESULTS                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Investigations Performed/Reviewed Today: (Select all)         │
│  ☐ Laboratory Tests  ☑ Imaging                                 │
│  ☐ ECG/Other Diagnostic Test  ☐ None                          │
│  ☐ Other: [________________]                                   │
│                                                                 │
│  [Significant Results]                                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  CT chest showed 3cm mass in right lung mid-zone      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [Clinical Significance / Action Taken]                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Biopsy scheduled for next week                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  15. MULTIDISCIPLINARY TEAM REVIEW                              │
│                                                                 │
│  ┌─────────────────────┬────────────────────┬──────────────┐   │
│  │ Discipline          │ Review/Intervention│ Follow-Up    │   │
│  ├─────────────────────┼────────────────────┼──────────────┤   │
│  │ Physician/Pall Med  │ [Reviewed CT scan] │ ☐ No  ☑ Yes │   │
│  │ Nursing             │ [Pain assessment]  │ ☑ No  ☐ Yes │   │
│  │ Pharmacy            │ [Meds reviewed]    │ ☑ No  ☐ Yes │   │
│  │ Dietitian           │ [Weight stable]    │ ☑ No  ☐ Yes │   │
│  │ Physiotherapy       │ [Assessed mobility]│ ☐ No  ☑ Yes │   │
│  │ Psychology/Counsel  │ [—]                │ ☑ No  ☐ Yes │   │
│  │ Social Work         │ [—]                │ ☑ No  ☐ Yes │   │
│  │ Spiritual Care      │ [—]                │ ☑ No  ☐ Yes │   │
│  │ Other               │ [—]                │ ☑ No  ☐ Yes │   │
│  └─────────────────────┴────────────────────┴──────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**MDT Disciplines:**
- Physician/Palliative Medicine
- Nursing
- Pharmacy
- Dietitian
- Physiotherapy
- Psychology/Counseling
- Social Work
- Spiritual Care
- Other

---

### 3.9 Tab 9: Assessment, Plan & SOAP

```
┌─────────────────────────────────────────────────────────────────┐
│  16. CLINICAL ASSESSMENT                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Overall Assessment]                                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Patient showing signs of disease progression with     │   │
│  │  increasing pain and functional decline                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [Problems Identified Today]                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  1. Uncontrolled pain                                   │   │
│  │  2. Nausea affecting oral intake                        │   │
│  │  3. Constipation                                        │   │
│  │  4.                                                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  17. PLAN FOR NEXT PERIOD                                       │
│                                                                 │
│  [Symptom Management Plan]                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Increase morphine to 15mg PO Q4H, add laxative        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [Medication Plan]                                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Start ondansetron 8mg TDS                              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [Nursing/Supportive Care Plan]                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Daily repositioning, monitor pain scores              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [Investigations/Monitoring]                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  FBC, U&E, LFT to be done tomorrow                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [Family/Caregiver Plan]                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Provide written pain management information           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [Referrals/Consultations]                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Refer to palliative care specialist                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [Discharge/Transfer/Hospice Planning]                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Discuss hospice options with family                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  18. PROGRESS NOTE — SOAP FORMAT                                │
│                                                                 │
│  S — Subjective: Patient/Family Report                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Patient reports increasing pain and anxiety           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  O — Objective: Clinical Findings/Vital Signs                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Vitals: BP 120/80, HR 88, SpO2 96%                   │   │
│  │  Pain score: 7/10                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  A — Assessment: Clinical Assessment                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Disease progression with symptom burden               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  P — Plan: Treatment and Follow-Up Plan                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Increase morphine, start ondansetron, review 24h     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### 3.10 Tab 10: Additional Notes & Authorization

```
┌─────────────────────────────────────────────────────────────────┐
│  19. ADDITIONAL PROGRESS NOTES                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ── Entry 1 ──                                          │   │
│  │  Date: [2026-09-10]  Time: [14:30]                     │   │
│  │  Clinician: [Dr. Jane Smith]                            │   │
│  │  Signature: [Dr. Jane Smith]                            │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │  Patient discussed goals of care with family   │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  │                                                        │   │
│  │  ── Entry 2 ──                                          │   │
│  │  Date: [2026-09-10]  Time: [16:00]                     │   │
│  │  Clinician: [Dr. John Smith]                            │   │
│  │  Signature: [Dr. John Smith]                            │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │  Reviewed CT scan results with patient         │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  │                                                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│  [Add Another Entry]                                          │
│                                                                 │
│  20. AUTHORIZATION                                              │
│                                                                 │
│  Responsible Clinician: [Dr. John Smith]                       │
│  Signature: [Dr. John Smith]  Date/Time: [2026-09-10 14:30]   │
│                                                                 │
│  Palliative Care Nurse: [Nurse Sarah]                          │
│  Signature: [Nurse Sarah]  Date/Time: [2026-09-10 14:35]      │
│                                                                 │
│  Reviewed By: [Dr. Senior]                                     │
│  Signature: [Dr. Senior]  Date/Time: [2026-09-10 15:00]       │
│                                                                 │
│  [Facility Stamp: Y12HMC Palliative Care Unit]                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4.0 State Management

### 4.1 Zustand Store

```typescript
// src/hooks/useProgressNotes.ts
interface ProgressNotesState {
  notes: ProgressNote[];
  addNote: (note: ProgressNote) => void;
  updateNote: (id: string, data: Partial<ProgressNote>) => void;
  deleteNote: (id: string) => void;
}
```

### 4.2 React Query Keys

```typescript
// Progress notes
QUERY_KEYS.PATIENT_PROGRESS_NOTES = (id) => ['patients', id, 'progress-notes'];
QUERY_KEYS.PATIENT_PROGRESS_NOTE = (patientId, noteId) => 
  ['patients', patientId, 'progress-notes', noteId];
```

### 4.3 Hooks

| Hook | Description |
|------|-------------|
| `useProgressNotes(patientId, params)` | Get progress notes for a patient |
| `useProgressNote(patientId, noteId)` | Get single progress note |
| `useCreateProgressNote(patientId)` | Create progress note |
| `useUpdateProgressNote(patientId)` | Update progress note |
| `useDeleteProgressNote(patientId)` | Delete progress note |

---

## 5.0 Validation Rules

### 5.1 Required Fields

| Field | Section | Tab |
|-------|---------|-----|
| patientName | Header | 1 |
| date | Header | 1 |
| attendingClinician | Header | 1 |

### 5.2 Conditional Validation

| Field | Condition |
|-------|-----------|
| breakthroughPainFrequency | Required if breakthroughPainEpisodes is "Yes" |
| reasonForUrgency | Required if priority is Urgent or Emergency |
| spiritualCareProvided | Required if spiritualDistress is "Yes" |
| spiritualReferralRequired | Required if spiritualDistress is "Yes" |

---

## 6.0 Error Handling

### 6.1 Validation Errors

- Required fields marked with `*`
- Error messages appear below the field
- Tab with validation errors is highlighted with a red dot
- On save, focus moves to the first error field

### 6.2 Toast Notifications

| Scenario | Message |
|----------|---------|
| Save success | "Progress note saved successfully" |
| Save failure | "Failed to save progress note. Please try again." |
| Validation error | "Please fix the highlighted fields" |
| Discard confirmation | "You have unsaved changes. Are you sure you want to leave?" |

---

## 7.0 Print/Export

### 7.1 Print Progress Note

- Print-friendly view of the progress note
- Available from progress note detail page
- Opens browser print dialog
- Includes all sections with professional formatting

---