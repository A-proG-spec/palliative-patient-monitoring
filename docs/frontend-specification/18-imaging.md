# 📄 Document 8 of 9

## `docs/frontend-specification/18-imaging.md`

---

# Frontend Specification — Clinical Imaging Examination Order

## 1.0 Overview

### 1.1 Purpose

The Clinical Imaging Examination Order feature allows palliative care staff to order diagnostic imaging examinations for patients and subsequently enter radiology reports. This feature mirrors the physical "CLINICAL IMAGING EXAMINATION ORDER FORM" used at Y12HMC.

### 1.2 Related Forms

- `CLINICAL IMAGING EXAMINATION ORDER FORM.docx`

### 1.3 User Roles

| Role | Can Order Imaging | Can Enter Reports | Can View Imaging |
|------|-------------------|-------------------|------------------|
| Team Leader | ✅ | ✅ | ✅ |
| Physician | ✅ | ✅ | ✅ |
| Nurse | ✅ | ✅ | ✅ |
| Admin | ❌ | ❌ | ✅ |

---

## 2.0 Page: Order Imaging

### 2.1 Route

```
/patients/:id/imaging
```

### 2.2 Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back to Patient                    CLINICAL IMAGING          │
│                                       EXAMINATION ORDER FORM   │
│                                       Yekatit 12 Hospital      │
│                                       Medical College (Y12HMC) │
│                                       Patient: Sarah Johnson   │
│                                       ID: PAT-001              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ── 1. PATIENT INFORMATION ──────────────────────────────────  │
│                                                                 │
│  [Patient Name: Sarah Johnson] [Patient ID: PAT-001]           │
│  [Age: 65 years]         [Sex: ○ Male ● Female ○ Other]       │
│  [Date of Birth: 1961-03-15]                                   │
│  [Medical Record No.: PAT-001] [Ward/Clinic: Palliative Care] │
│                                                                 │
│  ── 2. CLINICAL INFORMATION ─────────────────────────────────  │
│                                                                 │
│  [Provisional/Clinical Diagnosis]                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Suspected lung mass                                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [Presenting Symptoms / Signs]                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Persistent cough, haemoptysis                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [Relevant Medical/Surgical History]                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Previous COPD diagnosis, smoker 40 years              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Previous Imaging:  ○ None  ● Yes                             │
│  [Previous Imaging Type/Findings]                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Chest X-Ray (2026-07-15): Right lower lobe opacity    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [Clinical Question / Reason for Examination]                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Assess for suspected malignancy and plan treatment    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ── 3. IMAGING EXAMINATION REQUESTED ────────────────────────  │
│                                                                 │
│  Modality: [▼ X-Ray ▼]                                        │
│                                                                 │
│  Body Region: [▼ Chest ▼]                                     │
│  Specific Site: [Right lung, mid-zone]                        │
│  Laterality:   [▼ Bilateral ▼]                                │
│  Protocol:     [AP and Lateral views]                         │
│  Contrast:     ○ No  ● Yes  ○ To be determined               │
│                                                                 │
│  ── 4. CONTRAST / MEDICATION INFORMATION ────────────────────  │
│                                                                 │
│  Previous Contrast Reaction:  ○ No  ● Yes                     │
│  [Details: Mild rash, resolved with antihistamine]             │
│  [Known Allergies: Penicillin, Iodine]                        │
│  [Creatinine: 1.2 mg/dL]  [eGFR: 60 mL/min]                  │
│  [Other Relevant Medication: Metformin]                       │
│                                                                 │
│  ── 5. SAFETY SCREENING ─────────────────────────────────────  │
│                                                                 │
│  Pregnancy Status: ● Not pregnant  ○ Pregnant  ○ Possibly     │
│                     ○ Not applicable                           │
│                                                                 │
│  Implanted Device:  ○ No  ● Yes                               │
│  [Device/Implant: Pacemaker (MRI-compatible)]                 │
│                                                                 │
│  Metallic Foreign Body:  ○ No  ○ Yes  ● Unknown              │
│  [Other Safety Considerations: None]                           │
│                                                                 │
│  ── 6. PATIENT PREPARATION ──────────────────────────────────  │
│                                                                 │
│  ☐ No preparation   ☑ Fasting   ☐ Full bladder                │
│  ☐ Empty bladder   ☐ Special medication prep   ☐ Other        │
│                                                                 │
│  [Preparation Instructions: Nil by mouth for 6 hours]          │
│                                                                 │
│  ── 7. PRIORITY ─────────────────────────────────────────────  │
│                                                                 │
│  ● Routine  ○ Urgent  ○ Emergency                             │
│  [Reason for Urgency: ]                                        │
│                                                                 │
│  ── 8. REFERRING CLINICIAN ──────────────────────────────────  │
│                                                                 │
│  [Clinician Name: Dr. John Smith]                              │
│  [Department: Palliative Care]                                 │
│  [License/Registration No.: ABC-12345]                         │
│  [Contact/Extension: ext. 1234]                                │
│                                                                 │
│  ── 9. SIGNATURE ─────────────────────────────────────────────  │
│                                                                 │
│  Signature: [________________]                                  │
│  Date/Time: [2026-09-10] [14:30]                               │
│                                                                 │
│  ────────────────────────────────────────────────────────────── │
│                                                                 │
│  [Cancel]                                      [Submit Order]  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Form Sections

| Section | Fields | Validation |
|---------|--------|------------|
| 1. Patient Information | Auto-filled from patient record | Read-only |
| 2. Clinical Information | Clinical diagnosis, symptoms, history, previous imaging, clinical question | All optional |
| 3. Imaging Requested | Modality (required), body region (required), laterality (required), protocol, contrast (required) | Modality, body region, laterality, contrast required |
| 4. Contrast Info | Previous reaction, allergies, creatinine, eGFR, other meds | Optional |
| 5. Safety Screening | Pregnancy status (required), implanted device (required), metallic foreign body (required), other safety | Pregnancy status, implanted device, metallic foreign body required |
| 6. Patient Preparation | Preparation checkboxes, instructions | Optional |
| 7. Priority | Routine/Urgent/Emergency (required), reason for urgency | Priority required |
| 8. Referring Clinician | Name (required), department, license no., contact | Name required |
| 9. Signature | Signature (required), date/time (auto-filled) | Signature required |

### 2.4 Modality Options

| Modality | Sub-options |
|----------|-------------|
| X-Ray | Chest, Abdomen, Skull/Facial Bones, Spine, Pelvis/Hip, Upper Limb, Lower Limb, Other |
| Ultrasound | Abdomen, Pelvis, Obstetric, Renal/Urinary Tract, Thyroid/Neck, Breast, Scrotal/Testicular, Doppler, Echocardiography, Other |
| CT | Brain/Head, Chest, Abdomen, Pelvis, Spine, Musculoskeletal, CT Angiography, Other |
| MRI | Brain, Spine, Musculoskeletal, Abdomen, Pelvis, Cardiac, MRA/MRV, Other |
| Mammography | Breast |
| Fluoroscopy | Barium Swallow, Barium Enema, IVP, HSG |
| Interventional | Angiography, Biopsy, Drainage, Stenting |
| Nuclear Medicine | Bone Scan, PET/CT, Thyroid Scan, Myocardial Perfusion |
| Other | Other (specify) |

### 2.5 Contrast Options

- No
- Yes
- To be determined

### 2.6 Laterality Options

- Right
- Left
- Bilateral
- Not applicable

### 2.7 Priority Options

| Option | Description |
|--------|-------------|
| Routine | Standard turnaround time |
| Urgent | Expedited processing (requires reason) |
| Emergency | Immediate processing (requires reason) |

### 2.8 Pregnancy Status Options

- Not pregnant
- Pregnant
- Possibly pregnant
- Not applicable

### 2.9 Preparation Options

- No preparation
- Fasting
- Full bladder
- Empty bladder
- Special medication preparation
- Other

### 2.10 Form Submission

**Action:** POST `/api/v1/patients/:patientId/imaging`

**Success Behaviour:**
1. Toast notification: "Imaging order submitted successfully"
2. Show result entry section below the form
3. User can immediately enter imaging report

**Error Behaviour:**
1. Display validation errors inline
2. Toast notification: "Failed to submit imaging order"

---

## 3.0 Page: Imaging List (Tab)

### 3.1 Location

Patient Detail Page → "Imaging" Tab

### 3.2 Table Columns

| Column | Description |
|--------|-------------|
| Modality | Imaging modality (X-Ray, CT, MRI, etc.) with badge |
| Body Region | Body region/organ examined |
| Ordered | Date ordered |
| Performed | Date performed (or —) |
| Status | Ordered (warning) or Completed (success) |
| Report | "View Report" or "Enter Report" button |

### 3.3 Empty State

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                 [Camera Icon]                                   │
│                                                                 │
│              No imaging orders                                  │
│              No imaging examinations have been ordered         │
│              for this patient.                                 │
│                                                                 │
│                    [Order Imaging]                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.4 Row Actions

| Status | Action |
|--------|--------|
| Ordered | "Enter Report" button |
| Completed | "View Report" button |

---

## 4.0 Component: Imaging Result Entry

### 4.1 Location

- Immediately after submitting an imaging order
- Clicking "Enter Report" from Imaging List

### 4.2 Component Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  📋 Enter Imaging Report                           [Collapse]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Report Date: 2026-09-10]  [Image Quality: ▼ Diagnostic ▼]   │
│                                                                 │
│  [Findings]                                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Right lung mid-zone shows a 3cm mass with irregular   │   │
│  │  margins. No pleural effusion. Mediastinal lymph nodes │   │
│  │  are prominent.                                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [Impression / Conclusion]                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Suspected malignant lesion in right lung mid-zone.    │   │
│  │  Recommend biopsy for histopathological confirmation.   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [Recommendations / Follow-up]                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  CT-guided biopsy within 1 week.                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [Reporting Physician: Dr. A. Radiologist]                     │
│  [Additional Notes: ]                                          │
│                                                                 │
│  [Save Report]                                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 Fields

| Field | Type | Required |
|-------|------|----------|
| Report Date | Date | Yes |
| Image Quality | Select (Diagnostic, Limited, NonDiagnostic, RepeatRequired) | Yes |
| Findings | Textarea | Yes |
| Impression | Textarea | Yes |
| Recommendations | Textarea | No |
| Reporting Physician | Text | Yes |
| Additional Notes | Textarea | No |

### 4.4 Image Quality Options

| Option | Description |
|--------|-------------|
| Diagnostic | Image quality is adequate for diagnosis |
| Limited | Image quality is limited but usable |
| NonDiagnostic | Image quality is insufficient for diagnosis |
| Repeat Required | Examination needs to be repeated |

### 4.5 Submission

**Action:** PUT `/api/v1/patients/:patientId/imaging/:imagingId/report`

**Success Behaviour:**
1. Toast notification: "Imaging report saved successfully"
2. Imaging status updates to "Completed"
3. Result entry section collapses
4. Imaging list refreshes

---

## 5.0 Page: Imaging Detail

### 5.1 Route

```
/patients/:id/labs/:labId   (Imaging orders are stored in the same collection)
```

### 5.2 Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back to Patient              Imaging Report                 │
│                                 2026-09-10                     │
│                                 [Completed]                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ── Order Details ───────────────────────────────────────────  │
│                                                                 │
│  Modality: CT Chest                                            │
│  Body Region: Chest                                            │
│  Specific Site: Right lung, mid-zone                          │
│  Laterality: Not applicable                                    │
│  Contrast: Yes                                                 │
│  Priority: Urgent                                              │
│  Ordered: 2026-09-08 by Dr. John Smith                        │
│                                                                 │
│  ── Clinical Information ────────────────────────────────────  │
│                                                                 │
│  Clinical Question: Assess for suspected malignancy            │
│  Safety: Implanted device: None, Pregnancy: Not applicable    │
│                                                                 │
│  ── Report ──────────────────────────────────────────────────  │
│                                                                 │
│  Image Quality: Diagnostic                                     │
│  Report Date: 2026-09-10                                       │
│                                                                 │
│  Findings:                                                     │
│  Right lung mid-zone shows a 3cm mass with irregular margins.  │
│  No pleural effusion. Mediastinal lymph nodes are prominent.   │
│                                                                 │
│  Impression:                                                   │
│  Suspected malignant lesion in right lung mid-zone.           │
│  Recommend biopsy for histopathological confirmation.          │
│                                                                 │
│  Recommendations:                                              │
│  CT-guided biopsy within 1 week.                              │
│                                                                 │
│  Reporting Physician: Dr. A. Radiologist                       │
│                                                                 │
│  [Back to Patient]                                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6.0 State Management

### 6.1 React Query Keys

```typescript
// Imaging orders
QUERY_KEYS.PATIENT_IMAGING = (id) => ['patients', id, 'imaging'];
QUERY_KEYS.PATIENT_IMAGING_DETAIL = (patientId, imagingId) => 
  ['patients', patientId, 'imaging', imagingId];
```

### 6.2 Hooks

| Hook | Description |
|------|-------------|
| `usePatientImaging(patientId, params)` | Get imaging orders for a patient |
| `useImagingDetail(patientId, imagingId)` | Get single imaging order |
| `useOrderImaging(patientId)` | Create imaging order |
| `useUpdateImagingReport(patientId)` | Update imaging report |
| `useUpdateImagingStatus(patientId)` | Update imaging status |
| `useDeleteImaging(patientId)` | Delete imaging order |

---

## 7.0 Validation Rules

### 7.1 Order Form Validation

| Field | Rule |
|-------|------|
| modality | Required, must be valid modality |
| bodyRegion | Required, non-empty string |
| laterality | Required, must be valid laterality |
| contrast | Required, must be valid contrast option |
| pregnancyStatus | Required, must be valid status |
| implantedDevice | Required, boolean |
| metallicForeignBody | Required, must be valid option |
| priority | Required, must be valid priority |
| clinicianName | Required, non-empty string |
| signature | Required, non-empty string |
| reasonForUrgency | Required if priority is Urgent or Emergency |

### 7.2 Report Validation

| Field | Rule |
|-------|------|
| reportDate | Required, valid date |
| imageQuality | Required, must be valid option |
| findings | Required, non-empty string |
| impression | Required, non-empty string |
| reportingPhysician | Required, non-empty string |

---

## 8.0 Error Handling

### 8.1 Common Errors

| Error | User Experience |
|-------|-----------------|
| Network error | Toast: "Network error. Please try again." |
| Validation error | Inline field errors + toast: "Please fix the highlighted fields" |
| 401 Unauthorised | Redirect to login |
| 403 Forbidden | Redirect to unauthorised page |
| 404 Not found | Toast: "Imaging order not found" |

---

## 9.0 Print/Export

### 9.1 Print Imaging Order

- Print-friendly view of the imaging order
- Available from Imaging Detail page
- Opens browser print dialog

---
