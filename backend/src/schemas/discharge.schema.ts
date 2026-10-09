import { z } from 'zod';

const medRowSchema = z.object({
  medication: z.string().default(''),
  dose: z.string().default(''),
  route: z.string().default(''),
  frequency: z.string().default(''),
  purpose: z.string().default(''),
  instructions: z.string().default(''),
});

// ─────────────────────────────────────────────────────────────
// Helper — coerce '' / null → undefined so Zod treats blank
// form fields as "not provided" for optional enums.
// ─────────────────────────────────────────────────────────────
const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess(
    (v) => (v === '' || v === null ? undefined : v),
    z.enum(values).optional(),
  );

const symptomSeverity = optionalEnum([
  'None',
  'Mild',
  'Moderate',
  'Severe',
] as const);

export const createDischargeSummarySchema = z.object({
  body: z.object({
    actingAsStaffId: z.coerce.number().int().positive().optional(),

    // Relationships
    admissionId: z.string().optional(),

    // Header
    hospitalName: z.string().default(''),
    palliativeCareUnit: z.string().default(''),
    dateOfAdmission: z.string().optional(),
    dateOfDischarge: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    timeOfDischarge: z.string().optional(),
    dischargeType: optionalEnum([
      'PlannedDischarge',
      'Transfer',
      'DischargeToHome',
      'DischargeToHospice',
      'DischargeToLongTermCare',
      'TransferToAnotherHospital',
      'Other',
    ] as const),
    dischargeTypeOther: z.string().optional(),

    // Patient snapshot
    fullName: z.string().optional(),
    dateOfBirth: z.string().optional(),
    age: z.string().optional(),
    sex: z.string().optional(),
    address: z.string().optional(),
    telephone: z.string().optional(),
    primaryCaregiver: z.string().optional(),
    caregiverRelationship: z.string().optional(),
    caregiverTelephone: z.string().optional(),

    // 2. Admission Info
    primaryDiagnosis: z.string().optional(),
    secondaryDiagnoses: z.string().optional(),
    reasonForAdmission: z.string().optional(),
    referringPhysicianFacility: z.string().optional(),

    // 3. Clinical Summary
    finalDischargeDiagnosis: z.string().optional(),
    clinicalProblemsManaged: z.array(z.string()).optional().default([]),
    summaryOfClinicalCourse: z.string().optional(),
    importantInvestigations: z.string().optional(),

    // 4. Condition at Discharge
    overallCondition: optionalEnum([
      'Stable',
      'Improved',
      'Unchanged',
      'Deteriorating',
      'RequiresOngoingPalliativeCare',
    ] as const),
    levelOfConsciousness: optionalEnum([
      'Alert',
      'Drowsy',
      'Confused',
      'Delirious',
      'Unresponsive',
    ] as const),
    functionalStatus: optionalEnum([
      'Independent',
      'RequiresAssistance',
      'Bedbound',
      'FullyDependent',
    ] as const),
    mobility: optionalEnum([
      'Independent',
      'Assisted',
      'Wheelchair',
      'Bedbound',
    ] as const),
    oralIntake: optionalEnum([
      'Adequate',
      'Reduced',
      'Minimal',
      'None',
    ] as const),

    // 5. Vital Signs
    temperature: z.string().optional(),
    pulse: z.string().optional(),
    respiratoryRate: z.string().optional(),
    bloodPressure: z.string().optional(),
    oxygenSaturation: z.string().optional(),
    oxygenRequirement: z.string().optional(),

    // 6. Symptom status — flat columns
    pain: symptomSeverity,
    painNote: z.string().optional(),
    shortnessOfBreath: symptomSeverity,
    shortnessOfBreathNote: z.string().optional(),
    nausea: symptomSeverity,
    nauseaNote: z.string().optional(),
    vomiting: symptomSeverity,
    vomitingNote: z.string().optional(),
    constipation: symptomSeverity,
    constipationNote: z.string().optional(),
    fatigue: symptomSeverity,
    fatigueNote: z.string().optional(),
    anxiety: symptomSeverity,
    anxietyNote: z.string().optional(),
    delirium: symptomSeverity,
    deliriumNote: z.string().optional(),
    appetiteLoss: symptomSeverity,
    appetiteLossNote: z.string().optional(),
    other: symptomSeverity,
    otherNote: z.string().optional(),
    painScore: z.string().optional(),
    painControl: optionalEnum([
      'WellControlled',
      'PartiallyControlled',
      'PoorlyControlled',
    ] as const),

    // 7. Medications
    dischargeMedications: z.array(medRowSchema).optional().default([]),
    prnMedications: z.string().optional(),
    medicationChanges: z.string().optional(),
    medicationReconciliationCompleted: optionalEnum([
      'NotRequired',
      'Required',
    ] as const),

    // 8. Symptom Management Instructions
    painManagementInstructions: z.string().optional(),
    breathlessnessManagement: z.string().optional(),
    nauseaVomitingManagement: z.string().optional(),
    constipationManagement: z.string().optional(),
    anxietyAgitationDeliriumManagement: z.string().optional(),
    otherSymptomManagement: z.string().optional(),

    // 9. Nutrition
    diet: optionalEnum([
      'Regular',
      'Soft',
      'Pureed',
      'Modified',
      'Other',
    ] as const),
    dietOther: z.string().optional(),
    feedingAssistance: optionalEnum(['NotRequired', 'Required'] as const),
    enteralFeeding: optionalEnum(['NotRequired', 'Required'] as const),
    feedingTube: optionalEnum(['None', 'NG', 'PEG', 'Other'] as const),
    feedingTubeOther: z.string().optional(),
    hydrationInstructions: z.string().optional(),
    nutritionDietitianFollowUp: optionalEnum(['NotRequired', 'Required'] as const),

    // 10. Wound / Skin
    woundPresent: optionalEnum(['NotRequired', 'Required'] as const),
    woundLocation: z.string().optional(),
    woundCareInstructions: z.string().optional(),
    dressingChanges: z.string().optional(),
    pressureInjuryPrevention: z.string().optional(),

    // 11. Oxygen / Equipment
    oxygenRequired: optionalEnum(['NotRequired', 'Required'] as const),
    oxygenDeliveryMethod: optionalEnum([
      'NasalCannula',
      'Mask',
      'Other',
    ] as const),
    oxygenDeliveryMethodOther: z.string().optional(),
    oxygenFlowRate: z.string().optional(),
    equipmentRequired: z.array(z.string()).optional().default([]),
    equipmentOther: z.string().optional(),
    equipmentArranged: optionalEnum(['NotRequired', 'Required'] as const),

    // 12. Goals of Care
    currentGoalsOfCare: z.array(z.string()).optional().default([]),
    currentGoalsOfCareOther: z.string().optional(),
    goalsOfCareReviewed: optionalEnum(['NotRequired', 'Required'] as const),
    patientDecisionMakerPreferences: z.string().optional(),
    codeStatus: optionalEnum([
      'FullResuscitation',
      'DNAR',
      'Other',
    ] as const),
    codeStatusOther: z.string().optional(),
    advanceCarePlan: optionalEnum([
      'NotAvailable',
      'Completed',
      'Reviewed',
      'Updated',
    ] as const),

    // 13. Destination
    dischargedTo: optionalEnum([
      'Home',
      'FamilyCaregiverHome',
      'Hospice',
      'NursingLongTermCare',
      'AnotherHospital',
      'Other',
    ] as const),
    dischargedToOther: z.string().optional(),
    destinationAddress: z.string().optional(),
    transport: optionalEnum([
      'FamilyPrivateTransport',
      'Ambulance',
      'MedicalTransport',
      'Other',
    ] as const),
    transportOther: z.string().optional(),
    escortCaregiver: z.string().optional(),

    // 14. Home / Hospice
    homePalliativeCareRequired: optionalEnum(['NotRequired', 'Required'] as const),
    hospiceReferral: optionalEnum([
      'No',
      'Yes',
      'AlreadyEnrolled',
    ] as const),
    communityNursingRequired: optionalEnum(['NotRequired', 'Required'] as const),
    homeVisitsRequired: optionalEnum(['NotRequired', 'Required'] as const),
    caregiverSupportRequired: optionalEnum(['NotRequired', 'Required'] as const),
    servicesArranged: z.string().optional(),
    responsibleProvider: z.string().optional(),
    responsibleProviderPhone: z.string().optional(),

    // 15. Education
    educationTopics: z.array(z.string()).optional().default([]),
    educationOther: z.string().optional(),
    patientUnderstanding: optionalEnum([
      'VerbalizedUnderstanding',
      'DemonstratedUnderstanding',
      'RequiresFurtherEducation',
    ] as const),
    additionalEducationRequired: z.string().optional(),

    // 16. Warning Signs
    warningSigns: z.array(z.string()).optional().default([]),
    warningSignsOther: z.string().optional(),
    warningSignsSpecificInstructions: z.string().optional(),

    // 17. Follow-up
    palliativeCareFollowUp: optionalEnum(['NotRequired', 'Required'] as const),
    palliativeCareFollowUpDate: z.string().optional(),
    palliativeCareFollowUpTime: z.string().optional(),
    physicianSpecialistFollowUp: z.string().optional(),
    primaryCareFollowUp: z.string().optional(),
    hospiceHomeCareFollowUp: z.string().optional(),
    otherAppointments: z.string().optional(),

    // 18. Contacts
    palliativeCareUnitContact: z.string().optional(),
    palliativeCareUnitPhone: z.string().optional(),
    attendingClinician: z.string().optional(),
    attendingClinicianPhone: z.string().optional(),
    emergencyContactInfo: z.string().optional(),
    homeHospiceService: z.string().optional(),
    homeHospiceServicePhone: z.string().optional(),

    // 19. Notes
    dischargeNotes: z.string().optional(),

    // Workflow
    status: optionalEnum(['Draft', 'Final'] as const),
  }),
});

export const updateDischargeSummarySchema = z.object({
  body: createDischargeSummarySchema.shape.body.partial(),
});

export type CreateDischargeSummarySchema = z.infer<typeof createDischargeSummarySchema>;
export type UpdateDischargeSummarySchema = z.infer<typeof updateDischargeSummarySchema>;