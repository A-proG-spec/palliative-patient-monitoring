/**
 * printDischargeSummary
 * ─────────────────────
 * Renders the completed discharge form as a self-contained HTML document and
 * opens the browser's native Print dialog (File → Save as PDF works in all
 * modern browsers). Follows the same pattern as printPatientReport.ts —
 * no third-party libraries, no server round-trip, everything is front-end only.
 */

import type { DischargeSummary } from '@/components/admin/DischargePatientModal';

// ── Helpers ───────────────────────────────────────────────────────

const fmt = (iso?: string) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  } catch { return iso; }
};

const safe = (v?: string | number | null) =>
  v !== undefined && v !== null && v !== '' ? String(v) : '—';

const yesNo = (v: string) => (v === 'Yes' ? '✔ Yes' : v === 'No' ? '✘ No' : safe(v));

// ── CSS ───────────────────────────────────────────────────────────

const CSS = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Segoe UI', Arial, sans-serif;
  font-size: 10.5pt;
  color: #1a1a2e;
  line-height: 1.5;
  background: #fff;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 18px 0 12px;
  border-bottom: 2.5px solid #002395;
  margin-bottom: 20px;
}
.report-header .brand { font-size: 14pt; font-weight: 700; color: #002395; }
.report-header .brand-sub { font-size: 8.5pt; color: #52627A; margin-top: 2px; }
.report-header .meta { text-align: right; font-size: 9pt; color: #52627A; }
.report-header .meta strong { display: block; font-size: 10pt; color: #1a1a2e; }

.patient-banner {
  background: #E8ECF7;
  border-left: 4px solid #002395;
  border-radius: 4px;
  padding: 10px 14px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.patient-banner .name { font-size: 15pt; font-weight: 700; color: #002395; }
.patient-banner .pid  { font-size: 8.5pt; color: #52627A; font-family: monospace; margin-top: 2px; }
.patient-banner .meta-right { text-align: right; font-size: 9pt; color: #1a1a2e; }
.patient-banner .meta-right span { display: block; }

section { margin-bottom: 20px; page-break-inside: avoid; }

section h2 {
  font-size: 9.5pt;
  font-weight: 700;
  color: #002395;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding-bottom: 4px;
  border-bottom: 1px solid #C8D0E7;
  margin-bottom: 8px;
}

.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
.grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0; }

.row {
  display: flex;
  gap: 4px;
  padding: 3px 0;
  border-bottom: 1px solid #F1F4F9;
  font-size: 9.5pt;
}
.row:last-child { border-bottom: none; }
.label { color: #52627A; min-width: 160px; flex-shrink: 0; font-size: 9pt; }
.value { color: #1a1a2e; font-weight: 500; word-break: break-word; }

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 9pt;
  margin-bottom: 6px;
}
th {
  background: #E8ECF7;
  color: #002395;
  font-weight: 700;
  text-align: left;
  padding: 5px 7px;
  font-size: 8pt;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
td {
  padding: 5px 7px;
  border-bottom: 1px solid #F1F4F9;
  color: #1a1a2e;
  vertical-align: top;
}
tr:last-child td { border-bottom: none; }
tr:nth-child(even) td { background: #FAFBFD; }
td.empty { color: #8290A7; font-style: italic; text-align: center; padding: 10px; }

.symptom-table td, .symptom-table th { font-size: 8.5pt; }
.sev-none    { color: #52627A; }
.sev-mild    { color: #F5A34A; font-weight: 600; }
.sev-mod     { color: #E07B1A; font-weight: 600; }
.sev-severe  { color: #E74F3D; font-weight: 700; }

.checklist { display: flex; flex-wrap: wrap; gap: 4px 14px; margin-top: 3px; }
.checklist-item { font-size: 9pt; color: #1a1a2e; }
.checklist-item::before { content: '✔ '; color: #002395; }

.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 99px;
  font-size: 8pt;
  font-weight: 600;
  border: 1px solid;
}
.badge-discharge { background: #E8ECF7; color: #002395; border-color: #002395; }
.badge-success   { background: #EAF8F2; color: #43B982; border-color: #43B982; }
.badge-warning   { background: #FFF3E0; color: #F5A34A; border-color: #F5A34A; }
.badge-error     { background: #FCE8E8; color: #E74F3D; border-color: #E74F3D; }

.note-box {
  background: #F7F9FE;
  border-left: 3px solid #002395;
  border-radius: 0 4px 4px 0;
  padding: 8px 12px;
  font-size: 9.5pt;
  color: #1a1a2e;
  white-space: pre-wrap;
  word-break: break-word;
}

.report-footer {
  margin-top: 24px;
  border-top: 1px solid #E6EBF4;
  padding-top: 8px;
  font-size: 8pt;
  color: #8290A7;
  display: flex;
  justify-content: space-between;
}

@media print {
  body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
  section { page-break-inside: avoid; }
  .no-break { page-break-inside: avoid; }
}
`;

// ── Builder helpers ───────────────────────────────────────────────

const sec = (title: string, body: string) =>
  `<section><h2>${title}</h2>${body}</section>`;

const grid = (pairs: [string, string][], cols: 2 | 3 = 2) => `
  <div class="grid-${cols}">
    ${pairs.map(([l, v]) =>
      `<div class="row"><span class="label">${l}</span><span class="value">${v}</span></div>`
    ).join('')}
  </div>`;

const row1 = (label: string, value: string) =>
  `<div class="row"><span class="label">${label}</span><span class="value">${value}</span></div>`;

const checklist = (items: string[]) =>
  items.length
    ? `<div class="checklist">${items.map((i) => `<span class="checklist-item">${i}</span>`).join('')}</div>`
    : '<span style="color:#8290A7;font-style:italic;font-size:9pt">None recorded</span>';

const noteBox = (text: string) =>
  text ? `<div class="note-box">${text.replace(/</g, '&lt;')}</div>`
       : '<span style="color:#8290A7;font-style:italic;font-size:9pt">—</span>';

// ── Section builders ──────────────────────────────────────────────

function buildSections(s: DischargeSummary): string {
  // A – Header
  const secA = sec('A — Header Information', grid([
    ['Hospital / Facility', safe(s.hospitalName)],
    ['Palliative Care Unit', safe(s.palliativeCareUnit)],
    ['Date of Admission', fmt(s.dateOfAdmission)],
    ['Date of Discharge', fmt(s.dateOfDischarge)],
    ['Time of Discharge', safe(s.timeOfDischarge)],
    ['Discharge Type',
      s.dischargeType === 'Other' && s.dischargeTypeOther
        ? `Other — ${s.dischargeTypeOther}`
        : safe(s.dischargeType)],
  ]));

  // B – Patient ID
  const secB = sec('B — Patient Identification', grid([
    ['Full Name', safe(s.fullName)],
    ['Date of Birth', fmt(s.dateOfBirth)],
    ['Age', safe(s.age)],
    ['Sex', safe(s.sex)],
    ['Address', safe(s.address)],
    ['Telephone / Mobile', safe(s.telephone)],
    ['Primary Caregiver', safe(s.primaryCaregiver)],
    ['Relationship', safe(s.caregiverRelationship)],
    ['Caregiver Telephone', safe(s.caregiverTelephone)],
  ]));

  // C – Admission
  const secC = sec('C — Admission Information', `
    ${row1('Primary Diagnosis', safe(s.primaryDiagnosis))}
    ${row1('Secondary Diagnoses / Comorbidities', safe(s.secondaryDiagnoses))}
    ${row1('Reason for Admission', safe(s.reasonForAdmission))}
    ${row1('Referring Physician / Facility', safe(s.referringPhysicianFacility))}
  `);

  // D – Clinical summary
  const problems = s.clinicalProblemsManaged.filter(Boolean);
  const secD = sec('D — Discharge Diagnosis / Clinical Summary', `
    ${row1('Final / Discharge Diagnosis', safe(s.finalDischargeDiagnosis))}
    <div class="row">
      <span class="label">Clinical Problems Managed</span>
      <span class="value">${problems.length
        ? problems.map((p, i) => `${i + 1}. ${p}`).join('<br/>')
        : '—'}</span>
    </div>
    <div class="row"><span class="label">Summary of Clinical Course</span>
      <span class="value" style="white-space:pre-wrap">${safe(s.summaryOfClinicalCourse)}</span>
    </div>
    <div class="row"><span class="label">Important Investigations / Results</span>
      <span class="value" style="white-space:pre-wrap">${safe(s.importantInvestigations)}</span>
    </div>
  `);

  // E – Condition
  const secE = sec('E — Condition at Discharge', grid([
    ['Overall Condition', safe(s.overallCondition)],
    ['Level of Consciousness', safe(s.levelOfConsciousness)],
    ['Functional Status', safe(s.functionalStatus)],
    ['Mobility', safe(s.mobility)],
    ['Oral Intake', safe(s.oralIntake)],
  ]));

  // F – Vitals
  const secF = sec('F — Discharge Vital Signs', grid([
    ['Temperature (°C)', safe(s.temperature)],
    ['Pulse / Heart Rate (bpm)', safe(s.pulse)],
    ['Respiratory Rate (/min)', safe(s.respiratoryRate)],
    ['Blood Pressure (mmHg)', safe(s.bloodPressure)],
    ['O₂ Saturation (%)', safe(s.oxygenSaturation)],
    ['O₂ Requirement (L/min)', safe(s.oxygenRequirement)],
  ], 3));

  // G – Symptoms
  const sevClass = (v: string) =>
    v === 'Severe' ? 'sev-severe' : v === 'Moderate' ? 'sev-mod' : v === 'Mild' ? 'sev-mild' : 'sev-none';
  const symptomRows = Object.entries(s.symptoms).map(([name, row]) =>
    `<tr>
      <td>${name}</td>
      <td class="${sevClass(row.severity)}">${row.severity}</td>
      <td>${safe(row.notes)}</td>
    </tr>`
  ).join('');
  const secG = sec('G — Symptom Status at Discharge', `
    <table class="symptom-table">
      <thead><tr><th>Symptom</th><th>Severity</th><th>Management / Notes</th></tr></thead>
      <tbody>${symptomRows || '<tr><td colspan="3" class="empty">No symptoms recorded</td></tr>'}</tbody>
    </table>
    ${grid([
      ['Pain Score at Discharge', s.painScore ? `${s.painScore} / 10` : '—'],
      ['Pain Control', safe(s.painControl)],
    ])}
  `);

  // H – Medications
  const medRows = s.dischargeMedications.filter((r) => r.medication).map((r) =>
    `<tr>
      <td>${safe(r.medication)}</td><td>${safe(r.dose)}</td><td>${safe(r.route)}</td>
      <td>${safe(r.frequency)}</td><td>${safe(r.purpose)}</td><td>${safe(r.instructions)}</td>
    </tr>`
  ).join('');
  const secH = sec('H — Discharge Medications', `
    <table>
      <thead><tr>
        <th>Medication</th><th>Dose</th><th>Route</th>
        <th>Frequency</th><th>Purpose</th><th>Instructions</th>
      </tr></thead>
      <tbody>${medRows || '<tr><td colspan="6" class="empty">No medications listed</td></tr>'}</tbody>
    </table>
    ${row1('PRN / Breakthrough Medications', safe(s.prnMedications))}
    ${row1('Medication Changes During Admission', safe(s.medicationChanges))}
    ${row1('Medication Reconciliation Completed', yesNo(s.medicationReconciliation))}
  `);

  // I – Symptom management instructions
  const secI = sec('I — Symptom Management Instructions', `
    ${row1('Pain Management', safe(s.painManagementInstructions))}
    ${row1('Breathlessness Management', safe(s.breathlessnessManagement))}
    ${row1('Nausea / Vomiting Management', safe(s.nauseaVomitingManagement))}
    ${row1('Constipation Management', safe(s.constipationManagement))}
    ${row1('Anxiety / Agitation / Delirium Management', safe(s.anxietyDeliriumManagement))}
    ${row1('Other Symptom Management', safe(s.otherSymptomManagement))}
  `);

  // J – Nutrition
  const secJ = sec('J — Nutrition &amp; Hydration', `
    ${grid([
      ['Diet', safe(s.diet)],
      ['Feeding Assistance', safe(s.feedingAssistance)],
      ['Enteral Feeding', yesNo(s.enteralFeeding)],
      ['Feeding Tube', s.feedingTube === 'Other' ? `Other — ${safe(s.feedingTubeOther)}` : safe(s.feedingTube)],
      ['Nutrition / Dietitian Follow-Up', yesNo(s.nutritionFollowUp)],
    ])}
    ${row1('Hydration Instructions', safe(s.hydrationInstructions))}
  `);

  // K – Wound / skin
  const secK = sec('K — Wound / Skin Care', `
    ${row1('Wound / Pressure Injury Present', yesNo(s.woundPresent))}
    ${s.woundPresent === 'Yes' ? `
      ${row1('Location', safe(s.woundLocation))}
      ${row1('Care Instructions', safe(s.woundCareInstructions))}
      ${row1('Dressing Changes', safe(s.dressingChanges))}
    ` : ''}
    ${row1('Pressure-Injury Prevention Instructions', safe(s.pressureInjuryPrevention))}
  `);

  // L – Equipment
  const equip = [...s.equipmentRequired];
  if (equip.includes('Other') && s.equipmentOther) {
    const idx = equip.indexOf('Other');
    equip[idx] = `Other — ${s.equipmentOther}`;
  }
  const secL = sec('L — Oxygen / Medical Equipment', `
    ${grid([
      ['Oxygen Required', yesNo(s.oxygenRequired)],
      ['Delivery Method', s.oxygenDeliveryMethod === 'Other'
        ? `Other — ${safe(s.oxygenDeliveryOther)}`
        : safe(s.oxygenDeliveryMethod)],
      ['Flow Rate (L/min)', safe(s.oxygenFlowRate)],
      ['Equipment Arranged', yesNo(s.equipmentArranged)],
    ])}
    <div class="row">
      <span class="label">Equipment Required</span>
      <span class="value">${checklist(equip)}</span>
    </div>
  `);

  // M – Goals of care
  const goals = [...s.goalsOfCare];
  if (goals.includes('Other') && s.goalsOfCareOther) goals[goals.indexOf('Other')] = `Other — ${s.goalsOfCareOther}`;
  const secM = sec('M — Goals of Care', `
    <div class="row">
      <span class="label">Current Goals of Care</span>
      <span class="value">${checklist(goals)}</span>
    </div>
    ${grid([
      ['Goals of Care Reviewed', yesNo(s.goalsOfCareReviewed)],
      ['Code Status', s.codeStatus === 'Other'
        ? `Other — ${safe(s.codeStatusOther)}`
        : safe(s.codeStatus)],
      ['Advance Care Plan', safe(s.advanceCarePlan)],
    ])}
    ${row1('Patient / Decision-Maker Preferences', safe(s.patientDecisionMakerPreferences))}
  `);

  // N – Destination
  const secN = sec('N — Discharge Destination', `
    ${grid([
      ['Discharged To', s.dischargedTo === 'Other'
        ? `Other — ${safe(s.dischargedToOther)}`
        : safe(s.dischargedTo)],
      ['Transport', s.transport === 'Other'
        ? `Other — ${safe(s.transportOther)}`
        : safe(s.transport)],
      ['Escort / Caregiver', safe(s.escortCaregiver)],
    ])}
    ${row1('Destination Address', safe(s.destinationAddress))}
  `);

  // O – Home/hospice
  const secO = sec('O — Home / Hospice Care Plan', `
    ${grid([
      ['Home Palliative Care Required', yesNo(s.homePalliativeCareRequired)],
      ['Hospice Referral', safe(s.hospiceReferral)],
      ['Community Nursing Required', yesNo(s.communityNursingRequired)],
      ['Home Visits Required', yesNo(s.homeVisitsRequired)],
      ['Caregiver Support Required', yesNo(s.caregiverSupportRequired)],
    ])}
    ${row1('Services Arranged', safe(s.servicesArranged))}
    ${grid([
      ['Responsible Provider', safe(s.responsibleProvider)],
      ['Telephone', safe(s.responsibleProviderPhone)],
    ])}
  `);

  // P – Education
  const eduTopics = [...s.educationTopics];
  if (eduTopics.includes('Other') && s.educationOther) eduTopics[eduTopics.indexOf('Other')] = `Other — ${s.educationOther}`;
  const secP = sec('P — Patient &amp; Caregiver Education', `
    <div class="row">
      <span class="label">Topics Provided</span>
      <span class="value">${checklist(eduTopics)}</span>
    </div>
    ${row1('Patient / Caregiver Understanding', safe(s.patientUnderstanding))}
    ${row1('Additional Education Required', safe(s.additionalEducationRequired))}
  `);

  // Q – Warning signs
  const warnings = [...s.warningSigns];
  if (warnings.includes('Other') && s.warningSignsOther) warnings[warnings.indexOf('Other')] = `Other — ${s.warningSignsOther}`;
  const secQ = sec('Q — Warning Signs / When to Seek Help', `
    <div class="row">
      <span class="label">Instructed to Seek Help For</span>
      <span class="value">${checklist(warnings)}</span>
    </div>
    ${row1('Specific Instructions', safe(s.warningSignsSpecificInstructions))}
  `);

  // R – Follow-up
  const secR = sec('R — Follow-up Plan', `
    ${grid([
      ['Palliative Care Follow-Up', yesNo(s.palliativeCareFollowUp)],
      ['Follow-Up Date / Time',
        s.palliativeCareFollowUp === 'Yes'
          ? `${fmt(s.palliativeCareFollowUpDate)} ${safe(s.palliativeCareFollowUpTime)}`
          : '—'],
    ])}
    ${row1('Physician / Specialist Follow-Up', safe(s.physicianSpecialistFollowUp))}
    ${row1('Primary Care Follow-Up', safe(s.primaryCareFollowUp))}
    ${row1('Hospice / Home Care Follow-Up', safe(s.hospiceHomeCareFollowUp))}
    ${row1('Other Appointments', safe(s.otherAppointments))}
  `);

  // S – Contacts
  const secS = sec('S — Contact Information', grid([
    ['Palliative Care Unit', safe(s.palliativeCareUnitContact)],
    ['Unit Telephone', safe(s.palliativeCareUnitPhone)],
    ['Attending Clinician', safe(s.attendingClinician)],
    ['Clinician Telephone', safe(s.attendingClinicianPhone)],
    ['Emergency Contact', safe(s.emergencyContactInfo)],
    ['Home / Hospice Service', safe(s.homeHospiceService)],
    ['Hospice Service Tel.', safe(s.homeHospiceServicePhone)],
  ]));

  // T – Notes
  const secT = sec('T — Discharge Notes', noteBox(s.dischargeNotes));

  return [secA,secB,secC,secD,secE,secF,secG,secH,secI,secJ,secK,secL,secM,secN,secO,secP,secQ,secR,secS,secT].join('\n');
}

// ── Public API ────────────────────────────────────────────────────

export function printDischargeSummary(
  summary: DischargeSummary,
  appName = 'Palliative Care System',
): void {
  const generatedAt = new Date().toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Discharge Summary — ${summary.fullName || 'Patient'}</title>
  <style>${CSS}</style>
</head>
<body>

  <div class="report-header">
    <div>
      <div class="brand">&#9829; ${appName}</div>
      <div class="brand-sub">Palliative Patient Monitoring System · Yekatit 12 Hospital Medical College</div>
    </div>
    <div class="meta">
      <strong>PATIENT DISCHARGE SUMMARY</strong>
      Generated: ${generatedAt}
    </div>
  </div>

  <div class="patient-banner">
    <div>
      <div class="name">${safe(summary.fullName)}</div>
      <div class="pid">Discharge date: ${fmt(summary.dateOfDischarge)}</div>
    </div>
    <div class="meta-right">
      <span><span class="badge badge-discharge">${safe(summary.dischargeType) === '—' ? 'Discharge' : safe(summary.dischargeType)}</span></span>
      <span style="margin-top:4px;font-size:9pt;color:#52627A;">Submitted: ${
        summary.submittedAt
          ? new Date(summary.submittedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
          : '—'
      }</span>
      ${summary.submittedBy ? `<span style="font-size:9pt;color:#52627A;">By: ${summary.submittedBy}</span>` : ''}
    </div>
  </div>

  ${buildSections(summary)}

  <div class="report-footer">
    <span>${appName} — Confidential Medical Record</span>
    <span>Generated ${generatedAt}</span>
  </div>

</body>
</html>`;

  // Print via hidden iframe (same mechanism as printPatientReport)
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;border:0;visibility:hidden;';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) { document.body.removeChild(iframe); return; }

  doc.open();
  doc.write(html);
  doc.close();

  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => document.body.removeChild(iframe), 1000);
  }, 350);
}
