/**
 * printPatientReport
 * ------------------
 * Builds a self-contained HTML document from patient data and opens
 * the browser's native Print dialog (File → Save as PDF).
 */

import type { Patient } from '@/types/patient.types';
import type { HomeVisit } from '@/types/visit.types';
import type { Medication } from '@/types/medication.types';
import type { LaboratoryTest } from '@/types/lab.types';
import type { Referral } from '@/types/referral.types';
import type { HospitalAdmission } from '@/types/admission.types';
import type { ProgressNoteListItem } from '@/hooks/useProgressNotes';
import type { HospiceNursingAssessmentListItem } from '@/types/hospice-nursing.types';
import type { PainAssessmentListItem } from '@/types/pain-assessment.types';
import type { ClinicalPharmacistAssessmentListItem } from '@/types/pharmacist-assessment.types';
import type { PhysiotherapyAssessmentListItem } from '@/types/physiotherapy-assessment.types';
import type { FamilyAssessmentListItem } from '@/types/family-assessment.types';
import type { NutritionalAssessmentListItem } from '@/types/nutritional-assessment.types';
import type { SocialAssessmentListItem } from '@/types/social-assessment.types';
import type { SpiritualAssessmentListItem } from '@/types/spiritual-assessment.types';
import type { PsychiatryAssessmentListItem } from '@/types/psychiatry-assessment.types';

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
const num = (
  n: number | null | undefined,
  suffix = '',
): string => {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  return `${n}${suffix}`;
};

const labelList = (arr: string[] | undefined, map: Record<string, string>) =>
  arr?.length ? arr.map((k) => map[k] ?? k).join(', ') : '—';

/**
 * Derive a stable patient ID.
 * Prefers `hospitalPatientId` (real MRN) when set, falls back to
 * `patientDisplayId` (system ID like PAT-0001), then derives from
 * the numeric PK.
 */
const patientDisplayId = (
  p: Patient & { id?: string | number },
): string => {
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
              (r) =>
                `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`,
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

// ── Cover CSS ────────────────────────────────────────────────────

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

  .assessment-block {
    border: 1px solid #E6EBF4; border-radius: 4px;
    padding: 10px 12px; margin-bottom: 10px;
    page-break-inside: avoid;
  }
  .assessment-block h3 {
    font-size: 10pt; font-weight: 700; color: #002395;
    margin-bottom: 6px;
  }
  .assessment-block .row {
    display: flex; gap: 8px; padding: 2px 0; font-size: 9.5pt;
  }
  .assessment-block .row .lbl { color: #52627A; min-width: 150px; flex-shrink: 0; }
  .assessment-block .row .val { color: #1a1a2e; }

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
//
// The backend returns vitals + ADL as FLAT columns on the visit
// record, but the API contract exposes them nested. Handle both:
// prefer the nested object when present, else read the flat fields.

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
    // Note: backend capitalises `Mobility` in the Prisma model.
    mobility: v.Mobility ?? v.mobility,
  };
};

// ── Visit block renderer ─────────────────────────────────────────

const renderVisitBlock = (v: HomeVisit): string => {
  const vitals = visitVitals(v);
  const adl = visitAdl(v);

  const symptoms =
    (v.symptoms ?? []).map((s) => SYMPTOM_LABELS[s] ?? s).join(', ') ||
    '—';

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
          ${v.nextVisitDate ? `<div class="vb-row"><span class="vb-label">Next Visit</span><span class="vb-value">${fmt(v.nextVisitDate)}</span></div>` : ''}
          <div class="vb-row"><span class="vb-label">Team Members</span><span class="vb-value">${team}</span></div>
          <div class="vb-row"><span class="vb-label">Vitals</span><span class="vb-value">T ${safe(vitals.temperature)}°C · P ${safe(vitals.pulse)} · BP ${safe(vitals.bloodPressure)} · RR ${safe(vitals.respiration)} · SpO₂ ${safe(vitals.spO2)}%</span></div>
          <div class="vb-row"><span class="vb-label">ADL</span><span class="vb-value">Feed ${safe(adl.feeding)} · Bathe ${safe(adl.bathing)} · Dress ${safe(adl.dressing)} · Toilet ${safe(adl.toileting)} · Mobil ${safe(adl.mobility)}</span></div>
        </div>
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

// ── Generic assessment block renderer ────────────────────────────

interface AssessmentField {
  label: string;
  value: (row: any) => string;
}

const renderAssessmentBlock = (
  title: string,
  date: string,
  typeLabel: string,
  fields: AssessmentField[],
  row: any,
): string => {
  const rows = fields
    .map((f) => {
      const v = f.value(row);
      if (!v || v === '—' || v === '-') return '';
      return `<div class="row"><span class="lbl">${f.label}</span><span class="val">${v}</span></div>`;
    })
    .join('');

  return `
    <div class="assessment-block">
      <h3>${title} — ${fmt(date)} <span style="font-weight:400;color:#52627A;font-size:9pt">(${typeLabel})</span></h3>
      ${rows || '<div class="row"><span class="val" style="color:#8290A7;font-style:italic">No data recorded</span></div>'}
    </div>`;
};

// ── Section builders ─────────────────────────────────────────────

interface PrintReportData {
  patient: Patient;
  visits: HomeVisit[];
  medications: Medication[];
  labs: LaboratoryTest[];
  referrals: Referral[];
  admissions: HospitalAdmission[];
  progressNotes?: ProgressNoteListItem[];
  hospiceNursing?: HospiceNursingAssessmentListItem[];
  painAssessments?: PainAssessmentListItem[];
  pharmacistAssessments?: ClinicalPharmacistAssessmentListItem[];
  physiotherapyAssessments?: PhysiotherapyAssessmentListItem[];
  familyAssessments?: FamilyAssessmentListItem[];
  nutritionalAssessments?: NutritionalAssessmentListItem[];
  socialAssessments?: SocialAssessmentListItem[];
  spiritualAssessments?: SpiritualAssessmentListItem[];
  psychiatryAssessments?: PsychiatryAssessmentListItem[];
  appName?: string;
}

export function printPatientReport(data: PrintReportData): void {
  const {
    patient,
    visits,
    medications,
    labs,
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
        DISEASE_STAGE_LABELS[patient.diseaseStage] ??
          safe(patient.diseaseStage),
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
        `${safe(patient.emergencyContactName)} · ${safe(
          patient.emergencyContactPhone,
        )}`,
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
      [
        'Medication',
        'Dosage',
        'Frequency',
        'Route',
        'Administered At',
        'Status',
        'Date Ordered',
      ],
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
      [
        'Test Name',
        'Date Ordered',
        'Date Performed',
        'Location',
        'Status',
        'Result',
      ],
      labs.map((l) => [
        safe(l.testName),
        fmt(l.dateOrdered),
        l.datePerformed ? fmt(l.datePerformed) : '—',
        safe(l.location),
        statusBadge(l.status),
        `<span style="white-space:pre-wrap">${safe(l.result)}</span>`,
      ]),
    ),
  );

  // ── 5. Referrals ─────────────────────────────────────────────
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

  // ── 6. Admissions ────────────────────────────────────────────
  const admissionSection = section(
    'Hospital Admissions',
    table(
      [
        'Admission Date',
        'Bed',
        'Ward',
        'Physician',
        'Care Team',
        'Status',
        'Discharge Date',
      ],
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

  // ── 7. Progress Notes ────────────────────────────────────────
  const progressNoteSection = section(
    'Progress Notes',
    progressNotes.length
      ? progressNotes
          .map((n: any) =>
            renderAssessmentBlock(
              'Progress Note',
              n.createdAt,
              n.attendingClinician ?? '—',
              [
                {
                  label: 'General Condition',
                  value: (r) => safe(r.generalCondition),
                },
                {
                  label: 'Consciousness',
                  value: (r) => safe(r.levelOfConsciousness),
                },
                {
                  label: 'Overall Assessment',
                  value: (r) => safe(r.overallAssessment),
                },
                {
                  label: 'SOAP — Subjective',
                  value: (r) => safe(r.soapSubjective),
                },
                {
                  label: 'All Signed',
                  value: (r) => (r.allSigned ? 'Yes' : 'No'),
                },
              ],
              n,
            ),
          )
          .join('')
      : '<p style="color:#8290A7;font-style:italic;font-size:9.5pt">No progress notes found.</p>',
  );

  // ── 8. Hospice Nursing ───────────────────────────────────────
  const hospiceSection = section(
    'Hospice Nursing Assessments',
    hospiceNursing.length
      ? hospiceNursing
          .map((h: any) =>
            renderAssessmentBlock(
              'Hospice Nursing',
              h.assessmentDate,
              h.assessedBy?.name ?? '—',
              [
                {
                  label: 'Consciousness',
                  value: (r) => safe(r.levelOfConsciousness),
                },
                {
                  label: 'Pain Score',
                  value: (r) =>
                    r.painScore != null ? `${r.painScore}/10` : '—',
                },
                {
                  label: 'Mobility',
                  value: (r) => safe(r.mobilityStatus),
                },
                {
                  label: 'Emotional Status',
                  value: (r) => safe(r.emotionalStatus),
                },
                {
                  label: 'Summary',
                  value: (r) => safe(r.nurseSummary),
                },
              ],
              h,
            ),
          )
          .join('')
      : '<p style="color:#8290A7;font-style:italic;font-size:9.5pt">No hospice nursing assessments found.</p>',
  );

  // ── 9. Pain Assessments ──────────────────────────────────────
  const painSection = section(
    'Pain Assessments',
    painAssessments.length
      ? painAssessments
          .map((a: any) =>
            renderAssessmentBlock(
              'Pain Assessment',
              a.createdAt,
              a.assessmentType ?? '—',
              [
                {
                  label: 'Current Pain Score',
                  value: (r) =>
                    r.currentPainScore != null
                      ? `${r.currentPainScore}/10`
                      : '—',
                },
                {
                  label: 'Worst (24h)',
                  value: (r) =>
                    r.worstPainLast24h != null
                      ? `${r.worstPainLast24h}/10`
                      : '—',
                },
                {
                  label: 'Pain Type',
                  value: (r) =>
                    r.painType?.length ? r.painType.join(', ') : '—',
                },
                {
                  label: 'Diagnosis',
                  value: (r) =>
                    r.diagnosis?.length
                      ? r.diagnosis.join(', ')
                      : '—',
                },
                {
                  label: 'Outcome',
                  value: (r) =>
                    r.assessmentOutcome?.length
                      ? r.assessmentOutcome.join(', ')
                      : '—',
                },
              ],
              a,
            ),
          )
          .join('')
      : '<p style="color:#8290A7;font-style:italic;font-size:9.5pt">No pain assessments found.</p>',
  );

  // ── 10. Pharmacist Assessments ───────────────────────────────
  const pharmacistSection = section(
    'Pharmacist Assessments',
    pharmacistAssessments.length
      ? pharmacistAssessments
          .map((a: any) =>
            renderAssessmentBlock(
              'Pharmacist Assessment',
              a.createdAt,
              a.assessmentType ?? '—',
              [
                {
                  label: 'Pain Control',
                  value: (r) => safe(r.painControl),
                },
                {
                  label: 'Summary',
                  value: (r) => safe(r.pharmacistSummary),
                },
                {
                  label: 'Summary Flags',
                  value: (r) =>
                    r.summaryFlags?.length
                      ? r.summaryFlags.join(', ')
                      : '—',
                },
                {
                  label: 'Recommendations',
                  value: (r) =>
                    r.finalRecommendations?.length
                      ? r.finalRecommendations.join(', ')
                      : '—',
                },
              ],
              a,
            ),
          )
          .join('')
      : '<p style="color:#8290A7;font-style:italic;font-size:9.5pt">No pharmacist assessments found.</p>',
  );

  // ── 11. Physiotherapy Assessments ────────────────────────────
  const physioSection = section(
    'Physiotherapy Assessments',
    physiotherapyAssessments.length
      ? physiotherapyAssessments
          .map((a: any) =>
            renderAssessmentBlock(
              'Physiotherapy Assessment',
              a.createdAt,
              a.assessmentType ?? '—',
              [
                {
                  label: 'General Condition',
                  value: (r) => safe(r.generalCondition),
                },
                {
                  label: 'Mobility Status',
                  value: (r) => safe(r.mobilityStatus),
                },
                {
                  label: 'Fall Risk',
                  value: (r) => safe(r.fallRiskLevel),
                },
                {
                  label: 'Diagnosis',
                  value: (r) =>
                    r.diagnosis?.length
                      ? r.diagnosis.join(', ')
                      : '—',
                },
                {
                  label: 'Outcome',
                  value: (r) =>
                    r.outcome?.length ? r.outcome.join(', ') : '—',
                },
              ],
              a,
            ),
          )
          .join('')
      : '<p style="color:#8290A7;font-style:italic;font-size:9.5pt">No physiotherapy assessments found.</p>',
  );

  // ── 12. Family Assessments ───────────────────────────────────
  const familySection = section(
    'Family Assessments',
    familyAssessments.length
      ? familyAssessments
          .map((a: any) =>
            renderAssessmentBlock(
              'Family Assessment',
              a.createdAt,
              a.assessmentType ?? '—',
              [
                {
                  label: 'Burden Level',
                  value: (r) => safe(r.burdenLevel),
                },
                {
                  label: 'Palliative Care Acceptance',
                  value: (r) => safe(r.palliativeCareAcceptance),
                },
                {
                  label: 'Assessor',
                  value: (r) => safe(r.assessorName),
                },
                {
                  label: 'Outcome',
                  value: (r) =>
                    r.assessmentOutcome?.length
                      ? r.assessmentOutcome.join(', ')
                      : '—',
                },
              ],
              a,
            ),
          )
          .join('')
      : '<p style="color:#8290A7;font-style:italic;font-size:9.5pt">No family assessments found.</p>',
  );

  // ── 13. Nutritional Assessments ──────────────────────────────
  const nutritionSection = section(
    'Nutritional Assessments',
    nutritionalAssessments.length
      ? nutritionalAssessments
          .map((a: any) =>
            renderAssessmentBlock(
              'Nutritional Assessment',
              a.createdAt,
              a.assessmentType ?? '—',
              [
                { label: 'BMI', value: (r) => safe(r.bmi) },
                {
                  label: 'Nutritional Status',
                  value: (r) =>
                    safe(r.nutritionalStatusClassification),
                },
                {
                  label: 'Overall Risk',
                  value: (r) => safe(r.overallNutritionalRisk),
                },
                {
                  label: 'Appetite',
                  value: (r) => safe(r.currentAppetite),
                },
              ],
              a,
            ),
          )
          .join('')
      : '<p style="color:#8290A7;font-style:italic;font-size:9.5pt">No nutritional assessments found.</p>',
  );

  // ── 14. Social Assessments ───────────────────────────────────
  const socialSection = section(
    'Social Assessments',
    socialAssessments.length
      ? socialAssessments
          .map((a: any) =>
            renderAssessmentBlock(
              'Social Assessment',
              a.createdAt,
              a.assessmentType ?? '—',
              [
                {
                  label: 'Living Arrangement',
                  value: (r) => safe(r.livingArrangement),
                },
                {
                  label: 'Isolation Risk',
                  value: (r) => safe(r.isolationRisk),
                },
                {
                  label: 'Financial Risk',
                  value: (r) => safe(r.financialRiskLevel),
                },
                {
                  label: 'Bereavement Risk',
                  value: (r) => safe(r.bereavementRisk),
                },
                {
                  label: 'Outcome',
                  value: (r) =>
                    r.assessmentOutcome?.length
                      ? r.assessmentOutcome.join(', ')
                      : '—',
                },
              ],
              a,
            ),
          )
          .join('')
      : '<p style="color:#8290A7;font-style:italic;font-size:9.5pt">No social assessments found.</p>',
  );

  // ── 15. Spiritual Assessments ────────────────────────────────
  const spiritualSection = section(
    'Spiritual Assessments',
    spiritualAssessments.length
      ? spiritualAssessments
          .map((a: any) =>
            renderAssessmentBlock(
              'Spiritual Assessment',
              a.createdAt,
              a.assessmentType ?? '—',
              [
                {
                  label: 'Religious Affiliation',
                  value: (r) => safe(r.religiousAffiliation),
                },
                {
                  label: 'Distress Level',
                  value: (r) => safe(r.spiritualDistressLevel),
                },
                {
                  label: 'Feels at Peace',
                  value: (r) => safe(r.feelsAtPeace),
                },
                {
                  label: 'Outcome',
                  value: (r) =>
                    r.assessmentOutcome?.length
                      ? r.assessmentOutcome.join(', ')
                      : '—',
                },
              ],
              a,
            ),
          )
          .join('')
      : '<p style="color:#8290A7;font-style:italic;font-size:9.5pt">No spiritual assessments found.</p>',
  );

  // ── 16. Psychiatry Assessments ───────────────────────────────
  const psychiatrySection = section(
    'Psychiatry Assessments',
    psychiatryAssessments.length
      ? psychiatryAssessments
          .map((a: any) =>
            renderAssessmentBlock(
              'Psychiatry Assessment',
              a.createdAt,
              a.assessmentType ?? '—',
              [
                { label: 'Severity', value: (r) => safe(r.severity) },
                {
                  label: 'Suicidal Ideation',
                  value: (r) => safe(r.suicidalIdeation),
                },
                {
                  label: 'Suicide Risk Level',
                  value: (r) => safe(r.suicideRiskLevel),
                },
                {
                  label: 'Diagnoses',
                  value: (r) =>
                    r.diagnoses?.length
                      ? r.diagnoses.join(', ')
                      : '—',
                },
                {
                  label: 'Outcome',
                  value: (r) =>
                    r.assessmentOutcome?.length
                      ? r.assessmentOutcome.join(', ')
                      : '—',
                },
              ],
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