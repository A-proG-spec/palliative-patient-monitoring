/**
 * printPatientReport
 * ------------------
 * Builds a self-contained HTML document from patient data and opens
 * the browser's native Print dialog (File → Save as PDF).
 *
 * This version prints the FULL detail for every record type:
 *   • Visits (all clinical columns)
 *   • Medications, Labs, Imaging, Referrals, Admissions
 *   • Progress Notes (all 20 sections)
 *   • Hospice Nursing (all 14 sections)
 *   • All 8 specialty assessments (every field on their detail pages)
 */

import type { Patient } from '@/types/patient.types';
import type { HomeVisit } from '@/types/visit.types';
import type { Medication } from '@/types/medication.types';
import type { LaboratoryTest } from '@/types/lab.types';
import type { ImagingOrder } from '@/types/imaging.types';
import type { Referral } from '@/types/referral.types';
import type { HospitalAdmission } from '@/types/admission.types';
import type { ProgressNote } from '@/hooks/useProgressNotes';
import type { HospiceNursingAssessment } from '@/types/hospice-nursing.types';
import type { PainAssessment } from '@/types/pain-assessment.types';
import type { ClinicalPharmacistAssessment } from '@/types/pharmacist-assessment.types';
import type { PhysiotherapyAssessment } from '@/types/physiotherapy-assessment.types';
import type { FamilyAssessment } from '@/types/family-assessment.types';
import type { NutritionalAssessment } from '@/types/nutritional-assessment.types';
import type { SocialAssessment } from '@/types/social-assessment.types';
import type { SpiritualAssessment } from '@/types/spiritual-assessment.types';
import type { PsychiatryAssessment } from '@/types/psychiatry-assessment.types';

import {
  DISEASE_STAGE_LABELS,
  VISIT_TYPE_LABELS,
  OUTCOME_LABELS,
  SYMPTOM_LABELS,
  PAIN_LOCATION_LABELS,
  REFERRAL_REASON_LABELS,
  EDUCATION_LABELS,
  RED_FLAG_LABELS,
} from '@/constants';

// ── helpers ──────────────────────────────────────────────────────

const fmt = (iso?: string | Date | null): string => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return String(iso);
  }
};

const fmtDateTime = (iso?: string | Date | null): string => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(iso);
  }
};

const safe = (v?: string | number | null): string => {
  if (v === undefined || v === null || v === '') return '—';
  return String(v);
};

const safeBool = (v?: boolean | null): string => {
  if (v === true) return 'Yes';
  if (v === false) return 'No';
  return '—';
};

/**
 * Renders a number — including 0 — with an optional suffix.
 * `safe()` treats 0 as empty; this helper does not.
 */
const num = (n: number | null | undefined, suffix = ''): string => {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  return `${n}${suffix}`;
};

const labelList = (arr: string[] | undefined, map?: Record<string, string>) =>
  arr?.length
    ? arr.map((k) => (map ? map[k] ?? k : k)).join(', ')
    : '—';

/**
 * Humanize an enum value: `OrientedToPerson` → `Oriented To Person`
 */
const humanize = (v?: string | null): string => {
  if (!v) return '—';
  return v.replace(/([A-Z])/g, ' $1').trim();
};

/**
 * Derive a stable patient ID.
 * Prefers `hospitalPatientId` (real MRN) when set, falls back to
 * `patientDisplayId` (system ID like PAT-0001), then derives from
 * the numeric PK.
 */
const patientDisplayId = (p: Patient & { id?: string | number }): string => {
  if (p.hospitalPatientId) return p.hospitalPatientId;
  if (p.patientDisplayId) return p.patientDisplayId;
  if (p.id !== undefined && p.id !== null) {
    return `PAT-${String(p.id).padStart(4, '0')}`;
  }
  return '—';
};

// ── Layout building blocks ───────────────────────────────────────

const section = (title: string, body: string) => `
  <section>
    <h2>${title}</h2>
    ${body}
  </section>`;

const table = (headers: string[], rows: string[][], caption?: string) => `
  ${caption ? `<p class="tbl-caption">${caption}</p>` : ''}
  <table>
    <thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
    <tbody>${
      rows.length
        ? rows
            .map(
              (r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`,
            )
            .join('')
        : `<tr><td colspan="${headers.length}" class="empty">No records</td></tr>`
    }</tbody>
  </table>`;

const infoGrid = (pairs: [string, string][]) => `
  <div class="info-grid">
    ${pairs
      .map(
        ([label, value]) => `
      <div class="info-row">
        <span class="info-label">${label}</span>
        <span class="info-value">${value}</span>
      </div>`,
      )
      .join('')}
  </div>`;

/**
 * Row-level field descriptor for assessment renderers.
 * `format` transforms the raw value; `chips` renders as a joined list.
 */
interface PrintField {
  label: string;
  key: string;
  format?: (v: any) => string;
  /** If true, the value is coerced to Yes/No. */
  boolean?: boolean;
}

interface PrintSection {
  title: string;
  fields: PrintField[];
}

// ── CSS ──────────────────────────────────────────────────────────

const CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Segoe UI', Arial, sans-serif;
    font-size: 11pt; color: #1a1a2e; line-height: 1.5;
    background: #fff; padding: 24px;
  }
  .report-header {
    display: flex; justify-content: space-between; align-items: flex-start;
    padding: 20px 0 14px; border-bottom: 2.5px solid #002395; margin-bottom: 22px;
  }
  .report-header .brand { font-size: 15pt; font-weight: 700; color: #002395; }
  .report-header .brand-sub { font-size: 9pt; color: #52627A; margin-top: 2px; }
  .report-header .meta { text-align: right; font-size: 9pt; color: #52627A; }
  .report-header .meta strong { display: block; font-size: 10pt; color: #1a1a2e; }

  .patient-banner {
    background: #E8ECF7; border-left: 4px solid #002395; border-radius: 4px;
    padding: 12px 16px; margin-bottom: 22px;
    display: flex; justify-content: space-between; align-items: center; gap: 12px;
  }
  .patient-banner .name { font-size: 16pt; font-weight: 700; color: #002395; }
  .patient-banner .pid  { font-size: 9pt; color: #52627A; font-family: monospace; margin-top: 2px; }
  .patient-banner .badges { display: flex; gap: 8px; flex-wrap: wrap; }
  .badge {
    display: inline-block; padding: 3px 10px; border-radius: 99px;
    font-size: 8.5pt; font-weight: 600;
  }
  .badge-primary  { background: #E8ECF7; color: #002395; border: 1px solid #002395; }
  .badge-success  { background: #EAF8F2; color: #43B982; border: 1px solid #43B982; }
  .badge-warning  { background: #FFF3E0; color: #F5A34A; border: 1px solid #F5A34A; }
  .badge-error    { background: #FCE8E8; color: #E74F3D; border: 1px solid #E74F3D; }
  .badge-default  { background: #F1F4F9; color: #424754; border: 1px solid #C2C6D6; }

  section { margin-bottom: 24px; page-break-inside: avoid; }
  section h2 {
    font-size: 11pt; font-weight: 700; color: #002395;
    text-transform: uppercase; letter-spacing: 0.06em;
    padding-bottom: 5px; border-bottom: 1px solid #E6EBF4; margin-bottom: 10px;
  }

  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
  .info-row {
    display: flex; gap: 6px; padding: 4px 0;
    border-bottom: 1px solid #F1F4F9; font-size: 10pt;
  }
  .info-row:last-child { border-bottom: none; }
  .info-label { color: #52627A; min-width: 130px; flex-shrink: 0; }
  .info-value { color: #1a1a2e; font-weight: 500; }

  table { width: 100%; border-collapse: collapse; font-size: 9.5pt; margin-bottom: 8px; }
  th {
    background: #E8ECF7; color: #002395; font-weight: 700;
    text-align: left; padding: 6px 8px; font-size: 8.5pt;
    text-transform: uppercase; letter-spacing: 0.04em;
  }
  td {
    padding: 6px 8px; border-bottom: 1px solid #F1F4F9;
    color: #1a1a2e; vertical-align: top;
  }
  tr:last-child td { border-bottom: none; }
  tr:nth-child(even) td { background: #FAFBFD; }
  td.empty { color: #8290A7; font-style: italic; text-align: center; padding: 12px; }
  .tbl-caption { font-size: 9pt; color: #52627A; margin-bottom: 5px; }

  /* Visit blocks */
  .visit-block {
    border: 1px solid #E6EBF4; border-radius: 4px;
    margin-bottom: 12px; page-break-inside: avoid;
  }
  .visit-block-header {
    display: flex; justify-content: space-between; align-items: center;
    background: #F7F9FE; padding: 7px 12px;
    border-bottom: 1px solid #E6EBF4; border-radius: 4px 4px 0 0;
  }
  .visit-block-header .vb-title { font-weight: 700; color: #002395; font-size: 10pt; }
  .visit-block-body { padding: 10px 12px; }
  .visit-block-body .vb-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 4px 20px;
    font-size: 9.5pt; margin-bottom: 8px;
  }
  .vb-row { display: flex; gap: 6px; }
  .vb-label { color: #52627A; min-width: 120px; flex-shrink: 0; }
  .vb-value { color: #1a1a2e; }
  .vb-note {
    font-size: 9.5pt; color: #52627A; font-style: italic;
    border-top: 1px dashed #E6EBF4; padding-top: 6px; margin-top: 6px;
  }

  /* Assessment blocks */
  .assessment-block {
    border: 1px solid #E6EBF4; border-radius: 4px;
    padding: 12px 14px; margin-bottom: 12px;
    page-break-inside: avoid;
  }
  .assessment-block h3 {
    font-size: 10.5pt; font-weight: 700; color: #002395;
    margin-bottom: 8px;
    padding-bottom: 4px;
    border-bottom: 1px solid #E6EBF4;
  }
  .assessment-block h4 {
    font-size: 9.5pt; font-weight: 700; color: #002395;
    margin: 10px 0 4px;
    padding-bottom: 2px;
    border-bottom: 1px dashed #E6EBF4;
  }
  .assessment-block h4:first-child { margin-top: 0; }
  .assessment-block .row {
    display: flex; gap: 8px; padding: 3px 0; font-size: 9.5pt;
    border-bottom: 1px solid #FAFBFD;
  }
  .assessment-block .row:last-child { border-bottom: none; }
  .assessment-block .row .lbl {
    color: #52627A; min-width: 180px; flex-shrink: 0;
  }
  .assessment-block .row .val {
    color: #1a1a2e; word-break: break-word;
  }

  .report-footer {
    margin-top: 30px; border-top: 1px solid #E6EBF4; padding-top: 10px;
    font-size: 8.5pt; color: #8290A7;
    display: flex; justify-content: space-between;
  }

  @media print {
    body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    section { page-break-inside: avoid; }
    .visit-block, .assessment-block { page-break-inside: avoid; }
  }
`;

// ── Status badge helper ──────────────────────────────────────────

const statusBadge = (status: string | null | undefined): string => {
  if (!status) return '<span class="badge badge-default">—</span>';
  const map: Record<string, string> = {
    Active: 'badge-success',
    Discharged: 'badge-default',
    Home: 'badge-primary',
    ReferredHospital: 'badge-warning',
    Stable: 'badge-success',
    Deteriorating: 'badge-error',
    SymptomsImproved: 'badge-success',
    SymptomsWorsened: 'badge-error',
    SymptomsUnchanged: 'badge-default',
    ReferredToFacility: 'badge-warning',
    Ordered: 'badge-warning',
    Given: 'badge-success',
    Pending: 'badge-warning',
    Accepted: 'badge-success',
    Declined: 'badge-error',
    Deceased: 'badge-error',
    Completed: 'badge-success',
  };
  const cls = map[status] ?? 'badge-default';
  const label = status === 'ReferredHospital' ? 'Hospital' : status;
  return `<span class="badge ${cls}">${label}</span>`;
};

// ── Normalizers for visits (flat columns → nested) ───────────────

const visitVitals = (v: any) => {
  if (v.vitals && typeof v.vitals === 'object') return v.vitals;
  return {
    temperature: v.temperature,
    pulse: v.pulse,
    bloodPressure: v.bloodPressure ?? v.bp,
    respiration: v.respiration,
    spO2: v.spO2,
  };
};

const visitAdl = (v: any) => {
  if (v.adl && typeof v.adl === 'object') return v.adl;
  return {
    feeding: v.feeding,
    bathing: v.bathing,
    dressing: v.dressing,
    toileting: v.toileting,
    mobility: v.Mobility ?? v.mobility,
  };
};

// ── Visit block renderer ─────────────────────────────────────────

const renderVisitBlock = (v: HomeVisit): string => {
  const vitals = visitVitals(v);
  const adl = visitAdl(v);

  const symptoms =
    (v.symptoms ?? []).map((s) => SYMPTOM_LABELS[s] ?? s).join(', ') || '—';

  const painLocs =
    (v.painLocation ?? [])
      .map((p) => PAIN_LOCATION_LABELS[p] ?? p)
      .join(', ') || '—';

  const team =
    (v.teamMembers ?? [])
      .map((m: any) => `${m.name} (${m.role})`)
      .join(', ') || '—';

  const redFlags = (v.redFlags ?? []).filter((f: string) => f !== 'None');

  return `
    <div class="visit-block">
      <div class="visit-block-header">
        <span class="vb-title">
          ${fmt(v.visitDate)} — ${VISIT_TYPE_LABELS[v.visitType] ?? v.visitType}
        </span>
        <span>${statusBadge(v.outcome)}</span>
      </div>
      <div class="visit-block-body">
        <div class="vb-grid">
          <div class="vb-row"><span class="vb-label">Time</span><span class="vb-value">${safe(v.timeStarted)} – ${safe(v.timeEnded)}</span></div>
          <div class="vb-row"><span class="vb-label">Overall Status</span><span class="vb-value">${safe(v.overallStatus)}</span></div>
          <div class="vb-row"><span class="vb-label">PPS Score</span><span class="vb-value">${num(v.ppsScore, '%')}</span></div>
          <div class="vb-row"><span class="vb-label">KPS Score</span><span class="vb-value">${num(v.kpsScore)}/100</span></div>
          <div class="vb-row"><span class="vb-label">Pain Score</span><span class="vb-value">${num(v.painScore)}/10</span></div>
          <div class="vb-row"><span class="vb-label">Mobility</span><span class="vb-value">${safe(v.mobility)}</span></div>
          <div class="vb-row"><span class="vb-label">Pain Locations</span><span class="vb-value">${painLocs}</span></div>
          <div class="vb-row"><span class="vb-label">Medication Effective</span><span class="vb-value">${safeBool(v.painMedicationEffective)}</span></div>
          <div class="vb-row"><span class="vb-label">Symptoms</span><span class="vb-value">${symptoms}</span></div>
          <div class="vb-row"><span class="vb-label">Emotional Status</span><span class="vb-value">${safe(v.emotionalStatus)}</span></div>
          <div class="vb-row"><span class="vb-label">Appetite</span><span class="vb-value">${safe(v.appetite)}</span></div>
          <div class="vb-row"><span class="vb-label">Hydration</span><span class="vb-value">${safe(v.hydrationStatus)}</span></div>
          <div class="vb-row"><span class="vb-label">Oral Intake</span><span class="vb-value">${safe(v.oralIntake)}</span></div>
          <div class="vb-row"><span class="vb-label">Family Support</span><span class="vb-value">${safe(v.familySupport)}</span></div>
          <div class="vb-row"><span class="vb-label">Caregiver Burden</span><span class="vb-value">${safe(v.caregiverBurden)}</span></div>
          <div class="vb-row"><span class="vb-label">Home Condition</span><span class="vb-value">${safe(v.homeCondition)}</span></div>
          ${v.nextVisitDate ? `<div class="vb-row"><span class="vb-label">Next Visit</span><span class="vb-value">${fmt(v.nextVisitDate)}</span></div>` : ''}
          <div class="vb-row"><span class="vb-label">Team Members</span><span class="vb-value">${team}</span></div>
          <div class="vb-row"><span class="vb-label">Vitals</span><span class="vb-value">T ${safe(vitals.temperature)}°C · P ${safe(vitals.pulse)} · BP ${safe(vitals.bloodPressure)} · RR ${safe(vitals.respiration)} · SpO₂ ${safe(vitals.spO2)}%</span></div>
          <div class="vb-row"><span class="vb-label">ADL</span><span class="vb-value">Feed ${safe(adl.feeding)} · Bathe ${safe(adl.bathing)} · Dress ${safe(adl.dressing)} · Toilet ${safe(adl.toileting)} · Mobil ${safe(adl.mobility)}</span></div>
          <div class="vb-row"><span class="vb-label">Medication</span><span class="vb-value">Available: ${safeBool(v.medicationAvailable)} · Taken: ${safeBool(v.medicationCorrectlyTaken)} · Side Effects: ${safeBool(v.medicationSideEffects)}</span></div>
          <div class="vb-row"><span class="vb-label">Education</span><span class="vb-value">${labelList(v.educationProvided, EDUCATION_LABELS)}</span></div>
        </div>
        ${
          v.keyIssues
            ? `<div class="vb-note"><strong>Key Issues:</strong> ${safe(v.keyIssues)}</div>`
            : ''
        }
        ${
          v.followUpPlan
            ? `<div class="vb-note"><strong>Follow-Up Plan:</strong> ${safe(v.followUpPlan)}</div>`
            : ''
        }
        ${
          redFlags.length > 0
            ? `<div class="vb-note">⚠ Red flags: ${redFlags
                .map((f: string) => RED_FLAG_LABELS[f] ?? f)
                .join(', ')}${
                v.redFlagActions ? ` — ${v.redFlagActions}` : ''
              }</div>`
            : ''
        }
      </div>
    </div>`;
};

// ── Generic sectioned assessment renderer ────────────────────────

/**
 * Renders a full assessment with all its sections.
 * Used by every specialty assessment renderer below.
 */
const renderSectionedAssessment = (
  title: string,
  date: string,
  subtitle: string,
  sections: PrintSection[],
  row: any,
): string => {
  const sectionHtml = sections
    .map((sec) => {
      const rows = sec.fields
        .map((f) => {
          const raw = row[f.key];
          let display: string;

          if (f.boolean) {
            display = raw === true ? 'Yes' : raw === false ? 'No' : '';
          } else if (f.format) {
            display = f.format(raw);
          } else if (Array.isArray(raw)) {
            display = raw.length ? raw.join(', ') : '';
          } else if (raw === null || raw === undefined || raw === '') {
            display = '';
          } else {
            display = String(raw);
          }

          if (!display || display === '—' || display === '-') return '';
          return `<div class="row"><span class="lbl">${f.label}</span><span class="val">${display}</span></div>`;
        })
        .join('');

      if (!rows) return '';
      return `<h4>${sec.title}</h4>${rows}`;
    })
    .join('');

  return `
    <div class="assessment-block">
      <h3>${title} — ${fmt(date)} <span style="font-weight:400;color:#52627A;font-size:9pt">(${subtitle})</span></h3>
      ${sectionHtml || '<div class="row"><span class="val" style="color:#8290A7;font-style:italic">No data recorded</span></div>'}
    </div>`;
};

// ═══════════════════════════════════════════════════════════════
// Field-set definitions — one array per assessment type.
// Each mirrors the corresponding *DetailPage.tsx SECTIONS constant.
// ═════════════════════════════════════════════════════════════

// ── Progress Note ──
const buildProgressNoteSections = (n: any): PrintSection[] => {
  const painKeys = [
    'Pain',
    'Shortness of Breath',
    'Nausea',
    'Vomiting',
    'Constipation',
    'Diarrhea',
    'Fatigue',
    'Anxiety',
    'Delirium/Confusion',
    'Insomnia',
    'Appetite Loss',
    'Other',
  ];

  const symptomFields: PrintField[] = painKeys
    .map((key) => {
      const row = n.symptoms?.[key];
      if (!row) return null;
      const sev = row.severity ?? 'None';
      const notes = row.notes ?? '';
      if (sev === 'None' && !notes) return null;
      return {
        label: key,
        key: `__symptom_${key}`,
        format: () => `${sev}${notes ? ` — ${notes}` : ''}`,
      };
    })
    .filter(Boolean) as PrintField[];

  // Inject synthetic symptom values into a shallow copy
  const enhanced = { ...n };
  painKeys.forEach((key) => {
    const row = n.symptoms?.[key];
    if (row) {
      enhanced[`__symptom_${key}`] = `${row.severity ?? 'None'}${row.notes ? ` — ${row.notes}` : ''}`;
    }
  });

  return [
    {
      title: 'Note Information',
      fields: [
        { label: 'Attending Clinician', key: 'attendingClinician' },
        { label: 'Palliative Care Unit', key: 'palliativeCareUnit' },
      ],
    },
    {
      title: '1. Current Clinical Status',
      fields: [
        { label: 'General Condition', key: 'generalCondition' },
        { label: 'Level of Consciousness', key: 'levelOfConsciousness' },
        { label: 'Orientation', key: 'orientation' },
        { label: 'Functional Status', key: 'functionalStatus' },
        { label: 'Changes Since Previous Review', key: 'changesSincePreviousReview' },
      ],
    },
    {
      title: '2. Vital Signs',
      fields: [
        { label: 'Temperature', key: 'temperature' },
        { label: 'Pulse', key: 'pulse' },
        { label: 'Respiratory Rate', key: 'respiratoryRate' },
        { label: 'Blood Pressure', key: 'bloodPressure' },
        { label: 'SpO₂', key: 'spo2' },
        { label: 'Oxygen Flow', key: 'oxygenFlow' },
        { label: 'Other Observations', key: 'otherRelevantObservations' },
      ],
    },
    {
      title: '3. Symptom Assessment',
      fields: symptomFields.length
        ? symptomFields
        : [{ label: 'Symptoms', key: 'symptoms', format: () => '' }],
    },
    {
      title: '3b. Pain Review',
      fields: [
        { label: 'Pain Score', key: 'painScore' },
        { label: 'Pain Location', key: 'painLocation' },
        { label: 'Pain Character', key: 'painCharacter' },
        { label: 'Current Pain Management', key: 'currentPainManagement' },
        { label: 'Response to Treatment', key: 'responseToTreatment' },
        { label: 'Breakthrough Episodes', key: 'breakthroughPainEpisodes' },
        { label: 'Breakthrough Frequency', key: 'breakthroughPainFrequency' },
      ],
    },
    {
      title: '4. Respiratory Status',
      fields: [
        { label: 'Breathing', key: 'breathing' },
        { label: 'Oxygen Therapy', key: 'oxygenTherapy' },
        { label: 'Oxygen Delivery', key: 'oxygenDelivery' },
        { label: 'Oxygen Delivery Other', key: 'oxygenDeliveryOther' },
        { label: 'Respiratory Secretions', key: 'respiratorySecretions' },
        { label: 'Cough', key: 'cough' },
        { label: 'Other Findings', key: 'otherRespiratoryFindings' },
      ],
    },
    {
      title: '5. Nutrition & Hydration',
      fields: [
        { label: 'Oral Intake', key: 'oralIntake' },
        { label: 'Diet', key: 'diet' },
        { label: 'Fluid Intake', key: 'fluidIntake' },
        { label: 'Feeding Assistance', key: 'feedingAssistance' },
        { label: 'Enteral Feeding', key: 'enteralFeeding' },
        { label: 'IV Fluids', key: 'ivFluids' },
        { label: 'Nausea/Vomiting Affecting Intake', key: 'nauseaVomitingAffectingIntake' },
        { label: 'Concerns', key: 'nutritionHydrationConcerns' },
      ],
    },
    {
      title: '6. Elimination',
      fields: [
        { label: 'Urine Output', key: 'urineOutput' },
        { label: 'Urinary Catheter', key: 'urinaryCatheter' },
        { label: 'Bowel Movement', key: 'bowelMovement' },
        { label: 'Last Bowel Movement', key: 'lastBowelMovement' },
        { label: 'Other Concerns', key: 'otherEliminationConcerns' },
      ],
    },
    {
      title: '7. Skin & Wound',
      fields: [
        { label: 'Skin', key: 'skin' },
        { label: 'Skin Other', key: 'skinOther' },
        { label: 'Pressure Injury', key: 'pressureInjury' },
        { label: 'Location / Stage', key: 'pressureInjuryLocationStage' },
        { label: 'Wound Care Provided', key: 'woundCareProvided' },
        { label: 'Changes', key: 'woundPressureInjuryChanges' },
      ],
    },
    {
      title: '8. Psychological / Emotional',
      fields: [
        { label: 'Mood / Behavior', key: 'moodBehavior' },
        { label: 'Psychological Distress', key: 'psychologicalDistress' },
        { label: 'Patient Concerns', key: 'patientsMainConcernsToday' },
        { label: 'Counseling Provided', key: 'counselingPsychologicalSupportProvided' },
      ],
    },
    {
      title: '9. Spiritual / Cultural',
      fields: [
        { label: 'Spiritual Distress', key: 'spiritualDistressIdentified' },
        { label: 'Concerns', key: 'patientsSpiritualCulturalConcerns' },
        { label: 'Care Provided', key: 'spiritualCareProvided' },
        { label: 'Referral Required', key: 'spiritualReferralRequired' },
        { label: 'Notes', key: 'spiritualNotes' },
      ],
    },
    {
      title: '10. Family / Caregiver',
      fields: [
        { label: 'Present', key: 'familyCaregiverPresent' },
        { label: 'Concerns', key: 'familyCaregiverConcerns' },
        { label: 'Education / Support', key: 'familyEducationSupportProvided' },
        { label: 'Meeting Held', key: 'familyMeetingHeld' },
        { label: 'Participants', key: 'familyMeetingParticipants' },
      ],
    },
    {
      title: '11. Goals of Care',
      fields: [
        { label: 'Current Goals', key: 'currentGoalsOfCare' },
        { label: 'Goals Other', key: 'currentGoalsOfCareOther' },
        { label: 'Goals Reviewed', key: 'goalsReviewedToday' },
        { label: 'Change Identified', key: 'changeInGoalsIdentified' },
        { label: 'Decision-Maker Preferences', key: 'patientDecisionMakerPreferences' },
        { label: 'Code Status', key: 'codeStatus' },
        { label: 'Code Status Other', key: 'codeStatusOther' },
        { label: 'ACP Reviewed', key: 'advanceCarePlanReviewed' },
      ],
    },
    {
      title: '12. Medication Review',
      fields: [
        { label: 'Regimen Reviewed', key: 'currentMedicationRegimenReviewed' },
        { label: 'Changes Made', key: 'changesMade' },
        { label: 'PRN Used', key: 'prnBreakthroughMedicationUsed' },
        { label: 'PRN Effectiveness', key: 'prnEffectiveness' },
        { label: 'Side Effects', key: 'medicationSideEffects' },
        { label: 'Side Effect Details', key: 'medicationSideEffectsDetail' },
      ],
    },
    {
      title: '13. Nursing / Supportive Care',
      fields: [
        { label: 'Care Provided', key: 'nursingSupportiveCareProvided' },
        { label: 'Other', key: 'nursingSupportiveCareOther' },
        { label: 'Response', key: 'responseToSupportiveCare' },
      ],
    },
    {
      title: '14. Investigations',
      fields: [
        { label: 'Performed / Reviewed', key: 'investigationsPerformedReviewed' },
        { label: 'Other', key: 'investigationsPerformedReviewedOther' },
        { label: 'Significant Results', key: 'significantResults' },
        { label: 'Action Taken', key: 'clinicalSignificanceActionTaken' },
      ],
    },
    {
      title: '15. MDT Review',
      fields: [
        {
          label: 'Disciplines',
          key: 'multidisciplinaryTeamReview',
          format: (rows: any[]) =>
            Array.isArray(rows) && rows.length
              ? rows
                  .filter((r) => r?.reviewIntervention)
                  .map((r) => `${r.discipline}: ${r.reviewIntervention}`)
                  .join(' · ') || ''
              : '',
        },
      ],
    },
    {
      title: '16. Clinical Assessment',
      fields: [
        { label: 'Overall Assessment', key: 'overallAssessment' },
        { label: 'Problems Identified', key: 'problemsIdentifiedToday' },
      ],
    },
    {
      title: '17. Plan',
      fields: [
        { label: 'Symptom Management', key: 'symptomManagementPlan' },
        { label: 'Medication Plan', key: 'medicationPlan' },
        { label: 'Nursing / Supportive Care', key: 'nursingSupportiveCarePlan' },
        { label: 'Investigations / Monitoring', key: 'investigationsMonitoring' },
        { label: 'Family / Caregiver', key: 'familyCaregiverPlan' },
        { label: 'Referrals / Consultations', key: 'referralsConsultations' },
        { label: 'Discharge / Transfer / Hospice', key: 'dischargeTransferHospicePlanning' },
      ],
    },
    {
      title: '18. SOAP',
      fields: [
        { label: 'Subjective', key: 'soapSubjective' },
        { label: 'Objective', key: 'soapObjective' },
        { label: 'Assessment', key: 'soapAssessment' },
        { label: 'Plan', key: 'soapPlan' },
      ],
    },
    {
      title: '19. Additional Notes',
      fields: [
        {
          label: 'Entries',
          key: 'additionalProgressNotes',
          format: (rows: any[]) =>
            Array.isArray(rows) && rows.length
              ? rows
                  .map(
                    (e) =>
                      `${e.date ?? ''} ${e.time ?? ''} — ${e.clinicianName ?? ''}: ${e.note ?? ''}`,
                  )
                  .join(' || ')
              : '',
        },
      ],
    },
    {
      title: '20. Signatures',
      fields: [
        {
          label: 'Responsible Clinician',
          key: 'responsibleClinician',
          format: (r: any) => (r?.name ? `${r.name} (${r.role ?? '—'})` : ''),
        },
        {
          label: 'Signatures',
          key: 'signatures',
          format: (sigs: any[]) =>
            Array.isArray(sigs) && sigs.length
              ? sigs
                  .map((s) => `${s.name} (${s.role}) — ${fmt(s.signedAt)}`)
                  .join(' · ')
              : '',
        },
        { label: 'All Signed', key: 'allSigned', boolean: true },
      ],
    },
  ].map((sec) => ({ ...sec, _enhanced: enhanced })) as PrintSection[];
};

// ── Hospice Nursing ──
const HOSPICE_SECTIONS: PrintSection[] = [
  {
    title: 'General Observation',
    fields: [
      { label: 'Level of Consciousness', key: 'levelOfConsciousness' },
      { label: 'Orientation', key: 'orientation' },
      { label: 'General Appearance', key: 'generalAppearance' },
    ],
  },
  {
    title: 'Vital Signs',
    fields: [
      { label: 'Blood Pressure', key: 'bloodPressure' },
      { label: 'Pulse Rate', key: 'pulseRate', format: (v) => (v ? `${v} bpm` : '') },
      { label: 'Respiratory Rate', key: 'respiratoryRate', format: (v) => (v ? `${v} /min` : '') },
      { label: 'Temperature', key: 'temperature', format: (v) => (v ? `${v} °C` : '') },
      { label: 'SpO₂', key: 'oxygenSaturation', format: (v) => (v ? `${v}%` : '') },
      { label: 'Weight', key: 'weightKg', format: (v) => (v ? `${v} kg` : '') },
      { label: 'Height', key: 'heightCm', format: (v) => (v ? `${v} cm` : '') },
    ],
  },
  {
    title: 'Pain Assessment',
    fields: [
      { label: 'Pain Present', key: 'painPresent', boolean: true },
      { label: 'Pain Score', key: 'painScore', format: (v) => (v != null ? `${v}/10` : '') },
      { label: 'Location', key: 'painLocation' },
      { label: 'Location Other', key: 'painLocationOther' },
      { label: 'Characteristics', key: 'painCharacteristics' },
      { label: 'Relief Measures', key: 'painReliefMeasures' },
      { label: 'Relief Other', key: 'painReliefOther' },
    ],
  },
  {
    title: 'Respiratory',
    fields: [
      { label: 'Breathing Pattern', key: 'breathingPattern' },
      { label: 'Dyspnea Severity', key: 'dyspneaSeverity' },
      { label: 'Oxygen Therapy', key: 'oxygenTherapy', boolean: true },
      { label: 'Oxygen Flow Rate', key: 'oxygenFlowRate' },
      { label: 'Cough', key: 'cough' },
      { label: 'Sputum Color', key: 'sputumColor' },
      { label: 'Notes', key: 'respiratoryNotes' },
    ],
  },
  {
    title: 'Cardiovascular',
    fields: [
      { label: 'Pulse Rhythm', key: 'pulseRhythm' },
      { label: 'Peripheral Edema', key: 'peripheralEdema' },
      { label: 'Edema Location', key: 'edemaLocation' },
      { label: 'Skin Color', key: 'skinColor' },
    ],
  },
  {
    title: 'Gastrointestinal',
    fields: [
      { label: 'Appetite', key: 'appetite' },
      { label: 'Nausea', key: 'nausea' },
      { label: 'Vomiting', key: 'vomiting', boolean: true },
      { label: 'Vomiting Frequency', key: 'vomitingFrequency' },
      { label: 'Bowel Function', key: 'bowelFunction' },
      { label: 'Last Bowel Movement', key: 'lastBowelMovement', format: (v) => (v ? fmt(v) : '') },
    ],
  },
  {
    title: 'Genitourinary',
    fields: [
      { label: 'Urinary Function', key: 'urinaryFunction' },
      { label: 'Urine Appearance', key: 'urineAppearance' },
    ],
  },
  {
    title: 'Skin & Pressure Injury',
    fields: [
      { label: 'Skin Integrity', key: 'skinIntegrity' },
      { label: 'Pressure Injury Risk', key: 'pressureInjuryRisk' },
      { label: 'Pressure Ulcer Present', key: 'pressureUlcerPresent', boolean: true },
      { label: 'Pressure Ulcer Location', key: 'pressureUlcerLocation' },
      { label: 'Pressure Ulcer Stage', key: 'pressureUlcerStage' },
    ],
  },
  {
    title: 'Mobility & Activities of Daily Living',
    fields: [
      { label: 'Mobility Status', key: 'mobilityStatus' },
      { label: 'Fall Risk', key: 'fallRisk' },
      { label: 'Assistive Devices', key: 'assistiveDevices' },
      { label: 'Assistive Devices Other', key: 'assistiveDevicesOther' },
      { label: 'Feeding', key: 'feeding' },
      { label: 'Bathing', key: 'bathing' },
      { label: 'Dressing', key: 'dressing' },
      { label: 'Toileting', key: 'toileting' },
      { label: 'Mobility', key: 'mobility' },
    ],
  },
  {
    title: 'Psychological',
    fields: [
      { label: 'Emotional Status', key: 'emotionalStatus' },
      { label: 'Communication', key: 'communicationAbility' },
      { label: 'Cognitive Status', key: 'cognitiveStatus' },
    ],
  },
  {
    title: 'Family & Caregiver',
    fields: [
      { label: 'Primary Caregiver', key: 'primaryCaregiverName' },
      { label: 'Relationship', key: 'primaryCaregiverRelationship' },
      { label: 'Phone', key: 'primaryCaregiverPhone' },
      { label: 'Family Support', key: 'familySupport' },
      { label: 'Caregiver Stress', key: 'caregiverStressLevel' },
    ],
  },
  {
    title: 'Spiritual / Cultural',
    fields: [
      { label: 'Spiritual Support Requested', key: 'spiritualSupportRequested', boolean: true },
      { label: 'Religious Affiliation', key: 'religiousAffiliation' },
      { label: 'Religious Affiliation Other', key: 'religiousAffiliationOther' },
      { label: 'Cultural Considerations', key: 'culturalConsiderations' },
    ],
  },
  {
    title: 'Nursing Diagnoses & Summary',
    fields: [
      { label: 'Nursing Diagnoses', key: 'nursingDiagnoses' },
      { label: 'Nursing Diagnoses Other', key: 'nursingDiagnosesOther' },
      { label: 'Nurse Summary', key: 'nurseSummary' },
    ],
  },
];

// ── Pain Assessment ──
const PAIN_SECTIONS: PrintSection[] = [
  {
    title: 'Assessment Overview',
    fields: [
      { label: 'Assessment Type', key: 'assessmentType' },
      { label: 'Pain Onset', key: 'painOnset' },
      { label: 'Pain Duration', key: 'painDuration' },
      { label: 'Current Pain Score', key: 'currentPainScore', format: (v) => (v != null ? `${v}/10` : '') },
      { label: 'Worst (24h)', key: 'worstPainLast24h', format: (v) => (v != null ? `${v}/10` : '') },
      { label: 'Least (24h)', key: 'leastPainLast24h', format: (v) => (v != null ? `${v}/10` : '') },
      { label: 'Opioid Use', key: 'opioidUse' },
      { label: 'Breakthrough Frequency', key: 'breakthroughFrequency' },
    ],
  },
  {
    title: 'Pain Characteristics',
    fields: [
      { label: 'Locations', key: 'painLocations' },
      { label: 'Location Other', key: 'painLocationOther' },
      { label: 'Descriptions', key: 'painDescriptions' },
      { label: 'Types', key: 'painType' },
      { label: 'Patterns', key: 'painPattern' },
      { label: 'Aggravating Factors', key: 'aggravatingFactors' },
      { label: 'Relieving Factors', key: 'relievingFactors' },
      { label: 'Relieving Other', key: 'relievingOther' },
    ],
  },
  {
    title: 'Clinical Assessment',
    fields: [
      { label: 'Diagnosis', key: 'diagnosis' },
      { label: 'Management Goals', key: 'managementGoals' },
      { label: 'Interventions', key: 'interventions' },
      { label: 'Non-Pharmacological Methods', key: 'nonPharmacologicalMethods' },
      { label: 'Monitoring Plan', key: 'monitoringPlan' },
    ],
  },
  {
    title: 'Summary',
    fields: [
      { label: 'Assessment Outcome', key: 'assessmentOutcome' },
      { label: 'Final Recommendations', key: 'finalRecommendations' },
    ],
  },
];

// ── Pharmacist Assessment ──
const PHARMACIST_SECTIONS: PrintSection[] = [
  {
    title: 'Header',
    fields: [
      { label: 'Assessment Type', key: 'assessmentType' },
      { label: 'Weight (kg)', key: 'weightKg' },
      { label: 'Ward / Unit', key: 'wardUnit' },
      { label: 'Allergies', key: 'allergies' },
    ],
  },
  {
    title: 'Medication History',
    fields: [
      { label: 'OTC / Herbal Used', key: 'otcHerbalUsed', boolean: true },
      { label: 'OTC / Herbal Details', key: 'otcHerbalDetails' },
      { label: 'Adherence', key: 'medicationHistoryAdherence' },
      { label: 'ADR History', key: 'hasAdrHistory', boolean: true },
      { label: 'ADR History Details', key: 'adrHistoryDetails' },
    ],
  },
  {
    title: 'Pain Management Review',
    fields: [
      { label: 'Non-Opioids', key: 'analgesicNonOpioids', boolean: true },
      { label: 'Weak Opioids', key: 'analgesicWeakOpioids', boolean: true },
      { label: 'Strong Opioids', key: 'analgesicStrongOpioids', boolean: true },
      { label: 'Adjuvants', key: 'analgesicAdjuvants', boolean: true },
      { label: 'Other Details', key: 'analgesicOtherDetails' },
      { label: 'Pain Control', key: 'painControl' },
      { label: 'Breakthrough Pain', key: 'breakthroughPain' },
      { label: 'Opioid Side Effects', key: 'opioidSideEffects' },
    ],
  },
  {
    title: 'Medication Safety',
    fields: [
      { label: 'Drug-Drug Interactions', key: 'drugDrugInteractions' },
      { label: 'Drug-Drug Details', key: 'drugDrugInteractionDetails' },
      { label: 'Drug-Disease Interactions', key: 'drugDiseaseInteractions', boolean: true },
      { label: 'Drug-Disease Details', key: 'drugDiseaseInteractionDetails' },
      { label: 'High-Risk Medications', key: 'highRiskMedications' },
    ],
  },
  {
    title: 'Renal & Hepatic',
    fields: [
      { label: 'Renal Function', key: 'renalFunction' },
      { label: 'Creatinine', key: 'creatinine' },
      { label: 'Hepatic Function', key: 'hepaticFunction' },
      { label: 'LFTs', key: 'lfts' },
    ],
  },
  {
    title: 'Adverse Drug Reactions',
    fields: [
      { label: 'Suspected ADR', key: 'suspectedAdr', boolean: true },
      { label: 'Suspected Drug', key: 'suspectedAdrDrug' },
      { label: 'Reaction', key: 'suspectedAdrReaction' },
      { label: 'Severity', key: 'adrSeverity' },
      { label: 'Management', key: 'adrManagement' },
    ],
  },
  {
    title: 'Bowel Management',
    fields: [
      { label: 'Bowel Function', key: 'bowelFunction' },
      { label: 'On Laxatives', key: 'laxativeUse', boolean: true },
      { label: 'Laxative Details', key: 'laxativeDetails' },
    ],
  },
  {
    title: 'Dose Adjustment',
    fields: [
      { label: 'Required', key: 'doseAdjustmentRequired', boolean: true },
      { label: 'Reasons', key: 'doseAdjustmentReasons' },
    ],
  },
  {
    title: 'Patient Counselling',
    fields: [
      { label: 'Understanding', key: 'patientUnderstanding' },
      { label: 'Topics Covered', key: 'counselingTopics' },
    ],
  },
  {
    title: 'Pharmaceutical Care Plan',
    fields: [
      { label: 'Issues Identified', key: 'currentIssuesIdentified' },
      { label: 'Plan Actions', key: 'medicationPlanActions' },
      { label: 'Other Action', key: 'medicationPlanOther' },
    ],
  },
  {
    title: 'Access & Supply',
    fields: [
      { label: 'Availability', key: 'medicationAvailability' },
      { label: 'Financial Barriers', key: 'financialBarriers', boolean: true },
      { label: 'Pharmacy Intervention', key: 'pharmacyIntervention', boolean: true },
    ],
  },
  {
    title: 'Summary & Recommendations',
    fields: [
      { label: 'Clinical Pharmacist', key: 'clinicalPharmacistName' },
      { label: 'Summary', key: 'pharmacistSummary' },
      { label: 'Summary Flags', key: 'summaryFlags' },
      { label: 'Recommendations', key: 'finalRecommendations' },
    ],
  },
];

// ── Physiotherapy Assessment ──
const PHYSIO_SECTIONS: PrintSection[] = [
  {
    title: 'Medical Overview',
    fields: [
      { label: 'Assessment Type', key: 'assessmentType' },
      { label: 'Comorbidities', key: 'comorbidities' },
      { label: 'Comorbidity Other', key: 'comorbidityOther' },
      { label: 'General Condition', key: 'generalCondition' },
    ],
  },
  {
    title: 'Pain & Symptoms',
    fields: [
      { label: 'Pain Level', key: 'painLevel' },
      { label: 'Pain Types', key: 'painTypes' },
      { label: 'Pain Type Other', key: 'painTypeOther' },
      { label: 'Symptoms', key: 'symptoms' },
    ],
  },
  {
    title: 'Functional Mobility',
    fields: [
      { label: 'Mobility Status', key: 'mobilityStatus' },
      { label: 'Transfer Ability', key: 'transferAbility' },
      { label: 'Walking Ability', key: 'walkingAbility' },
      { label: 'Assistive Devices', key: 'assistiveDevices' },
      { label: 'Assistive Device Other', key: 'assistiveDeviceOther' },
    ],
  },
  {
    title: 'Musculoskeletal',
    fields: [
      { label: 'Upper Limb Strength', key: 'upperLimbStrength' },
      { label: 'Lower Limb Strength', key: 'lowerLimbStrength' },
      { label: 'Range of Motion', key: 'rangeOfMotion' },
      { label: 'Joint Pain / Stiffness', key: 'jointPainOrStiffness' },
      { label: 'Joint Pain Location', key: 'jointPainLocation' },
    ],
  },
  {
    title: 'Neurological',
    fields: [
      { label: 'Consciousness', key: 'consciousness' },
      { label: 'Coordination', key: 'coordination' },
      { label: 'Sensory Deficit', key: 'sensoryDeficit' },
      { label: 'Balance', key: 'balance' },
    ],
  },
  {
    title: 'Respiratory',
    fields: [
      { label: 'Breathing Pattern', key: 'breathingPattern' },
      { label: 'Breathlessness', key: 'breathlessnessLevel' },
      { label: 'Chest Expansion', key: 'chestExpansion' },
      { label: 'Respiratory Needs', key: 'respiratoryNeeds' },
    ],
  },
  {
    title: 'Pressure Injury Risk',
    fields: [
      { label: 'Pressure Risk', key: 'pressureRisk' },
      { label: 'Pressure Areas', key: 'pressureAreas' },
      { label: 'Pressure Area Other', key: 'pressureAreaOther' },
      { label: 'Preventions', key: 'pressurePreventions' },
    ],
  },
  {
    title: 'ADL',
    fields: [
      {
        label: 'Activities',
        key: 'adl',
        format: (rows: any[]) =>
          Array.isArray(rows) && rows.length
            ? rows
                .filter((r) => r?.level)
                .map((r) => `${r.activity}: ${r.level}`)
                .join(' · ')
            : '',
      },
    ],
  },
  {
    title: 'Fall Risk',
    fields: [
      { label: 'Fall History', key: 'fallHistory', boolean: true },
      { label: 'Fall Risk Level', key: 'fallRiskLevel' },
      { label: 'Contributors', key: 'fallContributors' },
    ],
  },
  {
    title: 'Diagnosis & Care Plan',
    fields: [
      { label: 'Diagnoses', key: 'diagnosis' },
      { label: 'Goals', key: 'goals' },
      { label: 'Interventions', key: 'interventions' },
      { label: 'Frequency', key: 'frequency' },
      { label: 'Equipment', key: 'equipment' },
      { label: 'Caregiver Training', key: 'caregiverTrainings' },
    ],
  },
  {
    title: 'Summary',
    fields: [
      { label: 'Outcome', key: 'outcome' },
      { label: 'Final Recommendations', key: 'finalRecommendations' },
    ],
  },
];

// ── Family Assessment ──
const FAMILY_SECTIONS: PrintSection[] = [
  {
    title: 'Family Composition',
    fields: [
      { label: 'Assessment Type', key: 'assessmentType' },
      { label: 'Household Size', key: 'householdSize' },
      { label: 'Primary Decision Maker', key: 'primaryDecisionMaker' },
      { label: 'Decision Maker Name', key: 'primaryDecisionMakerName' },
    ],
  },
  {
    title: 'Primary Caregiver',
    fields: [
      { label: 'Name', key: 'primaryCaregiverName' },
      { label: 'Relationship', key: 'primaryCaregiverRelationship' },
      { label: 'Age', key: 'primaryCaregiverAge' },
      { label: 'Phone', key: 'primaryCaregiverPhone' },
    ],
  },
  {
    title: 'Secondary Caregiver',
    fields: [
      { label: 'Name', key: 'secondaryCaregiverName' },
      { label: 'Relationship', key: 'secondaryCaregiverRelationship' },
      { label: 'Phone', key: 'secondaryCaregiverPhone' },
    ],
  },
  {
    title: 'Caregiver Capacity',
    fields: [
      { label: 'Availability', key: 'caregiverAvailability' },
      { label: 'Physical Ability', key: 'physicalAbility' },
      { label: 'Emotional Readiness', key: 'emotionalReadiness' },
      { label: 'Knowledge of Illness', key: 'knowledgeOfIllness' },
    ],
  },
  {
    title: 'Support System',
    fields: [
      { label: 'Internal Support', key: 'internalSupport' },
      { label: 'External Support', key: 'externalSupport' },
      { label: 'Isolation Risk', key: 'socialIsolationRisk' },
    ],
  },
  {
    title: 'Financial Status',
    fields: [
      { label: 'Income Sources', key: 'incomeSources' },
      { label: 'Income Level', key: 'monthlyIncomeLevel' },
      { label: 'Financial Burden', key: 'financialBurden' },
      { label: 'Challenges', key: 'financialChallenges' },
    ],
  },
  {
    title: 'Living Conditions',
    fields: [
      { label: 'Housing Type', key: 'housingType' },
      { label: 'Other Housing Type', key: 'housingTypeOther' },
      { label: 'Home Environment', key: 'homeEnvironment' },
    ],
  },
  {
    title: 'Coping & Psychosocial',
    fields: [
      { label: 'Coping Ability', key: 'copingAbility' },
      { label: 'Family Emotional Status', key: 'familyEmotionalStatus' },
      { label: 'Anticipatory Grief', key: 'anticipatoryGrief' },
    ],
  },
  {
    title: 'Cultural & Religious',
    fields: [
      { label: 'Religious Affiliation', key: 'religiousAffiliation' },
      { label: 'Palliative Care Acceptance', key: 'palliativeCareAcceptance' },
      { label: 'Cultural Beliefs Affecting Care', key: 'culturalBeliefsAffectingCare' },
    ],
  },
  {
    title: 'Caregiver Burden',
    fields: [
      { label: 'Burden Level', key: 'burdenLevel' },
      { label: 'Burden Factors', key: 'burdenFactors' },
    ],
  },
  {
    title: 'Needs & Strengths',
    fields: [
      { label: 'Identified Needs', key: 'needs' },
      { label: 'Family Strengths', key: 'strengths' },
    ],
  },
  {
    title: 'Care Plan',
    fields: [
      { label: 'Planned Interventions', key: 'plannedInterventions' },
      { label: 'Support Services', key: 'supportServices' },
      { label: 'Follow-Up Plan', key: 'followUpPlan' },
    ],
  },
  {
    title: 'Summary',
    fields: [
      { label: 'Assessor', key: 'assessorName' },
      { label: 'Outcome', key: 'assessmentOutcome' },
      { label: 'Final Recommendations', key: 'finalRecommendations' },
    ],
  },
];

// ── Nutritional Assessment ──
const NUTRITION_SECTIONS: PrintSection[] = [
  {
    title: 'Anthropometric',
    fields: [
      { label: 'Assessment Type', key: 'assessmentType' },
      { label: 'Weight (kg)', key: 'weightKg' },
      { label: 'Height (cm)', key: 'heightCm' },
      { label: 'BMI', key: 'bmi' },
      { label: 'MUAC (cm)', key: 'muacCm' },
      { label: 'Recent Weight Loss (kg)', key: 'recentWeightLossKg' },
      { label: 'Weight Loss Period', key: 'weightLossPeriod' },
      { label: 'Status Classification', key: 'nutritionalStatusClassification' },
    ],
  },
  {
    title: 'Weight History',
    fields: [
      { label: 'Weight 6 mo ago', key: 'weightSixMonthsAgoKg' },
      { label: 'Weight 3 mo ago', key: 'weightThreeMonthsAgoKg' },
      { label: 'Current Weight', key: 'currentWeightKg' },
      { label: '% Weight Loss', key: 'percentageWeightLoss' },
      { label: 'Significant Weight Loss', key: 'significantWeightLoss' },
    ],
  },
  {
    title: 'Appetite',
    fields: [
      { label: 'Current Appetite', key: 'currentAppetite' },
      { label: 'Appetite Trend', key: 'appetiteTrend' },
      { label: 'Causes', key: 'appetiteCauses' },
      { label: 'Other Cause', key: 'appetiteCauseOther' },
    ],
  },
  {
    title: 'Dietary Intake',
    fields: [
      { label: 'Meals Per Day', key: 'mealsPerDay' },
      { label: 'Oral Intake', key: 'oralIntake' },
      { label: 'Fluid Intake', key: 'fluidIntake' },
      { label: 'Special Diet', key: 'specialDiet' },
      { label: 'Special Diet Details', key: 'specialDietSpecify' },
    ],
  },
  {
    title: 'Feeding',
    fields: [
      { label: 'Feeding Method', key: 'feedingMethod' },
      { label: 'Other Method', key: 'feedingMethodOther' },
      { label: 'Assistance Required', key: 'feedingAssistanceRequired' },
      { label: 'Difficulty Swallowing', key: 'difficultySwallowing', boolean: true },
      { label: 'Swallowing Details', key: 'difficultySwallowingDetails' },
    ],
  },
  {
    title: 'GI Symptoms',
    fields: [
      { label: 'Nausea', key: 'nauseaSeverity' },
      { label: 'Vomiting', key: 'vomitingSeverity' },
      { label: 'Constipation', key: 'constipationSeverity' },
      { label: 'Diarrhea', key: 'diarrheaSeverity' },
      { label: 'Abdominal Pain', key: 'abdominalPainSeverity' },
      { label: 'Bloating', key: 'bloatingSeverity' },
      { label: 'Mouth Sores', key: 'mouthSoresSeverity' },
    ],
  },
  {
    title: 'Functional Impact',
    fields: [
      { label: 'Energy Level', key: 'energyLevel' },
      { label: 'Meal Preparation', key: 'mealPreparation' },
      { label: 'Feeding Ability', key: 'feedingAbility' },
    ],
  },
  {
    title: 'Risk Screening',
    fields: [
      { label: 'Risk Factors', key: 'riskFactors' },
      { label: 'Overall Risk', key: 'overallNutritionalRisk' },
    ],
  },
  {
    title: 'Food Security',
    fields: [
      { label: 'Adequate Food Access', key: 'adequateFoodAccess', boolean: true },
      { label: 'Financial Barriers', key: 'financialBarriersToNutrition', boolean: true },
      { label: 'Requires Assistance', key: 'requiresNutritionalAssistance', boolean: true },
    ],
  },
  {
    title: 'Diagnosis & Plan',
    fields: [
      { label: 'Diagnoses', key: 'diagnoses' },
      { label: 'Other Diagnosis', key: 'diagnosisOther' },
      { label: 'Goals', key: 'nutritionalGoals' },
      { label: 'Interventions', key: 'interventions' },
      { label: 'Other Intervention', key: 'interventionOther' },
      { label: 'Monitoring Plans', key: 'monitoringPlans' },
      { label: 'Other Monitoring', key: 'monitoringOther' },
    ],
  },
  {
    title: 'Summary',
    fields: [
      { label: 'Outcome', key: 'assessmentOutcome' },
      { label: 'Final Recommendations', key: 'finalRecommendations' },
    ],
  },
];

// ── Social Assessment ──
const SOCIAL_SECTIONS: PrintSection[] = [
  {
    title: 'Family Composition',
    fields: [
      { label: 'Assessment Type', key: 'assessmentType' },
      { label: 'Household Size', key: 'householdSize' },
      { label: 'Living Arrangement', key: 'livingArrangement' },
      { label: 'Other Living Arrangement', key: 'livingArrangementOther' },
    ],
  },
  {
    title: 'Primary Caregiver',
    fields: [
      { label: 'Availability', key: 'caregiverAvailability' },
      { label: 'Health', key: 'caregiverHealth' },
      { label: 'Understanding', key: 'caregiverUnderstanding' },
      { label: 'Stress', key: 'caregiverStress' },
    ],
  },
  {
    title: 'Social Support',
    fields: [
      { label: 'Family Support', key: 'familySupport' },
      { label: 'Community Support', key: 'communitySupport' },
      { label: 'Contact Frequency', key: 'contactFrequency' },
      { label: 'Isolation Risk', key: 'isolationRisk' },
    ],
  },
  {
    title: 'Financial',
    fields: [
      { label: 'Income Sources', key: 'incomeSources' },
      { label: 'Other Income Source', key: 'incomeSourceOther' },
      { label: 'Monthly Income', key: 'monthlyHouseholdIncome' },
      { label: 'Financial Risk', key: 'financialRiskLevel' },
      { label: 'Challenges', key: 'financialChallenges' },
      { label: 'Other Challenge', key: 'financialChallengeOther' },
    ],
  },
  {
    title: 'Housing & Environment',
    fields: [
      { label: 'Residence Type', key: 'residenceType' },
      { label: 'Other Residence Type', key: 'residenceTypeOther' },
      { label: 'Home Environment', key: 'homeEnvironment' },
      { label: 'Home-Based Care Suitability', key: 'homeBasedCareSuitability' },
    ],
  },
  {
    title: 'Transportation',
    fields: [
      { label: 'Transport Access', key: 'transportAccess' },
      { label: 'Distance to Facility (km)', key: 'distanceToHealthFacilityKm' },
      { label: 'Challenges', key: 'transportChallenges' },
      { label: 'Other Challenge', key: 'transportChallengeOther' },
    ],
  },
  {
    title: 'Employment & Education',
    fields: [
      { label: 'Employment Status', key: 'employmentStatus' },
      { label: 'Education Level', key: 'educationLevel' },
    ],
  },
  {
    title: 'Cultural & Spiritual',
    fields: [
      { label: 'Religious Affiliation', key: 'religiousAffiliation' },
      { label: 'Other Affiliation', key: 'religiousAffiliationOther' },
      { label: 'Spiritual Support Available', key: 'spiritualSupportAvailable', boolean: true },
      { label: 'Cultural Factors', key: 'culturalFactorsAffectingCare' },
    ],
  },
  {
    title: 'Legal & Advocacy',
    fields: [
      { label: 'Has Legal Representative', key: 'hasLegalRepresentative', boolean: true },
      { label: 'Advance Directives', key: 'advanceDirectivesAvailable', boolean: true },
      { label: 'Legal Concerns', key: 'legalConcerns' },
      { label: 'Other Concern', key: 'legalConcernOther' },
    ],
  },
  {
    title: 'Bereavement Risk',
    fields: [
      { label: 'Family Prepared', key: 'familyPreparedForPrognosis' },
      { label: 'Anticipatory Grief', key: 'anticipatoryGrief' },
      { label: 'Bereavement Risk', key: 'bereavementRisk' },
      { label: 'Family Requires Support', key: 'familyRequiresSupport', boolean: true },
    ],
  },
  {
    title: 'Social Work Assessment',
    fields: [
      { label: 'Major Issues', key: 'majorSocialIssues' },
      { label: 'Other Issue', key: 'majorSocialIssueOther' },
      { label: 'Strengths & Resources', key: 'strengthsAndResources' },
      { label: 'Areas Requiring Intervention', key: 'areasRequiringIntervention' },
    ],
  },
  {
    title: 'Care Plan & Summary',
    fields: [
      { label: 'Planned Interventions', key: 'plannedInterventions' },
      { label: 'Other Intervention', key: 'plannedInterventionOther' },
      { label: 'Follow-Up Plan', key: 'followUpPlan' },
      { label: 'Outcome', key: 'assessmentOutcome' },
    ],
  },
];

// ── Spiritual Assessment ──
const SPIRITUAL_SECTIONS: PrintSection[] = [
  {
    title: 'Religious Background',
    fields: [
      { label: 'Assessment Type', key: 'assessmentType' },
      { label: 'Religious Affiliation', key: 'religiousAffiliation' },
      { label: 'Other Affiliation', key: 'religiousAffiliationOther' },
      { label: 'Faith Importance', key: 'faithImportance' },
      { label: 'Activity Participation', key: 'activityParticipation' },
      { label: 'Place of Worship', key: 'placeOfWorship' },
    ],
  },
  {
    title: 'Spiritual Support',
    fields: [
      { label: 'Support Sources', key: 'supportSources' },
      { label: 'Religious Leader', key: 'religiousLeaderName' },
      { label: 'Organization', key: 'religiousLeaderOrganization' },
      { label: 'Phone', key: 'religiousLeaderPhone' },
    ],
  },
  {
    title: 'Beliefs & Values',
    fields: [
      { label: 'Meaning & Purpose', key: 'lifeMeaningAndPurpose' },
      { label: 'Sources of Strength', key: 'sourcesOfStrength' },
      { label: 'Practices to Continue', key: 'practicesToContinue', boolean: true },
      { label: 'Practices Details', key: 'practicesToContinueDetails' },
      { label: 'Rituals to Respect', key: 'ritualsToRespect', boolean: true },
      { label: 'Rituals Details', key: 'ritualsToRespectDetails' },
    ],
  },
  {
    title: 'Distress Assessment',
    fields: [
      { label: 'Distress Level', key: 'spiritualDistressLevel' },
      { label: 'Concerns Description', key: 'spiritualConcernsDescription' },
    ],
  },
  {
    title: 'Hope & Coping',
    fields: [
      { label: 'Current Hopes', key: 'currentHopes' },
      { label: 'Coping Methods', key: 'copingMethods' },
      { label: 'Other Method', key: 'copingMethodOther' },
      { label: 'Feels at Peace', key: 'feelsAtPeace' },
    ],
  },
  {
    title: 'Family & Spiritual',
    fields: [
      { label: 'Family Shares Beliefs', key: 'familySharesBeliefs' },
      { label: 'Family Benefits', key: 'familyBenefitFromSupport', boolean: true },
      { label: 'Family Concerns', key: 'familySpiritualConcerns' },
    ],
  },
  {
    title: 'End-of-Life Preferences',
    fields: [
      { label: 'Preferred End-of-Life Care', key: 'preferredEndOfLifeCare' },
      { label: 'Other Preference', key: 'preferredEndOfLifeCareOther' },
      { label: 'Preferred Place of Care', key: 'preferredPlaceOfCare' },
      { label: 'Other Care Place', key: 'preferredPlaceOfCareOther' },
      { label: 'Preferred Place of Death', key: 'preferredPlaceOfDeath' },
      { label: 'Religious Practices After Death', key: 'religiousPracticesAfterDeath' },
    ],
  },
  {
    title: 'Strengths & Needs',
    fields: [
      { label: 'Patient Strengths', key: 'patientStrengths' },
      { label: 'Other Strength', key: 'patientStrengthOther' },
      { label: 'Additional Strengths', key: 'additionalStrengths' },
      { label: 'Identified Needs', key: 'identifiedNeeds' },
      { label: 'Other Need', key: 'identifiedNeedOther' },
    ],
  },
  {
    title: 'Care Plan & Summary',
    fields: [
      { label: 'Planned Interventions', key: 'plannedInterventions' },
      { label: 'Follow-Up Schedule', key: 'followUpSchedule' },
      { label: 'Provider Summary', key: 'summaryOfAssessment' },
      { label: 'Provider Distress Level', key: 'providerDistressLevel' },
      { label: 'Recommended Services', key: 'recommendedServices' },
      { label: 'Outcome', key: 'assessmentOutcome' },
    ],
  },
];

// ── Psychiatry Assessment ──
const PSYCHIATRY_SECTIONS: PrintSection[] = [
  {
    title: 'Presenting Problem',
    fields: [
      { label: 'Assessment Type', key: 'assessmentType' },
      { label: 'Reason for Referral', key: 'reasonForReferral' },
      { label: 'Current Symptoms', key: 'currentSymptoms' },
      { label: 'Other Symptom', key: 'symptomOther' },
      { label: 'Onset & Duration', key: 'onsetAndDuration' },
      { label: 'Severity', key: 'severity' },
    ],
  },
  {
    title: 'Mental State Examination',
    fields: [
      { label: 'Appearance & Behavior', key: 'appearanceBehavior' },
      { label: 'Speech', key: 'speech' },
      { label: 'Mood', key: 'mood' },
      { label: 'Affect', key: 'affect' },
      { label: 'Thought Process', key: 'thoughtProcess' },
      { label: 'Thought Content', key: 'thoughtContent' },
      { label: 'Perception', key: 'perception' },
      { label: 'Cognition', key: 'cognition' },
      { label: 'Insight & Judgment', key: 'insightJudgment' },
    ],
  },
  {
    title: 'Suicide Risk',
    fields: [
      { label: 'Suicidal Ideation', key: 'suicidalIdeation' },
      { label: 'Suicide Risk Level', key: 'suicideRiskLevel' },
      { label: 'Protective Factors', key: 'protectiveFactors' },
    ],
  },
  {
    title: 'Organic Causes',
    fields: [
      { label: 'Organic Causes', key: 'organicCauses' },
      { label: 'Medications Affecting State', key: 'medicationsAffectingMentalState' },
    ],
  },
  {
    title: 'Sleep, Appetite & Function',
    fields: [
      { label: 'Sleep Pattern', key: 'sleepPattern' },
      { label: 'Appetite', key: 'appetite' },
      { label: 'Daily Functioning', key: 'dailyFunctioning' },
      { label: 'Social Withdrawal', key: 'socialWithdrawal' },
    ],
  },
  {
    title: 'Diagnosis',
    fields: [
      { label: 'Diagnoses', key: 'diagnoses' },
      { label: 'Other Diagnosis', key: 'diagnosisOther' },
    ],
  },
  {
    title: 'Psychiatric Care Plan',
    fields: [
      { label: 'Immediate Interventions', key: 'immediateInterventions' },
      { label: 'Pharmacological Plan', key: 'pharmacologicalPlan' },
      { label: 'Non-Pharmacological Plan', key: 'nonPharmacologicalPlan' },
      { label: 'Monitoring Plan', key: 'monitoringPlan' },
    ],
  },
  {
    title: 'Family & Caregiver',
    fields: [
      { label: 'Family Distress Level', key: 'familyDistressLevel' },
      { label: 'Caregiver Burnout', key: 'caregiverBurnout', boolean: true },
      { label: 'Family Counseling Needed', key: 'familyCounselingNeeded', boolean: true },
    ],
  },
  {
    title: 'Summary & Recommendations',
    fields: [
      { label: 'Outcome', key: 'assessmentOutcome' },
      { label: 'Final Recommendations', key: 'finalRecommendations' },
    ],
  },
];

// ── Public API types ─────────────────────────────────────────────

interface PrintReportData {
  patient: Patient;
  visits: HomeVisit[];
  medications: Medication[];
  labs: LaboratoryTest[];
  imaging?: ImagingOrder[];
  referrals: Referral[];
  admissions: HospitalAdmission[];
  progressNotes?: ProgressNote[];
  hospiceNursing?: HospiceNursingAssessment[];
  painAssessments?: PainAssessment[];
  pharmacistAssessments?: ClinicalPharmacistAssessment[];
  physiotherapyAssessments?: PhysiotherapyAssessment[];
  familyAssessments?: FamilyAssessment[];
  nutritionalAssessments?: NutritionalAssessment[];
  socialAssessments?: SocialAssessment[];
  spiritualAssessments?: SpiritualAssessment[];
  psychiatryAssessments?: PsychiatryAssessment[];
  appName?: string;
}

// ═══════════════════════════════════════════════════════════════
// Main export
// ═══════════════════════════════════════════════════════════════

export function printPatientReport(data: PrintReportData): void {
  const {
    patient,
    visits,
    medications,
    labs,
    imaging = [],
    referrals,
    admissions,
    progressNotes = [],
    hospiceNursing = [],
    painAssessments = [],
    pharmacistAssessments = [],
    physiotherapyAssessments = [],
    familyAssessments = [],
    nutritionalAssessments = [],
    socialAssessments = [],
    spiritualAssessments = [],
    psychiatryAssessments = [],
    appName = 'Palliative Care System',
  } = data;

  const generatedAt = new Date().toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // ── 1. Patient Information ───────────────────────────────────
  const patientInfo = section(
    'Patient Information',
    infoGrid([
      ['Full Name', `${patient.firstName} ${patient.lastName}`],
      ['Patient ID', patientDisplayId(patient)],
      ['Age', `${patient.age} years`],
      ['Sex', safe(patient.sex)],
      ['Date of Birth', fmt(patient.dateOfBirth)],
      ['Address', safe(patient.address)],
      ['Phone', safe(patient.phone)],
      [
        'Current Location',
        patient.currentLocation === 'ReferredHospital'
          ? 'Referred Hospital'
          : 'Home',
      ],
      ['Status', safe(patient.status)],
      ['Primary Diagnosis', safe(patient.primaryDiagnosis)],
      [
        'Secondary Diagnoses',
        patient.secondaryDiagnoses?.length
          ? patient.secondaryDiagnoses.join(', ')
          : '—',
      ],
      [
        'Disease Stage',
        DISEASE_STAGE_LABELS[patient.diseaseStage] ?? safe(patient.diseaseStage),
      ],
      [
        'Comorbidities',
        patient.comorbidities?.length
          ? patient.comorbidities.join(', ')
          : '—',
      ],
      ['Prognosis', safe(patient.estimatedPrognosis)],
      ['Registered', fmt(patient.createdAt)],
      [
        'Emergency Contact',
        `${safe(patient.emergencyContactName)} · ${safe(patient.emergencyContactPhone)}`,
      ],
      [
        'Caregiver',
        `${safe(patient.caregiverName)} · ${safe(patient.caregiverPhone)}`,
      ],
    ]),
  );

  // ── 2. Visits ────────────────────────────────────────────────
  const visitHistory = section(
    'Visit History',
    visits.length
      ? visits.map(renderVisitBlock).join('')
      : '<p style="color:#8290A7;font-style:italic;font-size:9.5pt">No visit records found.</p>',
  );

  // ── 3. Medications ───────────────────────────────────────────
  const medicationSection = section(
    'Medications',
    table(
      ['Medication', 'Dosage', 'Frequency', 'Route', 'Administered At', 'Status', 'Date Ordered'],
      medications.map((m) => [
        safe(m.name),
        safe(m.dosage),
        safe(m.frequency),
        safe(m.route),
        safe(m.administeredAt),
        statusBadge(m.status),
        fmt(m.createdAt),
      ]),
    ),
  );

  // ── 4. Labs ──────────────────────────────────────────────────
  const labSection = section(
    'Laboratory Tests',
    table(
      ['Test Name', 'Category', 'Date Ordered', 'Date Performed', 'Location', 'Status', 'Result'],
      labs.map((l) => [
        safe(l.testName),
        safe(l.category),
        fmt(l.dateOrdered),
        l.datePerformed ? fmt(l.datePerformed) : '—',
        safe(l.location),
        statusBadge(l.status),
        `<span style="white-space:pre-wrap">${safe(l.result)}</span>`,
      ]),
    ),
  );

  // ── 5. Imaging Orders ────────────────────────────────────────
  const imagingSection = section(
    'Imaging Orders',
    imaging.length
      ? imaging
          .map((o: any) => {
            const report = o.report ?? {};
            return `
              <div class="assessment-block">
                <h3>${safe(o.modality)} — ${safe(o.bodyRegion)} <span style="font-weight:400;color:#52627A;font-size:9pt">(${statusBadge(o.status)})</span></h3>
                <div class="row"><span class="lbl">Date Ordered</span><span class="val">${fmt(o.dateOrdered ?? o.createdAt)}</span></div>
                <div class="row"><span class="lbl">Priority</span><span class="val">${safe(o.priority)}</span></div>
                <div class="row"><span class="lbl">Laterality</span><span class="val">${safe(o.laterality)}</span></div>
                <div class="row"><span class="lbl">Specific Site</span><span class="val">${safe(o.specificSite)}</span></div>
                <div class="row"><span class="lbl">Provisional Diagnosis</span><span class="val">${safe(o.provisionalDiagnosis)}</span></div>
                <div class="row"><span class="lbl">Clinical Question</span><span class="val">${safe(o.specialClinicalQuestion)}</span></div>
                <div class="row"><span class="lbl">Contrast Requested</span><span class="val">${safe(o.contrastRequested)}</span></div>
                <div class="row"><span class="lbl">Performed At</span><span class="val">${o.performedAt ? fmt(o.performedAt) : '—'}</span></div>
                <div class="row"><span class="lbl">Image Quality</span><span class="val">${safe(o.imageQuality)}</span></div>
                ${
                  report.findings
                    ? `<div class="row"><span class="lbl">Findings</span><span class="val">${safe(report.findings)}</span></div>`
                    : ''
                }
                ${
                  report.impression
                    ? `<div class="row"><span class="lbl">Impression</span><span class="val">${safe(report.impression)}</span></div>`
                    : ''
                }
                ${
                  report.recommendations
                    ? `<div class="row"><span class="lbl">Recommendations</span><span class="val">${safe(report.recommendations)}</span></div>`
                    : ''
                }
                ${
                  o.report?.reportingPhysician
                    ? `<div class="row"><span class="lbl">Reporting Physician</span><span class="val">${safe(o.report.reportingPhysician)}</span></div>`
                    : ''
                }
                ${
                  o.report?.reportDate
                    ? `<div class="row"><span class="lbl">Report Date</span><span class="val">${fmt(o.report.reportDate)}</span></div>`
                    : ''
                }
              </div>
            `;
          })
          .join('')
      : '<p style="color:#8290A7;font-style:italic;font-size:9.5pt">No imaging orders found.</p>',
  );

  // ── 6. Referrals ─────────────────────────────────────────────
  const referralSection = section(
    'Referrals',
    table(
      ['Date', 'Type', 'From', 'To', 'Status', 'Reasons'],
      referrals.map((r) => [
        fmt(r.referralDate),
        safe(r.referralType),
        safe(r.referringFacility),
        safe(r.receivingFacility),
        statusBadge(r.status),
        labelList(r.reasons, REFERRAL_REASON_LABELS),
      ]),
    ),
  );

  // ── 7. Admissions ────────────────────────────────────────────
  const admissionSection = section(
    'Hospital Admissions',
    table(
      ['Admission Date', 'Bed', 'Ward', 'Physician', 'Care Team', 'Status', 'Discharge Date'],
      admissions.map((a) => [
        fmt(a.admissionDate),
        safe(a.bedNumber),
        safe(a.ward),
        safe(a.admittingPhysician),
        safe(a.careTeam),
        statusBadge(a.status),
        a.dischargeDate ? fmt(a.dischargeDate) : 'Ongoing',
      ]),
    ),
  );

  // ── 8. Progress Notes ────────────────────────────────────────
  const progressNoteSection = section(
    'Progress Notes',
    progressNotes.length
      ? progressNotes
          .map((n) => {
            const sections = buildProgressNoteSections(n);
            const enhanced: any = { ...n };
            const painKeys = [
              'Pain', 'Shortness of Breath', 'Nausea', 'Vomiting', 'Constipation',
              'Diarrhea', 'Fatigue', 'Anxiety', 'Delirium/Confusion', 'Insomnia',
              'Appetite Loss', 'Other',
            ];
            painKeys.forEach((key) => {
              const row = (n as any).symptoms?.[key];
              if (row) {
                enhanced[`__symptom_${key}`] = `${row.severity ?? 'None'}${row.notes ? ` — ${row.notes}` : ''}`;
              }
            });
            return renderSectionedAssessment(
              'Progress Note',
              n.createdAt,
              n.attendingClinician ?? '—',
              sections,
              enhanced,
            );
          })
          .join('')
      : '<p style="color:#8290A7;font-style:italic;font-size:9.5pt">No progress notes found.</p>',
  );

  // ── 9. Hospice Nursing ───────────────────────────────────────
  const hospiceSection = section(
    'Hospice Nursing Assessments',
    hospiceNursing.length
      ? hospiceNursing
          .map((h: any) =>
            renderSectionedAssessment(
              'Hospice Nursing',
              h.assessmentDate,
              h.assessedBy?.name ?? h.enteredBy?.name ?? '—',
              HOSPICE_SECTIONS,
              h,
            ),
          )
          .join('')
      : '<p style="color:#8290A7;font-style:italic;font-size:9.5pt">No hospice nursing assessments found.</p>',
  );

  // ── 10. Pain Assessments ─────────────────────────────────────
  const painSection = section(
    'Pain Assessments',
    painAssessments.length
      ? painAssessments
          .map((a: any) =>
            renderSectionedAssessment(
              'Pain Assessment',
              a.createdAt,
              a.assessmentType ?? '—',
              PAIN_SECTIONS,
              a,
            ),
          )
          .join('')
      : '<p style="color:#8290A7;font-style:italic;font-size:9.5pt">No pain assessments found.</p>',
  );

  // ── 11. Pharmacist Assessments ───────────────────────────────
  const pharmacistSection = section(
    'Pharmacist Assessments',
    pharmacistAssessments.length
      ? pharmacistAssessments
          .map((a: any) =>
            renderSectionedAssessment(
              'Pharmacist Assessment',
              a.createdAt,
              a.assessmentType ?? '—',
              PHARMACIST_SECTIONS,
              a,
            ),
          )
          .join('')
      : '<p style="color:#8290A7;font-style:italic;font-size:9.5pt">No pharmacist assessments found.</p>',
  );

  // ── 12. Physiotherapy Assessments ────────────────────────────
  const physioSection = section(
    'Physiotherapy Assessments',
    physiotherapyAssessments.length
      ? physiotherapyAssessments
          .map((a: any) =>
            renderSectionedAssessment(
              'Physiotherapy Assessment',
              a.createdAt,
              a.assessmentType ?? '—',
              PHYSIO_SECTIONS,
              a,
            ),
          )
          .join('')
      : '<p style="color:#8290A7;font-style:italic;font-size:9.5pt">No physiotherapy assessments found.</p>',
  );

  // ── 13. Family Assessments ───────────────────────────────────
  const familySection = section(
    'Family Assessments',
    familyAssessments.length
      ? familyAssessments
          .map((a: any) =>
            renderSectionedAssessment(
              'Family Assessment',
              a.createdAt,
              a.assessmentType ?? '—',
              FAMILY_SECTIONS,
              a,
            ),
          )
          .join('')
      : '<p style="color:#8290A7;font-style:italic;font-size:9.5pt">No family assessments found.</p>',
  );

  // ── 14. Nutritional Assessments ──────────────────────────────
  const nutritionSection = section(
    'Nutritional Assessments',
    nutritionalAssessments.length
      ? nutritionalAssessments
          .map((a: any) =>
            renderSectionedAssessment(
              'Nutritional Assessment',
              a.createdAt,
              a.assessmentType ?? '—',
              NUTRITION_SECTIONS,
              a,
            ),
          )
          .join('')
      : '<p style="color:#8290A7;font-style:italic;font-size:9.5pt">No nutritional assessments found.</p>',
  );

  // ── 15. Social Assessments ───────────────────────────────────
  const socialSection = section(
    'Social Assessments',
    socialAssessments.length
      ? socialAssessments
          .map((a: any) =>
            renderSectionedAssessment(
              'Social Assessment',
              a.createdAt,
              a.assessmentType ?? '—',
              SOCIAL_SECTIONS,
              a,
            ),
          )
          .join('')
      : '<p style="color:#8290A7;font-style:italic;font-size:9.5pt">No social assessments found.</p>',
  );

  // ── 16. Spiritual Assessments ────────────────────────────────
  const spiritualSection = section(
    'Spiritual Assessments',
    spiritualAssessments.length
      ? spiritualAssessments
          .map((a: any) =>
            renderSectionedAssessment(
              'Spiritual Assessment',
              a.createdAt,
              a.assessmentType ?? '—',
              SPIRITUAL_SECTIONS,
              a,
            ),
          )
          .join('')
      : '<p style="color:#8290A7;font-style:italic;font-size:9.5pt">No spiritual assessments found.</p>',
  );

  // ── 17. Psychiatry Assessments ───────────────────────────────
  const psychiatrySection = section(
    'Psychiatry Assessments',
    psychiatryAssessments.length
      ? psychiatryAssessments
          .map((a: any) =>
            renderSectionedAssessment(
              'Psychiatry Assessment',
              a.createdAt,
              a.assessmentType ?? '—',
              PSYCHIATRY_SECTIONS,
              a,
            ),
          )
          .join('')
      : '<p style="color:#8290A7;font-style:italic;font-size:9.5pt">No psychiatry assessments found.</p>',
  );

  // ── Assemble HTML ────────────────────────────────────────────
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Patient Report — ${patient.firstName} ${patient.lastName}</title>
  <style>${CSS}</style>
</head>
<body>

  <div class="report-header">
    <div>
      <div class="brand">&#9829; ${appName}</div>
      <div class="brand-sub">Palliative Patient Monitoring System · Yekatit 12 Hospital Medical College</div>
    </div>
    <div class="meta">
      <strong>PATIENT HISTORY REPORT</strong>
      Generated: ${generatedAt}
    </div>
  </div>

  <div class="patient-banner">
    <div>
      <div class="name">${patient.firstName} ${patient.lastName}</div>
      <div class="pid">${patientDisplayId(patient)}</div>
    </div>
    <div class="badges">
      ${statusBadge(patient.status)}
      ${statusBadge(patient.currentLocation)}
      <span class="badge badge-default">${DISEASE_STAGE_LABELS[patient.diseaseStage] ?? patient.diseaseStage}</span>
    </div>
  </div>

  ${patientInfo}
  ${visitHistory}
  ${medicationSection}
  ${labSection}
  ${imagingSection}
  ${referralSection}
  ${admissionSection}
  ${progressNoteSection}
  ${hospiceSection}
  ${painSection}
  ${pharmacistSection}
  ${physioSection}
  ${familySection}
  ${nutritionSection}
  ${socialSection}
  ${spiritualSection}
  ${psychiatrySection}

  <div class="report-footer">
    <span>${appName} — Confidential Medical Record</span>
    <span>Generated ${generatedAt}</span>
  </div>

</body>
</html>`;

  // ── Print via hidden iframe ──────────────────────────────────
  const iframe = document.createElement('iframe');
  iframe.style.cssText =
    'position:fixed;top:0;left:0;width:0;height:0;border:0;visibility:hidden;';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    document.body.removeChild(iframe);
    return;
  }

  doc.open();
  doc.write(html);
  doc.close();

  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => document.body.removeChild(iframe), 1000);
  }, 400);
}