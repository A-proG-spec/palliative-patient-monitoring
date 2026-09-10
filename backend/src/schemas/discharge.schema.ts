import { z } from 'zod';

const symptomRowSchema = z.object({
  severity: z.enum(['None', 'Mild', 'Moderate', 'Severe']).default('None'),
  managementNotes: z.string().default(''),
});

const medRowSchema = z.object({
  medication: z.string().default(''),
  dose: z.string().default(''),
  route: z.string().default(''),
  frequency: z.string().default(''),
  purpose: z.string().default(''),
  instructions: z.string().default(''),
});

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
      'DischargeToLongTermCare', 'TransferToAnotherHospital', 'Other', '',
    ]).default(''),
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
    overallCondition: z.enum([
      'Stable', 'Improved', 'Unchanged', 'Deteriorating',
      'RequiresOngoingPalliativeCare', '',
    ]).default(''),
    levelOfConsciousness: z.enum(['Alert', 'Drowsy', 'Confused', 'Delirious', 'Unresponsive', '']).default(''),
    functionalStatus: z.enum(['Independent', 'RequiresAssistance', 'Bedbound', 'FullyDependent', '']).default(''),
    mobility: z.enum(['Independent', 'Assisted', 'Wheelchair', 'Bedbound', '']).default(''),
    oralIntake: z.enum(['Adequate', 'Reduced', 'Minimal', 'None', '']).default(''),

    // 5. Vital Signs
    temperature: z.string().optional(),
    pulse: z.string().optional(),
    respiratoryRate: z.string().optional(),
    bloodPressure: z.string().optional(),
    oxygenSaturation: z.string().optional(),
    oxygenRequirement: z.string().optional(),

    // 6. Symptoms
    symptoms: z.record(z.string(), symptomRowSchema).optional(),
    painScore: z.string().optional(),
    painControl: z.enum(['WellControlled', 'PartiallyControlled', 'PoorlyControlled', '']).default(''),

    // 7. Medications
    dischargeMedications: z.array(medRowSchema).optional().default([]),
    prnMedications: z.string().optional(),
    medicationChanges: z.string().optional(),
    medicationReconciliationCompleted: z.enum(['No', 'Yes', '']).default(''),

    // 8. Symptom Management Instructions
    painManagementInstructions: z.string().optional(),
    breathlessnessManagement: z.string().optional(),
    nauseaVomitingManagement: z.string().optional(),
    constipationManagement: z.string().optional(),
    anxietyAgitationDeliriumManagement: z.string().optional(),
    otherSymptomManagement: z.string().optional(),

    // 9. Nutrition
    diet: z.enum(['Regular', 'Soft', 'Pureed', 'Modified', 'Other', '']).default(''),
    dietOther: z.string().optional(),
    feedingAssistance: z.enum(['NotRequired', 'Required', '']).default(''),
    enteralFeeding: z.enum(['No', 'Yes', '']).default(''),
    feedingTube: z.enum(['None', 'NG', 'PEG', 'Other', '']).default(''),
    feedingTubeOther: z.string().optional(),
    hydrationInstructions: z.string().optional(),
    nutritionDietitianFollowUp: z.enum(['No', 'Yes', '']).default(''),

    // 10. Wound / Skin
    woundPresent: z.enum(['No', 'Yes', '']).default(''),
    woundLocation: z.string().optional(),
    woundCareInstructions: z.string().optional(),
    dressingChanges: z.string().optional(),
    pressureInjuryPrevention: z.string().optional(),

    // 11. Oxygen / Equipment
    oxygenRequired: z.enum(['No', 'Yes', '']).default(''),
    oxygenDeliveryMethod: z.enum(['NasalCannula', 'Mask', 'Other', '']).default(''),
    oxygenDeliveryMethodOther: z.string().optional(),
    oxygenFlowRate: z.string().optional(),
    equipmentRequired: z.array(z.string()).optional().default([]),
    equipmentOther: z.string().optional(),
    equipmentArranged: z.enum(['No', 'Yes', '']).default(''),

    // 12. Goals of Care
    currentGoalsOfCare: z.array(z.string()).optional().default([]),
    currentGoalsOfCareOther: z.string().optional(),
    goalsOfCareReviewed: z.enum(['No', 'Yes', '']).default(''),
    patientDecisionMakerPreferences: z.string().optional(),
    codeStatus: z.enum(['FullResuscitation', 'DNAR', 'Other', '']).default(''),
    codeStatusOther: z.string().optional(),
    advanceCarePlan: z.enum(['NotAvailable', 'Completed', 'Reviewed', 'Updated', '']).default(''),

    // 13. Destination
    dischargedTo: z.enum([
      'Home', 'FamilyCaregiverHome', 'Hospice', 'NursingLongTermCare',
      'AnotherHospital', 'Other', '',
    ]).default(''),
    dischargedToOther: z.string().optional(),
    destinationAddress: z.string().optional(),
    transport: z.enum(['FamilyPrivateTransport', 'Ambulance', 'MedicalTransport', 'Other', '']).default(''),
    transportOther: z.string().optional(),
    escortCaregiver: z.string().optional(),

    // 14. Home / Hospice
    homePalliativeCareRequired: z.enum(['No', 'Yes', '']).default(''),
    hospiceReferral: z.enum(['No', 'Yes', 'AlreadyEnrolled', '']).default(''),
    communityNursingRequired: z.enum(['No', 'Yes', '']).default(''),
    homeVisitsRequired: z.enum(['No', 'Yes', '']).default(''),
    caregiverSupportRequired: z.enum(['No', 'Yes', '']).default(''),
    servicesArranged: z.string().optional(),
    responsibleProvider: z.string().optional(),
    responsibleProviderPhone: z.string().optional(),

    // 15. Education
    educationTopics: z.array(z.string()).optional().default([]),
    educationOther: z.string().optional(),
    patientUnderstanding: z.enum([
      'VerbalizedUnderstanding', 'DemonstratedUnderstanding',
      'RequiresFurtherEducation', '',
    ]).default(''),
    additionalEducationRequired: z.string().optional(),

    // 16. Warning Signs
    warningSigns: z.array(z.string()).optional().default([]),
    warningSignsOther: z.string().optional(),
    warningSignsSpecificInstructions: z.string().optional(),

    // 17. Follow-up
    palliativeCareFollowUp: z.enum(['No', 'Yes', '']).default(''),
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
  }),
});

export const updateDischargeSummarySchema = z.object({
  body: createDischargeSummarySchema.shape.body.partial(),
});

export type CreateDischargeSummarySchema = z.infer<typeof createDischargeSummarySchema>;
export type UpdateDischargeSummarySchema = z.infer<typeof updateDischargeSummarySchema>;