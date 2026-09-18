/**
 * printPatientReport
 * ------------------
 * Builds a self-contained HTML document from patient data and opens the
 * browser's native Print dialog (File → Save as PDF works in all modern
 * browsers). No third-party libraries required.
 *
 * All data is front-end only — nothing is sent to a server.
 */

import type { Patient } from '@/types/patient.types';
import type { HomeVisit } from '@/types/visit.types';
import type { Medication } from '@/types/medication.types';
import type { LaboratoryTest } from '@/types/lab.types';
import type { Referral } from '@/types/referral.types';
import type { HospitalAdmission } from '@/types/admission.types';

import {
  DISEASE_STAGE_LABELS,
  VISIT_TYPE_LABELS,
  OUTCOME_LABELS,
  SYMPTOM_LABELS,
  PAIN_LOCATION_LABELS,
  REFERRAL_REASON_LABELS,
} from '@/constants';

// ── helpers ──────────────────────────────────────────────────────

const fmt = (iso?: string) => {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return iso; }
};

const safe = (v?: string | number | null) => (v !== undefined && v !== null && v !== '' ? String(v) : '—');

const labelList = (arr: string[], map: Record<string, string>) =>
  arr?.length ? arr.map((k) => map[k] ?? k).join(', ') : '—';

// ── section builders ─────────────────────────────────────────────

const section = (title: string, body: string) => `
  <section>
    <h2>${title}</h2>
    ${body}
  </section>`;

const table = (headers: string[], rows: string[][], caption?: string) => `
  ${caption ? `<p class="tbl-caption">${caption}</p>` : ''}
  <table>
    <thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
    <tbody>${rows.length
      ? rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')
      : `<tr><td colspan="${headers.length}" class="empty">No records</td></tr>`
    }</tbody>
  </table>`;

const infoGrid = (pairs: [string, string][]) => `
  <div class="info-grid">
    ${pairs.map(([label, value]) => `
      <div class="info-row">
        <span class="info-label">${label}</span>
        <span class="info-value">${value}</span>
      </div>`).join('')}
  </div>`;

// ── CSS ──────────────────────────────────────────────────────────

const CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Segoe UI', Arial, sans-serif;
    font-size: 11pt;
    color: #1a1a2e;
    line-height: 1.5;
    background: #fff;
  }

  /* ── Cover header ── */
  .report-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 20px 0 14px;
    border-bottom: 2.5px solid #002395;
    margin-bottom: 22px;
  }
  .report-header .brand { font-size: 15pt; font-weight: 700; color: #002395; }
  .report-header .brand-sub { font-size: 9pt; color: #52627A; margin-top: 2px; }
  .report-header .meta { text-align: right; font-size: 9pt; color: #52627A; }
  .report-header .meta strong { display: block; font-size: 10pt; color: #1a1a2e; }

  /* ── Patient banner ── */
  .patient-banner {
    background: #E8ECF7;
    border-left: 4px solid #002395;
    border-radius: 4px;
    padding: 12px 16px;
    margin-bottom: 22px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }
  .patient-banner .name { font-size: 16pt; font-weight: 700; color: #002395; }
  .patient-banner .pid  { font-size: 9pt; color: #52627A; font-family: monospace; margin-top: 2px; }
  .patient-banner .badges { display: flex; gap: 8px; flex-wrap: wrap; }
  .badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 99px;
    font-size: 8.5pt;
    font-weight: 600;
  }
  .badge-primary  { background: #E8ECF7; color: #002395; border: 1px solid #002395; }
  .badge-success  { background: #EAF8F2; color: #43B982; border: 1px solid #43B982; }
  .badge-warning  { background: #FFF3E0; color: #F5A34A; border: 1px solid #F5A34A; }
  .badge-error    { background: #FCE8E8; color: #E74F3D; border: 1px solid #E74F3D; }
  .badge-default  { background: #F1F4F9; color: #424754; border: 1px solid #C2C6D6; }

  /* ── Sections ── */
  section { margin-bottom: 24px; }

  section h2 {
    font-size: 11pt;
    font-weight: 700;
    color: #002395;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding-bottom: 5px;
    border-bottom: 1px solid #E6EBF4;
    margin-bottom: 10px;
  }

  /* ── Info grid ── */
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
  .info-row {
    display: flex;
    gap: 6px;
    padding: 4px 0;
    border-bottom: 1px solid #F1F4F9;
    font-size: 10pt;
  }
  .info-row:last-child { border-bottom: none; }
  .info-label { color: #52627A; min-width: 130px; flex-shrink: 0; }
  .info-value { color: #1a1a2e; font-weight: 500; }

  /* ── Tables ── */
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 9.5pt;
    margin-bottom: 8px;
  }
  th {
    background: #E8ECF7;
    color: #002395;
    font-weight: 700;
    text-align: left;
    padding: 6px 8px;
    font-size: 8.5pt;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  td {
    padding: 6px 8px;
    border-bottom: 1px solid #F1F4F9;
    color: #1a1a2e;
    vertical-align: top;
  }
  tr:last-child td { border-bottom: none; }
  tr:nth-child(even) td { background: #FAFBFD; }
  td.empty { color: #8290A7; font-style: italic; text-align: center; padding: 12px; }
  .tbl-caption { font-size: 9pt; color: #52627A; margin-bottom: 5px; }

  /* ── Visit detail block ── */
  .visit-block {
    border: 1px solid #E6EBF4;
    border-radius: 4px;
    margin-bottom: 12px;
    page-break-inside: avoid;
  }
  .visit-block-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #F7F9FE;
    padding: 7px 12px;
    border-bottom: 1px solid #E6EBF4;
    border-radius: 4px 4px 0 0;
  }
  .visit-block-header .vb-title { font-weight: 700; color: #002395; font-size: 10pt; }
  .visit-block-body { padding: 10px 12px; }
  .visit-block-body .vb-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 20px; font-size: 9.5pt; margin-bottom: 8px; }
  .vb-row { display: flex; gap: 6px; }
  .vb-label { color: #52627A; min-width: 110px; flex-shrink: 0; }
  .vb-value { color: #1a1a2e; }
  .vb-note { font-size: 9.5pt; color: #52627A; font-style: italic; border-top: 1px dashed #E6EBF4; padding-top: 6px; margin-top: 6px; }

  /* ── Footer ── */
  .report-footer {
    margin-top: 30px;
    border-top: 1px solid #E6EBF4;
    padding-top: 10px;
    font-size: 8.5pt;
    color: #8290A7;
    display: flex;
    justify-content: space-between;
  }

  /* ── Print ── */
  @media print {
    body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    section { page-break-inside: avoid; }
    .visit-block { page-break-inside: avoid; }
    .no-break { page-break-inside: avoid; }
  }
`;

// ── Status badge helper ───────────────────────────────────────────

const statusBadge = (status: string) => {
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
  };
  const cls = map[status] ?? 'badge-default';
  const label = status === 'ReferredHospital' ? 'Hospital' : status;
  return `<span class="badge ${cls}">${label}</span>`;
};

// ── Main export ──────────────────────────────────────────────────

export interface PrintReportData {
  patient: Patient;
  visits:      HomeVisit[];
  medications: Medication[];
  labs:        LaboratoryTest[];
  referrals:   Referral[];
  admissions:  HospitalAdmission[];
  appName?: string;
}

export function printPatientReport(data: PrintReportData): void {
  const { patient, visits, medications, labs, referrals, admissions, appName = 'Palliative Care System' } = data;

  const generatedAt = new Date().toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  // ── 1. Patient Information ───────────────────────────────────
  const patientInfo = section('Patient Information', infoGrid([
    ['Full Name',          `${patient.firstName} ${patient.lastName}`],
    ['Patient ID',         safe(patient.patientDisplayId)],
    ['Age',                `${patient.age} years`],
    ['Sex',                safe(patient.sex)],
    ['Date of Birth',      fmt(patient.dateOfBirth)],
    ['Address',            safe(patient.address)],
    ['Phone',              safe(patient.phone)],
    ['Current Location',   patient.currentLocation === 'ReferredHospital' ? 'Referred Hospital' : 'Home'],
    ['Status',             safe(patient.status)],
    ['Primary Diagnosis',  safe(patient.primaryDiagnosis)],
    ['Secondary Diagnoses', patient.secondaryDiagnoses?.length ? patient.secondaryDiagnoses.join(', ') : '—'],
    ['Disease Stage',      DISEASE_STAGE_LABELS[patient.diseaseStage] ?? patient.diseaseStage],
    ['Comorbidities',      patient.comorbidities?.length ? patient.comorbidities.join(', ') : '—'],
    ['Prognosis',          safe(patient.estimatedPrognosis)],
    ['Registered',         fmt(patient.createdAt)],
    ['Emergency Contact',  `${safe(patient.emergencyContactName)} · ${safe(patient.emergencyContactPhone)}`],
    ['Caregiver',          `${safe(patient.caregiverName)} · ${safe(patient.caregiverPhone)}`],
  ]));

  // ── 2. Visit History (detailed blocks) ──────────────────────
  const visitBlocks = visits.length
    ? visits.map((v) => `
        <div class="visit-block">
          <div class="visit-block-header">
            <span class="vb-title">${fmt(v.visitDate)} — ${VISIT_TYPE_LABELS[v.visitType] ?? v.visitType}</span>
            <span>${statusBadge(v.outcome)}</span>
          </div>
          <div class="visit-block-body">
            <div class="vb-grid">
              <div class="vb-row"><span class="vb-label">Time</span><span class="vb-value">${safe(v.timeStarted)} – ${safe(v.timeEnded)}</span></div>
              <div class="vb-row"><span class="vb-label">Overall Status</span><span class="vb-value">${safe(v.overallStatus)}</span></div>
              <div class="vb-row"><span class="vb-label">PPS Score</span><span class="vb-value">${safe(v.ppsScore)}%</span></div>
              <div class="vb-row"><span class="vb-label">KPS Score</span><span class="vb-value">${safe(v.kpsScore)}/100</span></div>
              <div class="vb-row"><span class="vb-label">Pain Score</span><span class="vb-value">${safe(v.painScore)}/10</span></div>
              <div class="vb-row"><span class="vb-label">Mobility</span><span class="vb-value">${safe(v.mobility)}</span></div>
              <div class="vb-row"><span class="vb-label">Pain Locations</span><span class="vb-value">${labelList(v.painLocation ?? [], PAIN_LOCATION_LABELS)}</span></div>
              <div class="vb-row"><span class="vb-label">Medication Effective</span><span class="vb-value">${v.painMedicationEffective ? 'Yes' : 'No'}</span></div>
              <div class="vb-row"><span class="vb-label">Symptoms</span><span class="vb-value">${labelList(v.symptoms ?? [], SYMPTOM_LABELS)}</span></div>
              <div class="vb-row"><span class="vb-label">Emotional Status</span><span class="vb-value">${safe(v.emotionalStatus)}</span></div>
              <div class="vb-row"><span class="vb-label">Appetite</span><span class="vb-value">${safe(v.appetite)}</span></div>
              <div class="vb-row"><span class="vb-label">Hydration</span><span class="vb-value">${safe(v.hydrationStatus)}</span></div>
              ${v.nextVisitDate ? `<div class="vb-row"><span class="vb-label">Next Visit</span><span class="vb-value">${fmt(v.nextVisitDate)}</span></div>` : ''}
              <div class="vb-row"><span class="vb-label">Team Members</span><span class="vb-value">${v.teamMembers?.map((m) => `${m.name} (${m.role})`).join(', ') || '—'}</span></div>
            </div>
            ${v.redFlags?.filter((f) => f !== 'None').length
              ? `<div class="vb-note">⚠ Red flags: ${v.redFlags.filter((f) => f !== 'None').join(', ')}${v.redFlagActions ? ` — ${v.redFlagActions}` : ''}</div>`
              : ''}
          </div>
        </div>`).join('')
    : '<p style="color:#8290A7;font-style:italic;font-size:9.5pt">No visit records found.</p>';

  const visitHistory = section('Visit History', visitBlocks);

  // ── 3. Medications ───────────────────────────────────────────
  const medicationSection = section('Medications', table(
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
  ));

  // ── 4. Laboratory Tests ──────────────────────────────────────
  const labSection = section('Laboratory Tests', table(
    ['Test Name', 'Date Ordered', 'Date Performed', 'Location', 'Status', 'Result'],
    labs.map((l) => [
      safe(l.testName),
      fmt(l.dateOrdered),
      l.datePerformed ? fmt(l.datePerformed) : '—',
      safe(l.location),
      statusBadge(l.status),
      `<span style="white-space:pre-wrap">${safe(l.result) || '—'}</span>`,
    ]),
  ));

  // ── 5. Referrals ─────────────────────────────────────────────
  const referralSection = section('Referrals', table(
    ['Date', 'Type', 'From', 'To', 'Status', 'Reasons'],
    referrals.map((r) => [
      fmt(r.referralDate),
      safe(r.referralType),
      safe(r.referringFacility),
      safe(r.receivingFacility),
      statusBadge(r.status),
      labelList(r.reasons ?? [], REFERRAL_REASON_LABELS),
    ]),
  ));

  // ── 6. Admissions ────────────────────────────────────────────
  const admissionSection = section('Hospital Admissions', table(
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
  ));

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
      <div class="pid">${safe(patient.patientDisplayId)}</div>
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

  <div class="report-footer">
    <span>${appName} — Confidential Medical Record</span>
    <span>Generated ${generatedAt}</span>
  </div>

</body>
</html>`;

  // ── Print via hidden iframe ───────────────────────────────────
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;border:0;visibility:hidden;';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) { document.body.removeChild(iframe); return; }

  doc.open();
  doc.write(html);
  doc.close();

  // Small delay so the browser finishes rendering before print dialog opens
  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    // Remove iframe after print dialog closes (or is dismissed)
    setTimeout(() => document.body.removeChild(iframe), 1000);
  }, 350);
}
