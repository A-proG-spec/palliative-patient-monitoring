import { z } from 'zod';

const medRowSchema = z.object({
  medication: z.string().default(''),
  dose: z.string().default(''),
  route: z.string().default(''),
  frequency: z.string().default(''),
  purpose: z.string().default(''),
  instructions: z.string().default(''),
});

const symptomSeverity = z.enum(['None', 'Mild', 'Moderate', 'Severe', '']).default('');

export const createDischargeSummarySchema = z.object({
  body: z.object({
    // Relationships
    admissionId: z.string().optional(),

    // Header
    hospitalName: z.string().default(''),
    palliativeCareUnit: z.string().default(''),
    dateOfAdmission: z.string().optional(),
    dateOfDischarge: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    timeOfDischarge: z.string().optional(),
    dischargeType: z.enum([
      'PlannedDischarge', 'Transfer', 'DischargeToHome', 'DischargeToHospice',
      'DischargeToLongTermCare', 'TransferToAnotherHospital', 'Other',
    ]).optional(),
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
    overallCondition: z.enum(['Stable', 'Improved', 'Unchanged', 'Deteriorating', 'RequiresOngoingPalliativeCare']).optional(),
    levelOfConsciousness: z.enum(['Alert', 'Drowsy', 'Confused', 'Delirious', 'Unresponsive']).optional(),
    functionalStatus: z.enum(['Independent', 'RequiresAssistance', 'Bedbound', 'FullyDependent']).optional(),
    mobility: z.enum(['Independent', 'Assisted', 'Wheelchair', 'Bedbound']).optional(),
    oralIntake: z.enum(['Adequate', 'Reduced', 'Minimal', 'None']).optional(),

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
    painControl: z.enum(['WellControlled', 'PartiallyControlled', 'PoorlyControlled']).optional(),

    // 7. Medications
    dischargeMedications: z.array(medRowSchema).optional().default([]),
    prnMedications: z.string().optional(),
    medicationChanges: z.string().optional(),
    medicationReconciliationCompleted: z.enum(['NotRequired', 'Required']).optional(),

    // 8. Symptom Management Instructions
    painManagementInstructions: z.string().optional(),
    breathlessnessManagement: z.string().optional(),
    nauseaVomitingManagement: z.string().optional(),
    constipationManagement: z.string().optional(),
    anxietyAgitationDeliriumManagement: z.string().optional(),
    otherSymptomManagement: z.string().optional(),

    // 9. Nutrition
    diet: z.enum(['Regular', 'Soft', 'Pureed', 'Modified', 'Other']).optional(),
    dietOther: z.string().optional(),
    feedingAssistance: z.enum(['NotRequired', 'Required']).optional(),
    enteralFeeding: z.enum(['NotRequired', 'Required']).optional(),
    feedingTube: z.enum(['None', 'NG', 'PEG', 'Other']).optional(),
    feedingTubeOther: z.string().optional(),
    hydrationInstructions: z.string().optional(),
    nutritionDietitianFollowUp: z.enum(['NotRequired', 'Required']).optional(),

    // 10. Wound / Skin
    woundPresent: z.enum(['NotRequired', 'Required']).optional(),
    woundLocation: z.string().optional(),
    woundCareInstructions: z.string().optional(),
    dressingChanges: z.string().optional(),
    pressureInjuryPrevention: z.string().optional(),

    // 11. Oxygen / Equipment
    oxygenRequired: z.enum(['NotRequired', 'Required']).optional(),
    oxygenDeliveryMethod: z.enum(['NasalCannula', 'Mask', 'Other']).optional(),
    oxygenDeliveryMethodOther: z.string().optional(),
    oxygenFlowRate: z.string().optional(),
    equipmentRequired: z.array(z.string()).optional().default([]),
    equipmentOther: z.string().optional(),
    equipmentArranged: z.enum(['NotRequired', 'Required']).optional(),

    // 12. Goals of Care
    currentGoalsOfCare: z.array(z.string()).optional().default([]),
    currentGoalsOfCareOther: z.string().optional(),
    goalsOfCareReviewed: z.enum(['NotRequired', 'Required']).optional(),
    patientDecisionMakerPreferences: z.string().optional(),
    codeStatus: z.enum(['FullResuscitation', 'DNAR', 'Other']).optional(),
    codeStatusOther: z.string().optional(),
    advanceCarePlan: z.enum(['NotAvailable', 'Completed', 'Reviewed', 'Updated']).optional(),

    // 13. Destination
    dischargedTo: z.enum([
      'Home', 'FamilyCaregiverHome', 'Hospice', 'NursingLongTermCare',
      'AnotherHospital', 'Other',
    ]).optional(),
    dischargedToOther: z.string().optional(),
    destinationAddress: z.string().optional(),
    transport: z.enum(['FamilyPrivateTransport', 'Ambulance', 'MedicalTransport', 'Other']).optional(),
    transportOther: z.string().optional(),
    escortCaregiver: z.string().optional(),

    // 14. Home / Hospice
    homePalliativeCareRequired: z.enum(['NotRequired', 'Required']).optional(),
    hospiceReferral: z.enum(['No', 'Yes', 'AlreadyEnrolled']).optional(),
    communityNursingRequired: z.enum(['NotRequired', 'Required']).optional(),
    homeVisitsRequired: z.enum(['NotRequired', 'Required']).optional(),
    caregiverSupportRequired: z.enum(['NotRequired', 'Required']).optional(),
    servicesArranged: z.string().optional(),
    responsibleProvider: z.string().optional(),
    responsibleProviderPhone: z.string().optional(),

    // 15. Education
    educationTopics: z.array(z.string()).optional().default([]),
    educationOther: z.string().optional(),
    patientUnderstanding: z.enum([
      'VerbalizedUnderstanding', 'DemonstratedUnderstanding', 'RequiresFurtherEducation',
    ]).optional(),
    additionalEducationRequired: z.string().optional(),

    // 16. Warning Signs
    warningSigns: z.array(z.string()).optional().default([]),
    warningSignsOther: z.string().optional(),
    warningSignsSpecificInstructions: z.string().optional(),

    // 17. Follow-up
    palliativeCareFollowUp: z.enum(['NotRequired', 'Required']).optional(),
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
    status: z.enum(['Draft', 'Final']).optional(),
  }),
});

export const updateDischargeSummarySchema = z.object({
  body: createDischargeSummarySchema.shape.body.partial(),
});

export type CreateDischargeSummarySchema = z.infer<typeof createDischargeSummarySchema>;
export type UpdateDischargeSummarySchema = z.infer<typeof updateDischargeSummarySchema>;