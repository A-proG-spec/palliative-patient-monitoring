import { z } from 'zod';

const vitalsPairSchema = z.object({
  current: z.string().default(''),
  previous: z.string().default(''),
});

const symptomRowSchema = z.object({
  severity: z.enum(['None', 'Mild', 'Moderate', 'Severe']).default('None'),
  notes: z.string().default(''),
});

const medicationRowSchema = z.object({
  medicationTreatment: z.string().default(''),
  dose: z.string().default(''),
  route: z.string().default(''),
  frequency: z.string().default(''),
  reasonResponse: z.string().default(''),
});

const additionalNoteRowSchema = z.object({
  date: z.string().default(''),
  time: z.string().default(''),
  note: z.string().default(''),
  clinicianName: z.string().default(''),
});

const mdtReviewRowSchema = z.object({
  discipline: z.string().default(''),
  reviewIntervention: z.string().default(''),
  followUpRequired: z.enum(['No', 'Yes', '']).default(''),
});

export const createProgressNoteSchema = z.object({
  body: z.object({
    // Relationships
    admissionId: z.string().optional(),
    visitId: z.string().optional(),

    // Header
    attendingClinician: z.string().min(1, 'Attending clinician is required'),

    // 1. Current Clinical Status
    generalCondition: z.enum(['Stable', 'Improving', 'Deteriorating', 'Critical', 'ActivelyDying', '']).default(''),
    levelOfConsciousness: z.enum(['Alert', 'Drowsy', 'Confused', 'Delirious', 'Unresponsive', '']).default(''),
    orientation: z.enum(['Oriented', 'PartiallyOriented', 'Disoriented', 'UnableToAssess', '']).default(''),
    functionalStatus: z.enum(['Independent', 'RequiresAssistance', 'Bedbound', 'FullyDependent', '']).default(''),
    changesSincePreviousReview: z.string().default(''),

    // 2. Vital Signs
    vitals: z.object({
      temperature: vitalsPairSchema.default({ current: '', previous: '' }),
      pulse: vitalsPairSchema.default({ current: '', previous: '' }),
      respiratoryRate: vitalsPairSchema.default({ current: '', previous: '' }),
      bloodPressure: vitalsPairSchema.default({ current: '', previous: '' }),
      spo2: vitalsPairSchema.default({ current: '', previous: '' }),
       oxygenFlow: vitalsPairSchema.default({ current: '', previous: '' }),
    }).optional(),
otherRelevantObservations: z.string().default(''),
    // 3. Symptom Assessment
    symptoms: z.record(z.string(), symptomRowSchema).optional(),
    painScore: z.string().default(''),
    painLocation: z.string().default(''),
    painCharacter: z.string().default(''),
    currentPainManagement: z.string().default(''),
    responseToTreatment: z.enum(['Good', 'Partial', 'Poor', 'NotApplicable', '']).default(''),
    breakthroughPainEpisodes: z.enum(['No', 'Yes', '']).default(''),
    breakthroughPainFrequency: z.string().default(''),

    // 4. Respiratory
    breathing: z.enum(['Comfortable', 'MildDistress', 'ModerateDistress', 'SevereDistress', '']).default(''),
    oxygenTherapy: z.enum(['No', 'Yes', '']).default(''),
    oxygenDelivery: z.enum(['NasalCannula', 'Mask', 'Other', '']).default(''),
    oxygenDeliveryOther: z.string().default(''),
    respiratorySecretions: z.enum(['None', 'Mild', 'Moderate', 'Excessive', '']).default(''),
    cough: z.enum(['No', 'Yes', '']).default(''),
    otherRespiratoryFindings: z.string().default(''),

    // 5. Nutrition
    oralIntake: z.enum(['Good', 'Reduced', 'Minimal', 'None', '']).default(''),
    diet: z.string().default(''),
    fluidIntake: z.string().default(''),
    feedingAssistance: z.enum(['No', 'Yes', '']).default(''),
    enteralFeeding: z.enum(['No', 'Yes', '']).default(''),
    ivFluids: z.enum(['No', 'Yes', '']).default(''),
    nauseaVomitingAffectingIntake: z.enum(['No', 'Yes', '']).default(''),
    nutritionHydrationConcerns: z.string().default(''),

    // 6. Elimination
    urineOutput: z.enum(['Normal', 'Reduced', 'Minimal', 'UnableToAssess', '']).default(''),
    urinaryCatheter: z.enum(['No', 'Yes', '']).default(''),
    bowelMovement: z.enum(['Normal', 'Constipated', 'Diarrhea', 'NoRecentBM', '']).default(''),
    lastBowelMovement: z.string().default(''),
    otherEliminationConcerns: z.string().default(''),

    // 7. Skin
    skin: z.enum(['Intact', 'Dry', 'Fragile', 'Edematous', 'Other', '']).default(''),
    skinOther: z.string().default(''),
    pressureInjury: z.enum(['No', 'Yes', '']).default(''),
    pressureInjuryLocationStage: z.string().default(''),
    woundCareProvided: z.enum(['No', 'Yes', '']).default(''),
    woundPressureInjuryChanges: z.string().default(''),

    // 8. Psychological
    moodBehavior: z.array(z.string()).optional().default([]),
    psychologicalDistress: z.enum(['None', 'Mild', 'Moderate', 'Severe', '']).default(''),
    patientsMainConcernsToday: z.string().default(''),
    counselingPsychologicalSupportProvided: z.enum(['No', 'Yes', '']).default(''),

    // 9. Spiritual
    spiritualDistressIdentified: z.enum(['No', 'Yes', '']).default(''),
    patientsSpiritualCulturalConcerns: z.string().default(''),
    spiritualCareProvided: z.enum(['No', 'Yes', '']).default(''),
    spiritualReferralRequired: z.enum(['No', 'Yes', '']).default(''),
    spiritualNotes: z.string().default(''),

    // 10. Family
    familyCaregiverPresent: z.enum(['No', 'Yes', '']).default(''),
    familyCaregiverConcerns: z.string().default(''),
    familyEducationSupportProvided: z.string().default(''),
    familyMeetingHeld: z.enum(['No', 'Yes', '']).default(''),
    familyMeetingParticipants: z.string().default(''),

    // 11. Goals of Care
    currentGoalsOfCare: z.array(z.string()).optional().default([]),
    currentGoalsOfCareOther: z.string().default(''),
    goalsReviewedToday: z.enum(['No', 'Yes', '']).default(''),
    changeInGoalsIdentified: z.enum(['No', 'Yes', '']).default(''),
    patientDecisionMakerPreferences: z.string().default(''),
    codeStatus: z.enum(['FullResuscitation', 'DNAR', 'Other', '']).default(''),
    codeStatusOther: z.string().default(''),
    advanceCarePlanReviewed: z.enum(['No', 'Yes', '']).default(''),

    // 12. Medication Review
    currentMedicationRegimenReviewed: z.enum(['No', 'Yes', '']).default(''),
    changesMade: z.enum(['No', 'Yes', '']).default(''),
    medications: z.array(medicationRowSchema).optional().default([]),
    prnBreakthroughMedicationUsed: z.enum(['No', 'Yes', '']).default(''),
    prnEffectiveness: z.enum(['Effective', 'PartiallyEffective', 'Ineffective', '']).default(''),
    medicationSideEffects: z.enum(['None', 'Yes', '']).default(''),
    medicationSideEffectsDetail: z.string().default(''),

    // 13. Nursing
    nursingSupportiveCareProvided: z.array(z.string()).optional().default([]),
    nursingSupportiveCareOther: z.string().default(''),
    responseToSupportiveCare: z.string().default(''),

    // 14. Investigations
    investigationsPerformedReviewed: z.array(z.string()).optional().default([]),
    investigationsPerformedReviewedOther: z.string().default(''),
    significantResults: z.string().default(''),
    clinicalSignificanceActionTaken: z.string().default(''),

    // 15. MDT Review
    multidisciplinaryTeamReview: z.array(mdtReviewRowSchema).optional().default([]),

    // 16. Assessment
    overallAssessment: z.string().default(''),
    problemsIdentifiedToday: z.array(z.string()).optional().default([]),

    // 17. Plan
    symptomManagementPlan: z.string().default(''),
    medicationPlan: z.string().default(''),
    nursingSupportiveCarePlan: z.string().default(''),
    investigationsMonitoring: z.string().default(''),
    familyCaregiverPlan: z.string().default(''),
    referralsConsultations: z.string().default(''),
    dischargeTransferHospicePlanning: z.string().default(''),

    // 18. SOAP
    soapSubjective: z.string().default(''),
    soapObjective: z.string().default(''),
    soapAssessment: z.string().default(''),
    soapPlan: z.string().default(''),

    // 19. Additional Notes
    additionalProgressNotes: z.array(additionalNoteRowSchema).optional().default([]),

    // 20. Authorization
    facilityStamp: z.string().default(''),
  }),
});

export const updateProgressNoteSchema = z.object({
  body: createProgressNoteSchema.shape.body.partial(),
});

export const signProgressNoteSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
    role: z.enum(['Physician', 'Nurse', 'Reviewer']),
  }),
});

export const getProgressNotesQuerySchema = z.object({
  query: z.object({
    admissionId: z.string().optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
  }),
});

export type CreateProgressNoteSchema = z.infer<typeof createProgressNoteSchema>;
export type UpdateProgressNoteSchema = z.infer<typeof updateProgressNoteSchema>;
export type SignProgressNoteSchema = z.infer<typeof signProgressNoteSchema>;
export type GetProgressNotesQuerySchema = z.infer<typeof getProgressNotesQuerySchema>;