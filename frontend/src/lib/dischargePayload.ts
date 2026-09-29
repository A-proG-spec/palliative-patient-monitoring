// src/lib/dischargePayload.ts
import type { DischargeSummary } from '@/hooks/useDischargeFormState';

/**
 * Convert the wizard's user-facing string values into the exact enum
 * keys the backend Zod schema (`createDischargeSummarySchema`) expects.
 *
 * Two categories of conversion happen here:
 *
 *  1. YES/NO → Required/NotRequired
 *     The wizard uses "Yes"/"No"/"" for the dozen enum fields that
 *     the backend models as DischargeFeedingAssistance.
 *
 *  2. Human-readable labels → PascalCase enum keys
 *     The wizard's dropdowns show "Discharge to Long-Term Care Facility"
 *     while the backend expects "DischargeToLongTermCare".
 *
 * If a value is not in the map, we pass it through as-is so that
 * already-correct values keep working.
 */

const YES_NO_TO_ASSISTANCE: Record<string, string | undefined> = {
  Yes: 'Required',
  No: 'NotRequired',
  '': undefined,
  // also accept the enum values themselves, in case a form ever sends them
  Required: 'Required',
  NotRequired: 'NotRequired',
};

const DISCHARGE_TYPE_MAP: Record<string, string> = {
  'Planned Discharge': 'PlannedDischarge',
  Transfer: 'Transfer',
  'Discharge to Home': 'DischargeToHome',
  'Discharge to Hospice': 'DischargeToHospice',
  'Discharge to Long-Term Care Facility': 'DischargeToLongTermCare',
  'Transfer to Another Hospital': 'TransferToAnotherHospital',
  Other: 'Other',
  // If already PascalCase, pass through
  PlannedDischarge: 'PlannedDischarge',
  DischargeToHome: 'DischargeToHome',
  DischargeToHospice: 'DischargeToHospice',
  DischargeToLongTermCare: 'DischargeToLongTermCare',
  TransferToAnotherHospital: 'TransferToAnotherHospital',
};

const OVERALL_CONDITION_MAP: Record<string, string> = {
  Stable: 'Stable',
  Improved: 'Improved',
  Unchanged: 'Unchanged',
  Deteriorating: 'Deteriorating',
  'Requires Ongoing Palliative Care': 'RequiresOngoingPalliativeCare',
  RequiresOngoingPalliativeCare: 'RequiresOngoingPalliativeCare',
};

const CONSCIOUSNESS_MAP: Record<string, string> = {
  Alert: 'Alert',
  Drowsy: 'Drowsy',
  Confused: 'Confused',
  Delirious: 'Delirious',
  Unresponsive: 'Unresponsive',
};

const FUNCTIONAL_STATUS_MAP: Record<string, string> = {
  Independent: 'Independent',
  'Requires Assistance': 'RequiresAssistance',
  RequiresAssistance: 'RequiresAssistance',
  Bedbound: 'Bedbound',
  'Fully Dependent': 'FullyDependent',
  FullyDependent: 'FullyDependent',
};

const MOBILITY_MAP: Record<string, string> = {
  Independent: 'Independent',
  Assisted: 'Assisted',
  Wheelchair: 'Wheelchair',
  Bedbound: 'Bedbound',
};

const ORAL_INTAKE_MAP: Record<string, string> = {
  Adequate: 'Adequate',
  Reduced: 'Reduced',
  Minimal: 'Minimal',
  None: 'None',
};

const PAIN_CONTROL_MAP: Record<string, string> = {
  'Well Controlled': 'WellControlled',
  WellControlled: 'WellControlled',
  'Partially Controlled': 'PartiallyControlled',
  PartiallyControlled: 'PartiallyControlled',
  'Poorly Controlled': 'PoorlyControlled',
  PoorlyControlled: 'PoorlyControlled',
};

const DIET_MAP: Record<string, string> = {
  Regular: 'Regular',
  Soft: 'Soft',
  Pureed: 'Pureed',
  Modified: 'Modified',
  Other: 'Other',
};

const FEEDING_TUBE_MAP: Record<string, string> = {
  None: 'None',
  NG: 'NG',
  PEG: 'PEG',
  Other: 'Other',
};

const OXYGEN_DELIVERY_MAP: Record<string, string> = {
  'Nasal Cannula': 'NasalCannula',
  NasalCannula: 'NasalCannula',
  Mask: 'Mask',
  Other: 'Other',
};

const CODE_STATUS_MAP: Record<string, string> = {
  'Full Resuscitation': 'FullResuscitation',
  FullResuscitation: 'FullResuscitation',
  DNAR: 'DNAR',
  Other: 'Other',
};

const ADVANCE_CARE_PLAN_MAP: Record<string, string> = {
  'Not Available': 'NotAvailable',
  NotAvailable: 'NotAvailable',
  Completed: 'Completed',
  Reviewed: 'Reviewed',
  Updated: 'Updated',
};

const DESTINATION_MAP: Record<string, string> = {
  Home: 'Home',
  "Family / Caregiver's Home": 'FamilyCaregiverHome',
  FamilyCaregiverHome: 'FamilyCaregiverHome',
  Hospice: 'Hospice',
  'Nursing / Long-Term Care': 'NursingLongTermCare',
  NursingLongTermCare: 'NursingLongTermCare',
  'Another Hospital': 'AnotherHospital',
  AnotherHospital: 'AnotherHospital',
  Other: 'Other',
};

const TRANSPORT_MAP: Record<string, string> = {
  'Family / Private Transport': 'FamilyPrivateTransport',
  FamilyPrivateTransport: 'FamilyPrivateTransport',
  Ambulance: 'Ambulance',
  'Medical Transport': 'MedicalTransport',
  MedicalTransport: 'MedicalTransport',
  Other: 'Other',
};

const HOSPICE_REFERRAL_MAP: Record<string, string> = {
  No: 'No',
  Yes: 'Yes',
  'Already Enrolled': 'AlreadyEnrolled',
  AlreadyEnrolled: 'AlreadyEnrolled',
};

const PATIENT_UNDERSTANDING_MAP: Record<string, string> = {
  'Verbalized Understanding': 'VerbalizedUnderstanding',
  VerbalizedUnderstanding: 'VerbalizedUnderstanding',
  'Demonstrated Understanding': 'DemonstratedUnderstanding',
  DemonstratedUnderstanding: 'DemonstratedUnderstanding',
  'Requires Further Education': 'RequiresFurtherEducation',
  RequiresFurtherEducation: 'RequiresFurtherEducation',
};

/** Helper — apply a map, falling back to undefined for empty strings. */
function mapEnum(
  value: string,
  map: Record<string, string>,
): string | undefined {
  if (!value || value.trim().length === 0) return undefined;
  return map[value] ?? value; // pass-through if unknown
}

/** Convert "Yes"/"No"/"" → Required/NotRequired/undefined. */
function yesNo(value: string): string | undefined {
  if (!value) return undefined;
  return YES_NO_TO_ASSISTANCE[value];
}

/** Helper — strip empty strings from arrays; return undefined if empty. */
function cleanArray(arr: string[] | undefined): string[] | undefined {
  if (!Array.isArray(arr)) return undefined;
  const cleaned = arr.filter(
    (x) => typeof x === 'string' && x.trim().length > 0,
  );
  return cleaned.length > 0 ? cleaned : undefined;
}

/** Coerce a possibly-ISO date string to yyyy-MM-dd, or undefined. */
function toDateOnly(v: string | undefined): string | undefined {
  if (!v) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString().slice(0, 10);
}

// ═══════════════════════════════════════════════════════════
// Main builder
// ═══════════════════════════════════════════════════════════

export function buildDischargePayload(
  form: DischargeSummary,
  admissionId?: string | null,
) {
  // ── Symptom flattening ──
  const sx = form.symptoms ?? {};
  const sev = (key: string) => sx[key]?.severity || '';
  const note = (key: string) => sx[key]?.notes || undefined;

  return {
    // Relationships
    admissionId: admissionId ?? undefined,

    // Header
    hospitalName: form.hospitalName || '',
    palliativeCareUnit: form.palliativeCareUnit || '',
    dateOfAdmission: toDateOnly(form.dateOfAdmission) ?? undefined,
    dateOfDischarge: toDateOnly(form.dateOfDischarge) ?? form.dateOfDischarge,
    timeOfDischarge: form.timeOfDischarge || undefined,
    dischargeType: mapEnum(form.dischargeType, DISCHARGE_TYPE_MAP),
    dischargeTypeOther: form.dischargeTypeOther || undefined,

    // Clinical summary
    finalDischargeDiagnosis: form.finalDischargeDiagnosis || undefined,
    clinicalProblemsManaged: cleanArray(form.clinicalProblemsManaged),
    summaryOfClinicalCourse: form.summaryOfClinicalCourse || undefined,
    importantInvestigations: form.importantInvestigations || undefined,

    // Condition
    overallCondition: mapEnum(form.overallCondition, OVERALL_CONDITION_MAP),
    levelOfConsciousness: mapEnum(form.levelOfConsciousness, CONSCIOUSNESS_MAP),
    functionalStatus: mapEnum(form.functionalStatus, FUNCTIONAL_STATUS_MAP),
    mobility: mapEnum(form.mobility, MOBILITY_MAP),
    oralIntake: mapEnum(form.oralIntake, ORAL_INTAKE_MAP),

    // Vitals
    temperature: form.temperature || undefined,
    pulse: form.pulse || undefined,
    respiratoryRate: form.respiratoryRate || undefined,
    bloodPressure: form.bloodPressure || undefined,
    oxygenSaturation: form.oxygenSaturation || undefined,
    oxygenRequirement: form.oxygenRequirement || undefined,

    // Symptoms (flattened)
    pain: sev('Pain'),
    painNote: note('Pain'),
    shortnessOfBreath: sev('Shortness of Breath'),
    shortnessOfBreathNote: note('Shortness of Breath'),
    nausea: sev('Nausea'),
    nauseaNote: note('Nausea'),
    vomiting: sev('Vomiting'),
    vomitingNote: note('Vomiting'),
    constipation: sev('Constipation'),
    constipationNote: note('Constipation'),
    fatigue: sev('Fatigue'),
    fatigueNote: note('Fatigue'),
    anxiety: sev('Anxiety'),
    anxietyNote: note('Anxiety'),
    delirium: sev('Delirium/Confusion'),
    deliriumNote: note('Delirium/Confusion'),
    appetiteLoss: sev('Appetite Loss'),
    appetiteLossNote: note('Appetite Loss'),
    other: sev('Other'),
    otherNote: note('Other'),

    painScore: form.painScore || undefined,
    painControl: mapEnum(form.painControl, PAIN_CONTROL_MAP),

    // Medications
    dischargeMedications: (form.dischargeMedications ?? [])
      .filter((m) => m.medication || m.dose || m.route || m.frequency)
      .map((m) => ({
        medication: m.medication || '',
        dose: m.dose || '',
        route: m.route || '',
        frequency: m.frequency || '',
        purpose: m.purpose || '',
        instructions: m.instructions || '',
      })),
    prnMedications: form.prnMedications || undefined,
    medicationChanges: form.medicationChanges || undefined,
    medicationReconciliationCompleted: yesNo(form.medicationReconciliation),

    // Symptom management
    painManagementInstructions: form.painManagementInstructions || undefined,
    breathlessnessManagement: form.breathlessnessManagement || undefined,
    nauseaVomitingManagement: form.nauseaVomitingManagement || undefined,
    constipationManagement: form.constipationManagement || undefined,
    anxietyAgitationDeliriumManagement:
      form.anxietyDeliriumManagement || undefined,
    otherSymptomManagement: form.otherSymptomManagement || undefined,

    // Nutrition
    diet: mapEnum(form.diet, DIET_MAP),
    feedingAssistance: yesNo(form.feedingAssistance),
    enteralFeeding: yesNo(form.enteralFeeding),
    feedingTube: mapEnum(form.feedingTube, FEEDING_TUBE_MAP),
    feedingTubeOther: form.feedingTubeOther || undefined,
    hydrationInstructions: form.hydrationInstructions || undefined,
    nutritionDietitianFollowUp: yesNo(form.nutritionFollowUp),

    // Wound
    woundPresent: yesNo(form.woundPresent),
    woundLocation: form.woundLocation || undefined,
    woundCareInstructions: form.woundCareInstructions || undefined,
    dressingChanges: form.dressingChanges || undefined,
    pressureInjuryPrevention: form.pressureInjuryPrevention || undefined,

    // Oxygen / equipment
    oxygenRequired: yesNo(form.oxygenRequired),
    oxygenDeliveryMethod: mapEnum(form.oxygenDeliveryMethod, OXYGEN_DELIVERY_MAP),
    oxygenDeliveryMethodOther: form.oxygenDeliveryOther || undefined,
    oxygenFlowRate: form.oxygenFlowRate || undefined,
    equipmentRequired: cleanArray(form.equipmentRequired),
    equipmentOther: form.equipmentOther || undefined,
    equipmentArranged: yesNo(form.equipmentArranged),

    // Goals of care
    currentGoalsOfCare: cleanArray(form.goalsOfCare),
    currentGoalsOfCareOther: form.goalsOfCareOther || undefined,
    goalsOfCareReviewed: yesNo(form.goalsOfCareReviewed),
    patientDecisionMakerPreferences:
      form.patientDecisionMakerPreferences || undefined,
    codeStatus: mapEnum(form.codeStatus, CODE_STATUS_MAP),
    codeStatusOther: form.codeStatusOther || undefined,
    advanceCarePlan: mapEnum(form.advanceCarePlan, ADVANCE_CARE_PLAN_MAP),

    // Destination
    dischargedTo: mapEnum(form.dischargedTo, DESTINATION_MAP),
    dischargedToOther: form.dischargedToOther || undefined,
    destinationAddress: form.destinationAddress || undefined,
    transport: mapEnum(form.transport, TRANSPORT_MAP),
    transportOther: form.transportOther || undefined,
    escortCaregiver: form.escortCaregiver || undefined,

    // Home / hospice
    homePalliativeCareRequired: yesNo(form.homePalliativeCareRequired),
    hospiceReferral: mapEnum(form.hospiceReferral, HOSPICE_REFERRAL_MAP),
    communityNursingRequired: yesNo(form.communityNursingRequired),
    homeVisitsRequired: yesNo(form.homeVisitsRequired),
    caregiverSupportRequired: yesNo(form.caregiverSupportRequired),
    servicesArranged: form.servicesArranged || undefined,
    responsibleProvider: form.responsibleProvider || undefined,
    responsibleProviderPhone: form.responsibleProviderPhone || undefined,

    // Education
    educationTopics: cleanArray(form.educationTopics),
    educationOther: form.educationOther || undefined,
    patientUnderstanding: mapEnum(
      form.patientUnderstanding,
      PATIENT_UNDERSTANDING_MAP,
    ),
    additionalEducationRequired: form.additionalEducationRequired || undefined,

    // Warning signs
    warningSigns: cleanArray(form.warningSigns),
    warningSignsOther: form.warningSignsOther || undefined,
    warningSignsSpecificInstructions:
      form.warningSignsSpecificInstructions || undefined,

    // Follow-up
    palliativeCareFollowUp: yesNo(form.palliativeCareFollowUp),
    palliativeCareFollowUpDate: form.palliativeCareFollowUpDate || undefined,
    palliativeCareFollowUpTime: form.palliativeCareFollowUpTime || undefined,
    physicianSpecialistFollowUp: form.physicianSpecialistFollowUp || undefined,
    primaryCareFollowUp: form.primaryCareFollowUp || undefined,
    hospiceHomeCareFollowUp: form.hospiceHomeCareFollowUp || undefined,
    otherAppointments: form.otherAppointments || undefined,

    // Contacts
    palliativeCareUnitContact: form.palliativeCareUnitContact || undefined,
    palliativeCareUnitPhone: form.palliativeCareUnitPhone || undefined,
    attendingClinician: form.attendingClinician || undefined,
    attendingClinicianPhone: form.attendingClinicianPhone || undefined,
    emergencyContactInfo: form.emergencyContactInfo || undefined,
    homeHospiceService: form.homeHospiceService || undefined,
    homeHospiceServicePhone: form.homeHospiceServicePhone || undefined,

    // Notes
    dischargeNotes: form.dischargeNotes || undefined,

    // Workflow
    status: 'Final' as const,
  };
}