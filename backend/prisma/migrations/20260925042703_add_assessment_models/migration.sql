-- CreateEnum
CREATE TYPE "PharmacistAssessmentType" AS ENUM ('Admission', 'FollowUp', 'MedicationReview');

-- CreateEnum
CREATE TYPE "PharmacistWeightStatus" AS ENUM ('Good', 'Fair', 'Poor', 'Unknown');

-- CreateEnum
CREATE TYPE "PharmacistPainControl" AS ENUM ('WellControlled', 'PartiallyControlled', 'PoorlyControlled');

-- CreateEnum
CREATE TYPE "PharmacistBreakthroughPain" AS ENUM ('None', 'Occasional', 'Frequent');

-- CreateEnum
CREATE TYPE "PharmacistOpioidSideEffect" AS ENUM ('Constipation', 'Nausea', 'Sedation', 'Confusion', 'RespiratoryDepression', 'None');

-- CreateEnum
CREATE TYPE "PharmacistInteractionRisk" AS ENUM ('None', 'Possible', 'Significant');

-- CreateEnum
CREATE TYPE "PharmacistHighRiskMedication" AS ENUM ('Opioids', 'Benzodiazepines', 'Anticoagulants', 'Steroids', 'Antiepileptics');

-- CreateEnum
CREATE TYPE "PharmacistOrganFunction" AS ENUM ('Normal', 'Impaired', 'Unknown');

-- CreateEnum
CREATE TYPE "PharmacistEffectiveness" AS ENUM ('Good', 'Fair', 'Poor');

-- CreateEnum
CREATE TYPE "PharmacistAdrSeverity" AS ENUM ('Mild', 'Moderate', 'Severe');

-- CreateEnum
CREATE TYPE "PharmacistAdrAction" AS ENUM ('DoseAdjustment', 'DrugDiscontinued', 'SymptomaticTreatment', 'ReportedToCommittee');

-- CreateEnum
CREATE TYPE "PharmacistBowelFunction" AS ENUM ('Normal', 'Constipated', 'SevereConstipation');

-- CreateEnum
CREATE TYPE "PharmacistDoseAdjustmentReason" AS ENUM ('RenalImpairment', 'HepaticImpairment', 'ElderlyDosing', 'WeightBasedAdjustment');

-- CreateEnum
CREATE TYPE "PharmacistPatientUnderstanding" AS ENUM ('Good', 'Moderate', 'Poor');

-- CreateEnum
CREATE TYPE "PharmacistCounselingTopic" AS ENUM ('PainMedications', 'OpioidSafety', 'SideEffects', 'Adherence', 'ConstipationPrevention', 'EndOfLifeMedications');

-- CreateEnum
CREATE TYPE "PharmacistMedicationPlanAction" AS ENUM ('OptimizeAnalgesicRegimen', 'StartAdjustLaxatives', 'ManageNauseaVomiting', 'ReviewPolypharmacy', 'ReduceUnnecessaryMedications', 'InitiateAdjuvantTherapy', 'MonitorSedationLevel', 'Other');

-- CreateEnum
CREATE TYPE "PharmacistMedicationAvailability" AS ENUM ('AllAvailable', 'PartiallyAvailable', 'NotAvailable');

-- CreateEnum
CREATE TYPE "PharmacistSummaryFlag" AS ENUM ('MedicationRegimenAppropriate', 'RequiresOptimization', 'RequiresUrgentIntervention', 'HighRiskMedicationProfile', 'DeprescribingRecommended', 'OngoingMonitoringRequired');

-- CreateEnum
CREATE TYPE "PharmacistFinalRecommendation" AS ENUM ('ContinueCurrentRegimen', 'ModifyAnalgesicPlan', 'InitiateSymptomControlMedications', 'DeprescribeNonEssentialMedications', 'EnhanceSafetyMonitoring', 'MultidisciplinaryReviewRequired');

-- CreateEnum
CREATE TYPE "PhysiotherapyAssessmentType" AS ENUM ('Admission', 'FollowUp', 'Reassessment');

-- CreateEnum
CREATE TYPE "PhysiotherapyComorbidity" AS ENUM ('Hypertension', 'DiabetesMellitus', 'Stroke', 'COPD', 'HeartFailure', 'Cancer', 'Other');

-- CreateEnum
CREATE TYPE "PhysiotherapyGeneralCondition" AS ENUM ('Stable', 'Deteriorating', 'Bedbound', 'TerminalPhase');

-- CreateEnum
CREATE TYPE "PhysiotherapyPainType" AS ENUM ('Musculoskeletal', 'Neuropathic', 'CancerRelated', 'Mixed', 'Other');

-- CreateEnum
CREATE TYPE "PhysiotherapySymptom" AS ENUM ('Fatigue', 'Dyspnea', 'Weakness', 'MuscleStiffness', 'BalanceProblems', 'Contractures');

-- CreateEnum
CREATE TYPE "PhysiotherapyMobilityStatus" AS ENUM ('Independent', 'RequiresAssistance', 'WheelchairBound', 'Bedridden');

-- CreateEnum
CREATE TYPE "PhysiotherapyTransferAbility" AS ENUM ('Independent', 'MinimalAssistance', 'ModerateAssistance', 'Dependent');

-- CreateEnum
CREATE TYPE "PhysiotherapyWalkingAbility" AS ENUM ('Normal', 'ReducedDistance', 'WithAid', 'UnableToWalk');

-- CreateEnum
CREATE TYPE "PhysiotherapyAssistiveDevice" AS ENUM ('None', 'Cane', 'Walker', 'Wheelchair', 'Other');

-- CreateEnum
CREATE TYPE "PhysiotherapyRangeOfMotion" AS ENUM ('Full', 'Reduced', 'SeverelyLimited');

-- CreateEnum
CREATE TYPE "PhysiotherapyJointFinding" AS ENUM ('None', 'Present');

-- CreateEnum
CREATE TYPE "PhysiotherapyConsciousness" AS ENUM ('Alert', 'Drowsy', 'Confused');

-- CreateEnum
CREATE TYPE "PhysiotherapyCoordination" AS ENUM ('Normal', 'Impaired');

-- CreateEnum
CREATE TYPE "PhysiotherapySensoryDeficit" AS ENUM ('None', 'Present');

-- CreateEnum
CREATE TYPE "PhysiotherapyBalance" AS ENUM ('Stable', 'Unstable', 'HighFallRisk');

-- CreateEnum
CREATE TYPE "PhysiotherapyBreathingPattern" AS ENUM ('Normal', 'Shallow', 'Labored');

-- CreateEnum
CREATE TYPE "PhysiotherapyBreathlessnessLevel" AS ENUM ('None', 'Mild', 'Moderate', 'Severe');

-- CreateEnum
CREATE TYPE "PhysiotherapyChestExpansion" AS ENUM ('Normal', 'Reduced');

-- CreateEnum
CREATE TYPE "PhysiotherapyRespiratoryNeed" AS ENUM ('BreathingExercises', 'ChestPhysiotherapy', 'PositioningSupport');

-- CreateEnum
CREATE TYPE "PhysiotherapyPressureRisk" AS ENUM ('Low', 'Moderate', 'High');

-- CreateEnum
CREATE TYPE "PhysiotherapyPressureArea" AS ENUM ('None', 'Sacrum', 'Heels', 'Hips', 'Other');

-- CreateEnum
CREATE TYPE "PhysiotherapyPressurePrevention" AS ENUM ('Repositioning', 'PressureMattress', 'SkinCareEducation', 'PassiveExercises');

-- CreateEnum
CREATE TYPE "PhysiotherapyAdlActivity" AS ENUM ('BedMobility', 'Feeding', 'Bathing', 'Dressing', 'Toileting');

-- CreateEnum
CREATE TYPE "PhysiotherapyAdlLevel" AS ENUM ('Independent', 'Assisted', 'Dependent');

-- CreateEnum
CREATE TYPE "PhysiotherapyFallRiskLevel" AS ENUM ('Low', 'Moderate', 'High');

-- CreateEnum
CREATE TYPE "PhysiotherapyFallContributor" AS ENUM ('Weakness', 'BalanceIssues', 'SedativeMedication', 'EnvironmentalHazards', 'PosturalHypotension');

-- CreateEnum
CREATE TYPE "PhysiotherapyDiagnosis" AS ENUM ('DecreasedMobility', 'MuscleWeakness', 'ImpairedBalance', 'ReducedEndurance', 'JointStiffness', 'RiskOfContractures', 'ReducedFunctionalIndependence');

-- CreateEnum
CREATE TYPE "PhysiotherapyIntervention" AS ENUM ('PassiveRangeOfMotionExercises', 'ActiveAssistedExercises', 'BreathingExercises', 'PositioningProgram', 'PainReductionTechniques', 'MobilityTraining', 'SittingBalanceTraining', 'WalkingAssistance', 'FamilyCaregiverTraining');

-- CreateEnum
CREATE TYPE "PhysiotherapyFrequency" AS ENUM ('Daily', 'ThreeToFiveTimesPerWeek', 'Weekly', 'AsTolerated');

-- CreateEnum
CREATE TYPE "PhysiotherapyEquipment" AS ENUM ('Wheelchair', 'WalkingFrame', 'Crutches', 'PressureMattress', 'BedRails', 'TransferBoard', 'None');

-- CreateEnum
CREATE TYPE "PhysiotherapyCaregiverTraining" AS ENUM ('PositioningTechniques', 'SafeTransfers', 'ExerciseAssistance', 'FallPrevention', 'PressureSorePrevention', 'MobilitySupport');

-- CreateEnum
CREATE TYPE "PhysiotherapyOutcome" AS ENUM ('FullyIndependent', 'RehabilitationNotRequired', 'RequiresSupportivePhysiotherapy', 'RequiresIntensiveMobilitySupport', 'HighRiskForFunctionalDecline', 'PalliativeComfortFocusedPhysiotherapyRequired');

-- CreateEnum
CREATE TYPE "PhysiotherapyFinalRecommendation" AS ENUM ('ComfortFocusedPhysiotherapy', 'MobilityMaintenanceExercises', 'PainReliefPositioningTherapy', 'BreathingExercises', 'CaregiverTraining', 'MultidisciplinaryHospiceCarePlan');

-- CreateEnum
CREATE TYPE "FamilyAssessmentType" AS ENUM ('Admission', 'FollowUp', 'CrisisReview');

-- CreateEnum
CREATE TYPE "FamilyDecisionMaker" AS ENUM ('Patient', 'Spouse', 'Child', 'Parent', 'Other');

-- CreateEnum
CREATE TYPE "FamilyCaregiverAvailability" AS ENUM ('FullTime', 'PartTime', 'Occasional', 'NotAvailable');

-- CreateEnum
CREATE TYPE "FamilyPhysicalAbility" AS ENUM ('Strong', 'Moderate', 'Limited', 'Unable');

-- CreateEnum
CREATE TYPE "FamilyEmotionalReadiness" AS ENUM ('Ready', 'SomewhatReady', 'Overwhelmed', 'NotReady');

-- CreateEnum
CREATE TYPE "FamilyKnowledgeLevel" AS ENUM ('Good', 'Moderate', 'Poor', 'None');

-- CreateEnum
CREATE TYPE "FamilyInternalSupport" AS ENUM ('StrongFamilyUnity', 'ModerateSupport', 'ConflictPresent', 'NoSupport');

-- CreateEnum
CREATE TYPE "FamilyExternalSupport" AS ENUM ('Community', 'ReligiousInstitution', 'NgoSupport', 'None');

-- CreateEnum
CREATE TYPE "FamilySocialIsolationRisk" AS ENUM ('Low', 'Moderate', 'High');

-- CreateEnum
CREATE TYPE "FamilyIncomeSource" AS ENUM ('Employment', 'Farming', 'Pension', 'FamilySupport', 'NoStableIncome');

-- CreateEnum
CREATE TYPE "FamilyIncomeLevel" AS ENUM ('Low', 'Moderate', 'High', 'Unknown');

-- CreateEnum
CREATE TYPE "FamilyFinancialBurden" AS ENUM ('None', 'Mild', 'Moderate', 'Severe');

-- CreateEnum
CREATE TYPE "FamilyFinancialChallenge" AS ENUM ('MedicationCosts', 'Transportation', 'FoodInsecurity', 'LossOfIncome', 'CaregiverBurden');

-- CreateEnum
CREATE TYPE "FamilyHousingType" AS ENUM ('Owned', 'Rented', 'TemporaryShelter', 'Other');

-- CreateEnum
CREATE TYPE "FamilyHomeEnvironment" AS ENUM ('Safe', 'PartiallySafe', 'Unsafe');

-- CreateEnum
CREATE TYPE "FamilyCopingAbility" AS ENUM ('Strong', 'Moderate', 'Poor');

-- CreateEnum
CREATE TYPE "FamilyEmotionalStatus" AS ENUM ('Calm', 'Anxious', 'Distressed', 'Overwhelmed');

-- CreateEnum
CREATE TYPE "FamilyAnticipatoryGrief" AS ENUM ('None', 'Mild', 'Moderate', 'Severe');

-- CreateEnum
CREATE TYPE "FamilyReligiousAffiliation" AS ENUM ('Orthodox', 'Muslim', 'Protestant', 'Catholic', 'Other');

-- CreateEnum
CREATE TYPE "FamilyPalliativeAcceptance" AS ENUM ('FullyAccepting', 'PartiallyAccepting', 'Resistant', 'NotInformed');

-- CreateEnum
CREATE TYPE "FamilyBurdenLevel" AS ENUM ('Low', 'Moderate', 'High', 'Severe');

-- CreateEnum
CREATE TYPE "FamilyBurdenFactor" AS ENUM ('PhysicalExhaustion', 'EmotionalStress', 'FinancialStrain', 'LackOfSupport', 'LackOfKnowledge');

-- CreateEnum
CREATE TYPE "FamilyNeed" AS ENUM ('EducationOnDiseaseProcess', 'CaregiverTraining', 'FinancialAssistance', 'PsychologicalCounseling', 'SpiritualSupport', 'RespiteCare', 'BereavementPreparation');

-- CreateEnum
CREATE TYPE "FamilyStrength" AS ENUM ('StrongBonding', 'WillingCaregiver', 'ReligiousSupport', 'StableHousing', 'CommunitySupport', 'GoodCommunication');

-- CreateEnum
CREATE TYPE "FamilySupportService" AS ENUM ('SocialWork', 'PsychologyPsychiatry', 'SpiritualCare', 'FinancialAssistancePrograms', 'CommunityVolunteers');

-- CreateEnum
CREATE TYPE "FamilyFollowUpPlan" AS ENUM ('Daily', 'Weekly', 'Monthly', 'AsNeeded');

-- CreateEnum
CREATE TYPE "FamilyAssessmentOutcome" AS ENUM ('StrongFamilySupport', 'AdequateSupportWithInterventionNeeded', 'HighCaregiverBurden', 'AtRiskFamilySystem', 'RequiresIntensivePsychosocialSupport');

-- CreateEnum
CREATE TYPE "FamilyFinalRecommendation" AS ENUM ('ContinueFamilyInvolvement', 'ProvideCaregiverTraining', 'InitiateFinancialSocialSupport', 'PsychologicalCounselingRequired', 'BereavementPreparationNeeded', 'MultidisciplinaryFamilyIntervention');

-- CreateEnum
CREATE TYPE "NutritionAssessmentType" AS ENUM ('Admission', 'FollowUp', 'Reassessment');

-- CreateEnum
CREATE TYPE "NutritionStatusClassification" AS ENUM ('Normal', 'MildMalnutrition', 'ModerateMalnutrition', 'SevereMalnutrition');

-- CreateEnum
CREATE TYPE "NutritionSignificantWeightLoss" AS ENUM ('No', 'YesOver5PercentIn1Month', 'YesOver10PercentIn6Months');

-- CreateEnum
CREATE TYPE "NutritionAppetite" AS ENUM ('Good', 'Fair', 'Poor', 'VeryPoor', 'NoAppetite');

-- CreateEnum
CREATE TYPE "NutritionAppetiteTrend" AS ENUM ('Improved', 'Unchanged', 'Decreased');

-- CreateEnum
CREATE TYPE "NutritionAppetiteCause" AS ENUM ('Pain', 'Nausea', 'Vomiting', 'Depression', 'Fatigue', 'MedicationSideEffects', 'DifficultySwallowing', 'EarlySatiety', 'Other');

-- CreateEnum
CREATE TYPE "NutritionMealsPerDay" AS ENUM ('One', 'Two', 'Three', 'MoreThanThree');

-- CreateEnum
CREATE TYPE "NutritionOralIntake" AS ENUM ('Adequate', 'Reduced', 'Minimal', 'Nil');

-- CreateEnum
CREATE TYPE "NutritionFluidIntake" AS ENUM ('Adequate', 'Reduced', 'Minimal', 'Nil');

-- CreateEnum
CREATE TYPE "NutritionSpecialDiet" AS ENUM ('No', 'Yes');

-- CreateEnum
CREATE TYPE "NutritionFeedingMethod" AS ENUM ('Oral', 'NasogastricTube', 'PEGTube', 'Other');

-- CreateEnum
CREATE TYPE "NutritionFeedingAssistance" AS ENUM ('No', 'PartialAssistance', 'FullAssistance');

-- CreateEnum
CREATE TYPE "NutritionSymptomSeverity" AS ENUM ('None', 'Mild', 'Moderate', 'Severe');

-- CreateEnum
CREATE TYPE "NutritionEnergyLevel" AS ENUM ('Normal', 'MildFatigue', 'ModerateFatigue', 'SevereFatigue');

-- CreateEnum
CREATE TYPE "NutritionMealPreparation" AS ENUM ('Independent', 'RequiresAssistance', 'Unable');

-- CreateEnum
CREATE TYPE "NutritionFeedingAbility" AS ENUM ('Independent', 'RequiresAssistance', 'Dependent');

-- CreateEnum
CREATE TYPE "NutritionLabTest" AS ENUM ('Hemoglobin', 'Albumin', 'TotalProtein', 'BloodGlucose', 'Creatinine', 'Other');

-- CreateEnum
CREATE TYPE "NutritionRiskFactor" AS ENUM ('SignificantWeightLoss', 'PoorAppetite', 'AdvancedDisease', 'DifficultySwallowing', 'RecurrentVomiting', 'SevereFatigue', 'ReducedFoodIntake', 'LowBmi', 'FoodInsecurity');

-- CreateEnum
CREATE TYPE "NutritionOverallRisk" AS ENUM ('Low', 'Moderate', 'High', 'Critical');

-- CreateEnum
CREATE TYPE "NutritionDiagnosis" AS ENUM ('ProteinEnergyMalnutrition', 'InadequateOralIntake', 'CancerCachexia', 'Dysphagia', 'DehydrationRisk', 'FoodInsecurity', 'WeightLoss', 'Other');

-- CreateEnum
CREATE TYPE "NutritionIntervention" AS ENUM ('HighCalorieDiet', 'HighProteinDiet', 'OralNutritionalSupplements', 'SmallFrequentMeals', 'AppetiteStimulationStrategies', 'DysphagiaDietModification', 'TubeFeedingSupport', 'FamilyNutritionEducation', 'SocialSupportReferral', 'Other');

-- CreateEnum
CREATE TYPE "NutritionMonitoringPlan" AS ENUM ('WeeklyWeightMonitoring', 'DietaryIntakeMonitoring', 'SymptomMonitoring', 'MonthlyNutritionalReview', 'Other');

-- CreateEnum
CREATE TYPE "NutritionAssessmentOutcome" AS ENUM ('AdequateNutritionalStatus', 'MildNutritionalRisk', 'ModerateNutritionalRisk', 'HighNutritionalRisk', 'RequiresSpecializedNutritionalSupport', 'RequiresSocialSupportForNutrition');

-- CreateEnum
CREATE TYPE "NutritionFinalRecommendation" AS ENUM ('ContinueCurrentDiet', 'ModifiedTherapeuticDiet', 'OralNutritionalSupplements', 'IntensiveNutritionalMonitoring', 'HomeBasedNutritionFollowUp', 'MultidisciplinaryReviewRequired');

-- CreateEnum
CREATE TYPE "PainAssessmentType" AS ENUM ('Admission', 'FollowUp', 'EmergencyPainReview');

-- CreateEnum
CREATE TYPE "PainOnset" AS ENUM ('Acute', 'Chronic', 'Progressive');

-- CreateEnum
CREATE TYPE "PainLocation" AS ENUM ('Head', 'Chest', 'Abdomen', 'Back', 'Pelvis', 'Limbs', 'MultipleSites', 'Other');

-- CreateEnum
CREATE TYPE "PainDescription" AS ENUM ('Sharp', 'Dull', 'Burning', 'Throbbing', 'Cramping', 'Shooting', 'PressureLike');

-- CreateEnum
CREATE TYPE "PainType" AS ENUM ('NociceptiveSomatic', 'Visceral', 'Neuropathic', 'Mixed', 'BreakthroughPain');

-- CreateEnum
CREATE TYPE "PainPattern" AS ENUM ('Continuous', 'Intermittent', 'BreakthroughEpisodes', 'WorseAtNight', 'MovementRelated');

-- CreateEnum
CREATE TYPE "PainAggravatingFactor" AS ENUM ('Movement', 'Coughing', 'Eating', 'Stress', 'Positioning', 'Unknown');

-- CreateEnum
CREATE TYPE "PainRelievingFactor" AS ENUM ('Rest', 'Medication', 'PositionChange', 'HeatColdTherapy', 'Massage', 'Other');

-- CreateEnum
CREATE TYPE "PainOpioidUse" AS ENUM ('None', 'WeakOpioid', 'StrongOpioid');

-- CreateEnum
CREATE TYPE "PainAdjuvantDrug" AS ENUM ('Antidepressants', 'Anticonvulsants', 'Steroids', 'MuscleRelaxants');

-- CreateEnum
CREATE TYPE "PainBreakthroughFrequency" AS ENUM ('None', 'OneToTwoPerDay', 'ThreeToFivePerDay', 'Frequent');

-- CreateEnum
CREATE TYPE "PainRescueEffectiveness" AS ENUM ('Good', 'Partial', 'Poor');

-- CreateEnum
CREATE TYPE "PainImpactArea" AS ENUM ('Mobility', 'Sleep', 'Appetite', 'Mood', 'DailyActivities');

-- CreateEnum
CREATE TYPE "PainImpactSeverity" AS ENUM ('NoImpact', 'Mild', 'Moderate', 'Severe');

-- CreateEnum
CREATE TYPE "PainAssociatedSymptom" AS ENUM ('Nausea', 'Vomiting', 'Constipation', 'Fatigue', 'Anxiety', 'Depression', 'Dyspnea');

-- CreateEnum
CREATE TYPE "PainPatientBehavior" AS ENUM ('Comfortable', 'Grimacing', 'GuardingArea', 'Restless', 'Crying');

-- CreateEnum
CREATE TYPE "PainManagementBarrier" AS ENUM ('FearOfAddiction', 'MedicationSideEffects', 'PoorAdherence', 'FinancialConstraints', 'PoorAccessToOpioids', 'CulturalBeliefs', 'Other');

-- CreateEnum
CREATE TYPE "PainDiagnosis" AS ENUM ('ControlledPain', 'PartiallyControlledPain', 'UncontrolledPain', 'ComplexPainSyndrome', 'BreakthroughPainSyndrome');

-- CreateEnum
CREATE TYPE "PainIntervention" AS ENUM ('OptimizeOpioidTherapy', 'AddAdjuvantAnalgesics', 'AdjustDosingSchedule', 'BreakthroughPainProtocol', 'NonPharmacologicalTherapy', 'PhysiotherapyReferral', 'PsychologicalSupport');

-- CreateEnum
CREATE TYPE "PainNonPharmacologicalMethod" AS ENUM ('Positioning', 'RelaxationTechniques', 'Massage', 'HeatColdTherapy', 'SpiritualSupport');

-- CreateEnum
CREATE TYPE "PainMonitoringPlan" AS ENUM ('Daily', 'EveryShift', 'Weekly');

-- CreateEnum
CREATE TYPE "PainAssessmentOutcome" AS ENUM ('PainWellControlled', 'RequiresAdjustment', 'RequiresUrgentIntervention', 'ComplexPainManagementRequired', 'MultidisciplinaryReviewNeeded');

-- CreateEnum
CREATE TYPE "PainFinalRecommendation" AS ENUM ('ContinueCurrentRegimen', 'IncreaseOpioidDose', 'AddAdjuvantTherapy', 'ManageBreakthroughPain', 'IntegratePsychosocialSupport', 'FullHospicePainProtocolActivation');

-- CreateEnum
CREATE TYPE "SocialAssessmentType" AS ENUM ('Admission', 'FollowUp', 'Reassessment');

-- CreateEnum
CREATE TYPE "SocialLivingArrangement" AS ENUM ('LivesAlone', 'LivesWithSpouse', 'LivesWithChildren', 'ExtendedFamily', 'CareInstitution', 'Other');

-- CreateEnum
CREATE TYPE "SocialCaregiverAvailability" AS ENUM ('FullTime', 'PartTime', 'Occasional', 'NotAvailable');

-- CreateEnum
CREATE TYPE "SocialCaregiverHealth" AS ENUM ('Good', 'Fair', 'Poor');

-- CreateEnum
CREATE TYPE "SocialCaregiverUnderstanding" AS ENUM ('Good', 'Moderate', 'Limited', 'None');

-- CreateEnum
CREATE TYPE "SocialCaregiverStress" AS ENUM ('Low', 'Moderate', 'High', 'Severe');

-- CreateEnum
CREATE TYPE "SocialFamilySupport" AS ENUM ('Strong', 'Moderate', 'Limited', 'None');

-- CreateEnum
CREATE TYPE "SocialCommunitySupport" AS ENUM ('ReligiousOrganization', 'Neighbors', 'CommunityVolunteers', 'LocalNgos', 'NoSupportAvailable');

-- CreateEnum
CREATE TYPE "SocialContactFrequency" AS ENUM ('Daily', 'Weekly', 'Monthly', 'Rarely');

-- CreateEnum
CREATE TYPE "SocialIsolationRisk" AS ENUM ('Low', 'Moderate', 'High');

-- CreateEnum
CREATE TYPE "SocialIncomeSource" AS ENUM ('Employment', 'Pension', 'FamilySupport', 'SocialAssistance', 'Savings', 'None', 'Other');

-- CreateEnum
CREATE TYPE "SocialMonthlyIncome" AS ENUM ('Below2000ETB', 'Between2000And5000ETB', 'Between5001And10000ETB', 'Above10000ETB');

-- CreateEnum
CREATE TYPE "SocialFinancialChallenge" AS ENUM ('MedicationCosts', 'TransportationCosts', 'FoodExpenses', 'HousingCosts', 'CaregiverIncomeLoss', 'Other');

-- CreateEnum
CREATE TYPE "SocialFinancialRisk" AS ENUM ('Low', 'Moderate', 'High');

-- CreateEnum
CREATE TYPE "SocialResidenceType" AS ENUM ('OwnedHouse', 'RentalHouse', 'GovernmentHousing', 'TemporaryShelter', 'Other');

-- CreateEnum
CREATE TYPE "SocialHomeEnvironment" AS ENUM ('Safe', 'RequiresModification', 'Unsafe');

-- CreateEnum
CREATE TYPE "SocialUtilityService" AS ENUM ('Electricity', 'WaterSupply', 'ToiletFacility', 'TelephoneAccess');

-- CreateEnum
CREATE TYPE "SocialHomeBasedCareSuitability" AS ENUM ('Suitable', 'PartiallySuitable', 'NotSuitable');

-- CreateEnum
CREATE TYPE "SocialTransportAccess" AS ENUM ('PrivateVehicle', 'PublicTransport', 'AmbulanceAccess', 'NoReliableTransport');

-- CreateEnum
CREATE TYPE "SocialTransportChallenge" AS ENUM ('None', 'Financial', 'PhysicalAccess', 'Availability', 'Other');

-- CreateEnum
CREATE TYPE "SocialEmploymentStatus" AS ENUM ('Employed', 'Unemployed', 'Retired', 'UnableToWork');

-- CreateEnum
CREATE TYPE "SocialEducationLevel" AS ENUM ('NoFormalEducation', 'PrimarySchool', 'SecondarySchool', 'Diploma', 'Degree', 'Postgraduate');

-- CreateEnum
CREATE TYPE "SocialReligiousAffiliation" AS ENUM ('Orthodox', 'Muslim', 'Protestant', 'Catholic', 'Other');

-- CreateEnum
CREATE TYPE "SocialLegalConcern" AS ENUM ('PropertyIssues', 'GuardianshipIssues', 'InheritanceIssues', 'None', 'Other');

-- CreateEnum
CREATE TYPE "SocialFamilyPreparedness" AS ENUM ('Yes', 'No', 'Partially');

-- CreateEnum
CREATE TYPE "SocialAnticipatoryGrief" AS ENUM ('None', 'Mild', 'Moderate', 'Severe');

-- CreateEnum
CREATE TYPE "SocialBereavementRisk" AS ENUM ('Low', 'Moderate', 'High');

-- CreateEnum
CREATE TYPE "SocialMajorIssue" AS ENUM ('FinancialHardship', 'CaregiverBurden', 'SocialIsolation', 'HousingProblems', 'TransportationBarriers', 'FoodInsecurity', 'FamilyConflict', 'LackOfSocialSupport', 'Other');

-- CreateEnum
CREATE TYPE "SocialCarePlanIntervention" AS ENUM ('FamilyCounseling', 'FinancialAssistanceReferral', 'CommunityResourceMobilization', 'CaregiverSupport', 'HomeCareAssessment', 'SpiritualCareReferral', 'BereavementSupport', 'LegalSupportReferral', 'Other');

-- CreateEnum
CREATE TYPE "SocialAssessmentOutcome" AS ENUM ('SuitableForInpatientHospiceCare', 'SuitableForHomeBasedHospiceCare', 'RequiresAdditionalSocialSupport', 'RequiresCommunityResourceMobilization', 'HighRiskSocialSituation', 'FollowUpAssessmentRequired');

-- CreateEnum
CREATE TYPE "SpiritualAssessmentType" AS ENUM ('Admission', 'FollowUp', 'Reassessment');

-- CreateEnum
CREATE TYPE "SpiritualReligiousAffiliation" AS ENUM ('EthiopianOrthodoxChristian', 'Muslim', 'Protestant', 'Catholic', 'TraditionalBelief', 'Other', 'NoReligiousAffiliation');

-- CreateEnum
CREATE TYPE "SpiritualFaithImportance" AS ENUM ('VeryImportant', 'Important', 'SomewhatImportant', 'NotImportant');

-- CreateEnum
CREATE TYPE "SpiritualActivityParticipation" AS ENUM ('Regularly', 'Occasionally', 'Rarely', 'Never');

-- CreateEnum
CREATE TYPE "SpiritualSupportSource" AS ENUM ('FamilyMembers', 'ReligiousLeaderClergy', 'Friends', 'FaithCommunity', 'HospiceChaplain', 'CommunityMembers', 'NoSpiritualSupport');

-- CreateEnum
CREATE TYPE "SpiritualDistressConcernType" AS ENUM ('MeaningOfIllness', 'FearOfDeath', 'FearOfSuffering', 'UnfinishedBusiness', 'Forgiveness', 'RelationshipConflicts', 'LossOfHope', 'AngerTowardGodHigherPower', 'SpiritualIsolation');

-- CreateEnum
CREATE TYPE "SpiritualDistressLevel" AS ENUM ('None', 'Mild', 'Moderate', 'Severe');

-- CreateEnum
CREATE TYPE "SpiritualCopingMethod" AS ENUM ('Prayer', 'ReligiousReadings', 'FamilySupport', 'Counseling', 'Meditation', 'Music', 'Other');

-- CreateEnum
CREATE TYPE "SpiritualPeaceStatus" AS ENUM ('Yes', 'Partially', 'No');

-- CreateEnum
CREATE TYPE "SpiritualFamilySharesBeliefs" AS ENUM ('Yes', 'No', 'Partially');

-- CreateEnum
CREATE TYPE "SpiritualEndOfLifeCare" AS ENUM ('Prayer', 'ReligiousReadings', 'SacramentsHolyCommunion', 'ClergyVisit', 'FamilyPresence', 'ReligiousMusic', 'Other');

-- CreateEnum
CREATE TYPE "SpiritualPreferredPlaceOfCare" AS ENUM ('Home', 'HospiceFacility', 'Hospital', 'Other');

-- CreateEnum
CREATE TYPE "SpiritualPreferredPlaceOfDeath" AS ENUM ('Home', 'HospiceFacility', 'Hospital', 'NoPreference');

-- CreateEnum
CREATE TYPE "SpiritualPatientStrength" AS ENUM ('StrongFaith', 'PositiveOutlook', 'FamilySupport', 'CommunitySupport', 'ReligiousInvolvement', 'AcceptanceOfIllness', 'Other');

-- CreateEnum
CREATE TYPE "SpiritualIdentifiedNeed" AS ENUM ('PrayerSupport', 'ReligiousCounseling', 'ClergyVisits', 'FamilySpiritualSupport', 'EndOfLifePlanning', 'GriefCounseling', 'ReconciliationSupport', 'Other');

-- CreateEnum
CREATE TYPE "SpiritualFollowUpSchedule" AS ENUM ('Daily', 'Weekly', 'Monthly', 'AsNeeded');

-- CreateEnum
CREATE TYPE "SpiritualRecommendedService" AS ENUM ('ChaplainServices', 'ReligiousLeaderReferral', 'FamilyCounseling', 'BereavementSupport', 'AdvanceCarePlanning', 'OngoingSpiritualCare');

-- CreateEnum
CREATE TYPE "SpiritualAssessmentOutcome" AS ENUM ('NoSpiritualConcernsIdentified', 'RoutineSpiritualFollowUp', 'ModerateSpiritualSupportRequired', 'IntensiveSpiritualCareRequired', 'FamilySpiritualSupportRequired', 'BereavementFollowUpRecommended');

-- CreateEnum
CREATE TYPE "PsychiatryAssessmentType" AS ENUM ('Admission', 'FollowUp', 'EmergencyReview');

-- CreateEnum
CREATE TYPE "PsychiatrySymptom" AS ENUM ('Anxiety', 'Depression', 'Insomnia', 'Delirium', 'Hallucinations', 'Agitation', 'SuicidalIdeation', 'CognitiveDecline', 'AdjustmentDisorder', 'Other');

-- CreateEnum
CREATE TYPE "PsychiatrySeverity" AS ENUM ('Mild', 'Moderate', 'Severe', 'Fluctuating');

-- CreateEnum
CREATE TYPE "PsychiatryAppearanceBehavior" AS ENUM ('Calm', 'Restless', 'Agitated', 'Withdrawn', 'PoorSelfCare');

-- CreateEnum
CREATE TYPE "PsychiatrySpeech" AS ENUM ('Normal', 'Slow', 'Pressured', 'Minimal');

-- CreateEnum
CREATE TYPE "PsychiatryMood" AS ENUM ('Euthymic', 'Depressed', 'Anxious', 'Irritable');

-- CreateEnum
CREATE TYPE "PsychiatryAffect" AS ENUM ('Appropriate', 'Blunted', 'Flat', 'Labile');

-- CreateEnum
CREATE TYPE "PsychiatryThoughtProcess" AS ENUM ('Logical', 'Circumstantial', 'Disorganized', 'Tangential');

-- CreateEnum
CREATE TYPE "PsychiatryThoughtContent" AS ENUM ('NoDelusions', 'Hopelessness', 'Guilt', 'SuicidalThoughts', 'Paranoia', 'SomaticPreoccupation');

-- CreateEnum
CREATE TYPE "PsychiatryPerception" AS ENUM ('NoHallucinations', 'AuditoryHallucinations', 'VisualHallucinations');

-- CreateEnum
CREATE TYPE "PsychiatryCognition" AS ENUM ('OrientedX3', 'Disoriented', 'MemoryImpairment', 'AttentionDeficits');

-- CreateEnum
CREATE TYPE "PsychiatryInsightJudgment" AS ENUM ('Good', 'Partial', 'Poor');

-- CreateEnum
CREATE TYPE "PsychiatrySuicidalIdeation" AS ENUM ('None', 'PassiveThoughts', 'ActiveThoughts', 'PlanPresent');

-- CreateEnum
CREATE TYPE "PsychiatrySuicideRiskLevel" AS ENUM ('Low', 'Moderate', 'High');

-- CreateEnum
CREATE TYPE "PsychiatryProtectiveFactor" AS ENUM ('FamilySupport', 'ReligiousBeliefs', 'FearOfDeath', 'ResponsibilityForFamily', 'SocialSupport');

-- CreateEnum
CREATE TYPE "PsychiatryOrganicCause" AS ENUM ('Pain', 'Hypoxia', 'Infection', 'MedicationSideEffects', 'MetabolicImbalance', 'Delirium', 'CancerProgression');

-- CreateEnum
CREATE TYPE "PsychiatrySleepPattern" AS ENUM ('Normal', 'Insomnia', 'FragmentedSleep', 'ExcessiveSleepiness');

-- CreateEnum
CREATE TYPE "PsychiatryAppetite" AS ENUM ('Normal', 'Reduced', 'Poor');

-- CreateEnum
CREATE TYPE "PsychiatryDailyFunctioning" AS ENUM ('Independent', 'RequiresAssistance', 'Dependent');

-- CreateEnum
CREATE TYPE "PsychiatrySocialWithdrawal" AS ENUM ('None', 'Mild', 'Severe');

-- CreateEnum
CREATE TYPE "PsychiatryDiagnosis" AS ENUM ('MajorDepressiveDisorder', 'AnxietyDisorder', 'AdjustmentDisorder', 'Delirium', 'DepressionDueToMedicalCondition', 'MixedAnxietyDepression', 'Other');

-- CreateEnum
CREATE TYPE "PsychiatryImmediateIntervention" AS ENUM ('CrisisManagement', 'SuicidePrecautions', 'EnvironmentalSafety', 'SupportiveCounseling', 'FamilyCounseling');

-- CreateEnum
CREATE TYPE "PsychiatryPharmacologicalPlan" AS ENUM ('Antidepressants', 'Anxiolytics', 'Antipsychotics', 'SleepMedications', 'DoseAdjustmentReview');

-- CreateEnum
CREATE TYPE "PsychiatryNonPharmacologicalPlan" AS ENUM ('Psychotherapy', 'RelaxationTechniques', 'SpiritualSupport', 'MusicTherapy', 'BehavioralActivation');

-- CreateEnum
CREATE TYPE "PsychiatryMonitoringPlan" AS ENUM ('Daily', 'Weekly', 'AsNeeded');

-- CreateEnum
CREATE TYPE "PsychiatryFamilyDistressLevel" AS ENUM ('Low', 'Moderate', 'High');

-- CreateEnum
CREATE TYPE "PsychiatryAssessmentOutcome" AS ENUM ('NoPsychiatricInterventionRequired', 'RequiresSupportiveCounseling', 'RequiresPharmacologicalTreatment', 'RequiresCloseMonitoring', 'HighRiskSafetyPrecautionsRequired');

-- CreateEnum
CREATE TYPE "PsychiatryFinalRecommendation" AS ENUM ('ContinueHospicePsychologicalSupport', 'InitiatePsychiatricMedication', 'CrisisInterventionRequired', 'FamilyCounselingRequired', 'OngoingPsychiatricFollowUp');

-- CreateTable
CREATE TABLE "ClinicalPharmacistAssessment" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "assessmentType" "PharmacistAssessmentType" NOT NULL,
    "weightKg" DOUBLE PRECISION,
    "allergies" TEXT,
    "wardUnit" TEXT,
    "otcHerbalUsed" BOOLEAN NOT NULL DEFAULT false,
    "otcHerbalDetails" TEXT,
    "medicationHistoryAdherence" "PharmacistWeightStatus",
    "hasAdrHistory" BOOLEAN NOT NULL DEFAULT false,
    "adrHistoryDetails" TEXT,
    "analgesicNonOpioids" BOOLEAN NOT NULL DEFAULT false,
    "analgesicWeakOpioids" BOOLEAN NOT NULL DEFAULT false,
    "analgesicStrongOpioids" BOOLEAN NOT NULL DEFAULT false,
    "analgesicAdjuvants" BOOLEAN NOT NULL DEFAULT false,
    "analgesicOtherDetails" TEXT,
    "painControl" "PharmacistPainControl",
    "breakthroughPain" "PharmacistBreakthroughPain",
    "opioidSideEffects" "PharmacistOpioidSideEffect"[] DEFAULT ARRAY[]::"PharmacistOpioidSideEffect"[],
    "drugDrugInteractions" "PharmacistInteractionRisk",
    "drugDrugInteractionDetails" TEXT,
    "drugDiseaseInteractions" BOOLEAN NOT NULL DEFAULT false,
    "drugDiseaseInteractionDetails" TEXT,
    "highRiskMedications" "PharmacistHighRiskMedication"[] DEFAULT ARRAY[]::"PharmacistHighRiskMedication"[],
    "renalFunction" "PharmacistOrganFunction",
    "creatinine" TEXT,
    "hepaticFunction" "PharmacistOrganFunction",
    "lfts" TEXT,
    "symptomMedicationEffectiveness" JSONB NOT NULL DEFAULT '{}',
    "suspectedAdr" BOOLEAN NOT NULL DEFAULT false,
    "suspectedAdrDrug" TEXT,
    "suspectedAdrReaction" TEXT,
    "adrSeverity" "PharmacistAdrSeverity",
    "adrManagement" "PharmacistAdrAction"[] DEFAULT ARRAY[]::"PharmacistAdrAction"[],
    "bowelFunction" "PharmacistBowelFunction",
    "laxativeUse" BOOLEAN NOT NULL DEFAULT false,
    "laxativeDetails" TEXT,
    "doseAdjustmentRequired" BOOLEAN NOT NULL DEFAULT false,
    "doseAdjustmentReasons" "PharmacistDoseAdjustmentReason"[] DEFAULT ARRAY[]::"PharmacistDoseAdjustmentReason"[],
    "patientUnderstanding" "PharmacistPatientUnderstanding",
    "counselingTopics" "PharmacistCounselingTopic"[] DEFAULT ARRAY[]::"PharmacistCounselingTopic"[],
    "currentIssuesIdentified" TEXT,
    "medicationPlanActions" "PharmacistMedicationPlanAction"[] DEFAULT ARRAY[]::"PharmacistMedicationPlanAction"[],
    "medicationPlanOther" TEXT,
    "medicationAvailability" "PharmacistMedicationAvailability",
    "financialBarriers" BOOLEAN NOT NULL DEFAULT false,
    "pharmacyIntervention" BOOLEAN NOT NULL DEFAULT false,
    "pharmacistSummary" TEXT,
    "summaryFlags" "PharmacistSummaryFlag"[] DEFAULT ARRAY[]::"PharmacistSummaryFlag"[],
    "finalRecommendations" "PharmacistFinalRecommendation"[] DEFAULT ARRAY[]::"PharmacistFinalRecommendation"[],
    "clinicalPharmacistName" TEXT,
    "createdBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" INTEGER,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" INTEGER,
    "deletionReason" TEXT,

    CONSTRAINT "ClinicalPharmacistAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClinicalPharmacistCurrentMedication" (
    "id" SERIAL NOT NULL,
    "clinicalPharmacistAssessmentId" INTEGER NOT NULL,
    "name" TEXT,
    "dose" TEXT,
    "route" TEXT,
    "frequency" TEXT,
    "indication" TEXT,

    CONSTRAINT "ClinicalPharmacistCurrentMedication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhysiotherapyAssessment" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "assessmentType" "PhysiotherapyAssessmentType" NOT NULL,
    "comorbidities" "PhysiotherapyComorbidity"[] DEFAULT ARRAY[]::"PhysiotherapyComorbidity"[],
    "comorbidityOther" TEXT,
    "generalCondition" "PhysiotherapyGeneralCondition",
    "painLevel" INTEGER,
    "painTypes" "PhysiotherapyPainType"[] DEFAULT ARRAY[]::"PhysiotherapyPainType"[],
    "painTypeOther" TEXT,
    "symptoms" "PhysiotherapySymptom"[] DEFAULT ARRAY[]::"PhysiotherapySymptom"[],
    "mobilityStatus" "PhysiotherapyMobilityStatus",
    "transferAbility" "PhysiotherapyTransferAbility",
    "walkingAbility" "PhysiotherapyWalkingAbility",
    "assistiveDevices" "PhysiotherapyAssistiveDevice"[] DEFAULT ARRAY[]::"PhysiotherapyAssistiveDevice"[],
    "assistiveDeviceOther" TEXT,
    "upperLimbStrength" INTEGER,
    "lowerLimbStrength" INTEGER,
    "rangeOfMotion" "PhysiotherapyRangeOfMotion",
    "jointPainOrStiffness" "PhysiotherapyJointFinding",
    "jointPainLocation" TEXT,
    "consciousness" "PhysiotherapyConsciousness",
    "coordination" "PhysiotherapyCoordination",
    "sensoryDeficit" "PhysiotherapySensoryDeficit",
    "balance" "PhysiotherapyBalance",
    "breathingPattern" "PhysiotherapyBreathingPattern",
    "breathlessnessLevel" "PhysiotherapyBreathlessnessLevel",
    "chestExpansion" "PhysiotherapyChestExpansion",
    "respiratoryNeeds" "PhysiotherapyRespiratoryNeed"[] DEFAULT ARRAY[]::"PhysiotherapyRespiratoryNeed"[],
    "pressureRisk" "PhysiotherapyPressureRisk",
    "pressureAreas" "PhysiotherapyPressureArea"[] DEFAULT ARRAY[]::"PhysiotherapyPressureArea"[],
    "pressureAreaOther" TEXT,
    "pressurePreventions" "PhysiotherapyPressurePrevention"[] DEFAULT ARRAY[]::"PhysiotherapyPressurePrevention"[],
    "fallHistory" BOOLEAN,
    "fallRiskLevel" "PhysiotherapyFallRiskLevel",
    "fallContributors" "PhysiotherapyFallContributor"[] DEFAULT ARRAY[]::"PhysiotherapyFallContributor"[],
    "diagnosis" "PhysiotherapyDiagnosis"[] DEFAULT ARRAY[]::"PhysiotherapyDiagnosis"[],
    "goals" TEXT,
    "interventions" "PhysiotherapyIntervention"[] DEFAULT ARRAY[]::"PhysiotherapyIntervention"[],
    "frequency" "PhysiotherapyFrequency"[] DEFAULT ARRAY[]::"PhysiotherapyFrequency"[],
    "equipment" "PhysiotherapyEquipment"[] DEFAULT ARRAY[]::"PhysiotherapyEquipment"[],
    "caregiverTrainings" "PhysiotherapyCaregiverTraining"[] DEFAULT ARRAY[]::"PhysiotherapyCaregiverTraining"[],
    "outcome" "PhysiotherapyOutcome"[] DEFAULT ARRAY[]::"PhysiotherapyOutcome"[],
    "finalRecommendations" "PhysiotherapyFinalRecommendation"[] DEFAULT ARRAY[]::"PhysiotherapyFinalRecommendation"[],
    "createdBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" INTEGER,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" INTEGER,
    "deletionReason" TEXT,

    CONSTRAINT "PhysiotherapyAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhysiotherapyAdl" (
    "id" SERIAL NOT NULL,
    "physiotherapyAssessmentId" INTEGER NOT NULL,
    "activity" "PhysiotherapyAdlActivity" NOT NULL,
    "level" "PhysiotherapyAdlLevel",

    CONSTRAINT "PhysiotherapyAdl_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FamilyAssessment" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "assessmentType" "FamilyAssessmentType" NOT NULL,
    "householdSize" INTEGER,
    "primaryDecisionMaker" "FamilyDecisionMaker",
    "primaryDecisionMakerName" TEXT,
    "primaryCaregiverName" TEXT,
    "primaryCaregiverRelationship" TEXT,
    "primaryCaregiverAge" INTEGER,
    "primaryCaregiverPhone" TEXT,
    "secondaryCaregiverName" TEXT,
    "secondaryCaregiverRelationship" TEXT,
    "secondaryCaregiverPhone" TEXT,
    "caregiverAvailability" "FamilyCaregiverAvailability",
    "physicalAbility" "FamilyPhysicalAbility",
    "emotionalReadiness" "FamilyEmotionalReadiness",
    "knowledgeOfIllness" "FamilyKnowledgeLevel",
    "internalSupport" "FamilyInternalSupport",
    "externalSupport" "FamilyExternalSupport"[] DEFAULT ARRAY[]::"FamilyExternalSupport"[],
    "socialIsolationRisk" "FamilySocialIsolationRisk",
    "incomeSources" "FamilyIncomeSource"[] DEFAULT ARRAY[]::"FamilyIncomeSource"[],
    "monthlyIncomeLevel" "FamilyIncomeLevel",
    "financialBurden" "FamilyFinancialBurden",
    "financialChallenges" "FamilyFinancialChallenge"[] DEFAULT ARRAY[]::"FamilyFinancialChallenge"[],
    "housingType" "FamilyHousingType",
    "housingTypeOther" TEXT,
    "homeEnvironment" "FamilyHomeEnvironment",
    "utilitiesAccess" JSONB NOT NULL DEFAULT '{}',
    "copingAbility" "FamilyCopingAbility",
    "familyEmotionalStatus" "FamilyEmotionalStatus",
    "anticipatoryGrief" "FamilyAnticipatoryGrief",
    "religiousAffiliation" "FamilyReligiousAffiliation",
    "religiousAffiliationOther" TEXT,
    "culturalBeliefsAffectingCare" TEXT,
    "palliativeCareAcceptance" "FamilyPalliativeAcceptance",
    "burdenLevel" "FamilyBurdenLevel",
    "burdenFactors" "FamilyBurdenFactor"[] DEFAULT ARRAY[]::"FamilyBurdenFactor"[],
    "needs" "FamilyNeed"[] DEFAULT ARRAY[]::"FamilyNeed"[],
    "strengths" "FamilyStrength"[] DEFAULT ARRAY[]::"FamilyStrength"[],
    "plannedInterventions" TEXT,
    "supportServices" "FamilySupportService"[] DEFAULT ARRAY[]::"FamilySupportService"[],
    "followUpPlan" "FamilyFollowUpPlan",
    "assessmentOutcome" "FamilyAssessmentOutcome"[] DEFAULT ARRAY[]::"FamilyAssessmentOutcome"[],
    "finalRecommendations" "FamilyFinalRecommendation"[] DEFAULT ARRAY[]::"FamilyFinalRecommendation"[],
    "assessorName" TEXT,
    "createdBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" INTEGER,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" INTEGER,
    "deletionReason" TEXT,

    CONSTRAINT "FamilyAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FamilyHouseholdMember" (
    "id" SERIAL NOT NULL,
    "familyAssessmentId" INTEGER NOT NULL,
    "name" TEXT,
    "age" INTEGER,
    "relationship" TEXT,
    "occupation" TEXT,
    "contact" TEXT,

    CONSTRAINT "FamilyHouseholdMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NutritionalAssessment" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "assessmentType" "NutritionAssessmentType" NOT NULL,
    "weightKg" DOUBLE PRECISION,
    "heightCm" DOUBLE PRECISION,
    "bmi" DOUBLE PRECISION,
    "muacCm" DOUBLE PRECISION,
    "recentWeightLossKg" DOUBLE PRECISION,
    "weightLossPeriod" TEXT,
    "nutritionalStatusClassification" "NutritionStatusClassification",
    "weightSixMonthsAgoKg" DOUBLE PRECISION,
    "weightThreeMonthsAgoKg" DOUBLE PRECISION,
    "currentWeightKg" DOUBLE PRECISION,
    "percentageWeightLoss" DOUBLE PRECISION,
    "significantWeightLoss" "NutritionSignificantWeightLoss",
    "currentAppetite" "NutritionAppetite",
    "appetiteTrend" "NutritionAppetiteTrend",
    "appetiteCauses" "NutritionAppetiteCause"[] DEFAULT ARRAY[]::"NutritionAppetiteCause"[],
    "appetiteCauseOther" TEXT,
    "mealsPerDay" "NutritionMealsPerDay",
    "oralIntake" "NutritionOralIntake",
    "fluidIntake" "NutritionFluidIntake",
    "specialDiet" "NutritionSpecialDiet",
    "specialDietSpecify" TEXT,
    "feedingMethod" "NutritionFeedingMethod",
    "feedingMethodOther" TEXT,
    "feedingAssistanceRequired" "NutritionFeedingAssistance",
    "difficultySwallowing" BOOLEAN,
    "difficultySwallowingDetails" TEXT,
    "nauseaSeverity" "NutritionSymptomSeverity",
    "vomitingSeverity" "NutritionSymptomSeverity",
    "constipationSeverity" "NutritionSymptomSeverity",
    "diarrheaSeverity" "NutritionSymptomSeverity",
    "abdominalPainSeverity" "NutritionSymptomSeverity",
    "bloatingSeverity" "NutritionSymptomSeverity",
    "mouthSoresSeverity" "NutritionSymptomSeverity",
    "energyLevel" "NutritionEnergyLevel",
    "mealPreparation" "NutritionMealPreparation",
    "feedingAbility" "NutritionFeedingAbility",
    "riskFactors" "NutritionRiskFactor"[] DEFAULT ARRAY[]::"NutritionRiskFactor"[],
    "overallNutritionalRisk" "NutritionOverallRisk",
    "adequateFoodAccess" BOOLEAN,
    "financialBarriersToNutrition" BOOLEAN,
    "requiresNutritionalAssistance" BOOLEAN,
    "diagnoses" "NutritionDiagnosis"[] DEFAULT ARRAY[]::"NutritionDiagnosis"[],
    "diagnosisOther" TEXT,
    "nutritionalGoals" TEXT,
    "interventions" "NutritionIntervention"[] DEFAULT ARRAY[]::"NutritionIntervention"[],
    "interventionOther" TEXT,
    "monitoringPlans" "NutritionMonitoringPlan"[] DEFAULT ARRAY[]::"NutritionMonitoringPlan"[],
    "monitoringOther" TEXT,
    "assessmentOutcome" "NutritionAssessmentOutcome"[] DEFAULT ARRAY[]::"NutritionAssessmentOutcome"[],
    "finalRecommendations" "NutritionFinalRecommendation"[] DEFAULT ARRAY[]::"NutritionFinalRecommendation"[],
    "createdBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" INTEGER,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" INTEGER,
    "deletionReason" TEXT,

    CONSTRAINT "NutritionalAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NutritionalDietaryRecall" (
    "id" SERIAL NOT NULL,
    "nutritionalAssessmentId" INTEGER NOT NULL,
    "mealType" TEXT NOT NULL,
    "contents" TEXT,

    CONSTRAINT "NutritionalDietaryRecall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NutritionalLabResult" (
    "id" SERIAL NOT NULL,
    "nutritionalAssessmentId" INTEGER NOT NULL,
    "test" "NutritionLabTest" NOT NULL,
    "testOther" TEXT,
    "result" TEXT,

    CONSTRAINT "NutritionalLabResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PainAssessment" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "assessmentType" "PainAssessmentType" NOT NULL,
    "primaryPainComplaint" TEXT,
    "painOnset" "PainOnset",
    "painDuration" TEXT,
    "painLocations" "PainLocation"[] DEFAULT ARRAY[]::"PainLocation"[],
    "painLocationOther" TEXT,
    "painDescriptions" "PainDescription"[] DEFAULT ARRAY[]::"PainDescription"[],
    "currentPainScore" INTEGER,
    "worstPainLast24h" INTEGER,
    "leastPainLast24h" INTEGER,
    "painType" "PainType"[] DEFAULT ARRAY[]::"PainType"[],
    "painPattern" "PainPattern"[] DEFAULT ARRAY[]::"PainPattern"[],
    "aggravatingFactors" "PainAggravatingFactor"[] DEFAULT ARRAY[]::"PainAggravatingFactor"[],
    "relievingFactors" "PainRelievingFactor"[] DEFAULT ARRAY[]::"PainRelievingFactor"[],
    "relievingOther" TEXT,
    "opioidUse" "PainOpioidUse",
    "adjuvantDrugs" "PainAdjuvantDrug"[] DEFAULT ARRAY[]::"PainAdjuvantDrug"[],
    "breakthroughFrequency" "PainBreakthroughFrequency",
    "rescueMedicationUsed" BOOLEAN,
    "rescueEffectiveness" "PainRescueEffectiveness",
    "associatedSymptoms" "PainAssociatedSymptom"[] DEFAULT ARRAY[]::"PainAssociatedSymptom"[],
    "patientBehaviors" "PainPatientBehavior"[] DEFAULT ARRAY[]::"PainPatientBehavior"[],
    "managementBarriers" "PainManagementBarrier"[] DEFAULT ARRAY[]::"PainManagementBarrier"[],
    "managementBarrierOther" TEXT,
    "diagnosis" "PainDiagnosis"[] DEFAULT ARRAY[]::"PainDiagnosis"[],
    "managementGoals" TEXT,
    "interventions" "PainIntervention"[] DEFAULT ARRAY[]::"PainIntervention"[],
    "nonPharmacologicalMethods" "PainNonPharmacologicalMethod"[] DEFAULT ARRAY[]::"PainNonPharmacologicalMethod"[],
    "monitoringPlan" "PainMonitoringPlan"[] DEFAULT ARRAY[]::"PainMonitoringPlan"[],
    "assessmentOutcome" "PainAssessmentOutcome"[] DEFAULT ARRAY[]::"PainAssessmentOutcome"[],
    "finalRecommendations" "PainFinalRecommendation"[] DEFAULT ARRAY[]::"PainFinalRecommendation"[],
    "createdBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" INTEGER,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" INTEGER,
    "deletionReason" TEXT,

    CONSTRAINT "PainAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PainImpact" (
    "id" SERIAL NOT NULL,
    "painAssessmentId" INTEGER NOT NULL,
    "area" "PainImpactArea" NOT NULL,
    "severity" "PainImpactSeverity",

    CONSTRAINT "PainImpact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialAssessment" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "assessmentType" "SocialAssessmentType" NOT NULL,
    "householdSize" INTEGER,
    "livingArrangement" "SocialLivingArrangement",
    "livingArrangementOther" TEXT,
    "caregiverAvailability" "SocialCaregiverAvailability",
    "caregiverHealth" "SocialCaregiverHealth",
    "caregiverUnderstanding" "SocialCaregiverUnderstanding",
    "caregiverStress" "SocialCaregiverStress",
    "familySupport" "SocialFamilySupport",
    "communitySupport" "SocialCommunitySupport"[] DEFAULT ARRAY[]::"SocialCommunitySupport"[],
    "contactFrequency" "SocialContactFrequency",
    "isolationRisk" "SocialIsolationRisk",
    "incomeSources" "SocialIncomeSource"[] DEFAULT ARRAY[]::"SocialIncomeSource"[],
    "incomeSourceOther" TEXT,
    "monthlyHouseholdIncome" "SocialMonthlyIncome",
    "financialChallenges" "SocialFinancialChallenge"[] DEFAULT ARRAY[]::"SocialFinancialChallenge"[],
    "financialChallengeOther" TEXT,
    "financialRiskLevel" "SocialFinancialRisk",
    "residenceType" "SocialResidenceType",
    "residenceTypeOther" TEXT,
    "homeEnvironment" "SocialHomeEnvironment",
    "utilitiesAccess" JSONB NOT NULL DEFAULT '{}',
    "homeBasedCareSuitability" "SocialHomeBasedCareSuitability",
    "transportAccess" "SocialTransportAccess"[] DEFAULT ARRAY[]::"SocialTransportAccess"[],
    "distanceToHealthFacilityKm" DOUBLE PRECISION,
    "transportChallenges" "SocialTransportChallenge"[] DEFAULT ARRAY[]::"SocialTransportChallenge"[],
    "transportChallengeOther" TEXT,
    "employmentStatus" "SocialEmploymentStatus",
    "educationLevel" "SocialEducationLevel",
    "religiousAffiliation" "SocialReligiousAffiliation",
    "religiousAffiliationOther" TEXT,
    "spiritualSupportAvailable" BOOLEAN,
    "culturalFactorsAffectingCare" TEXT,
    "hasLegalRepresentative" BOOLEAN,
    "advanceDirectivesAvailable" BOOLEAN,
    "legalConcerns" "SocialLegalConcern"[] DEFAULT ARRAY[]::"SocialLegalConcern"[],
    "legalConcernOther" TEXT,
    "familyPreparedForPrognosis" "SocialFamilyPreparedness",
    "anticipatoryGrief" "SocialAnticipatoryGrief",
    "bereavementRisk" "SocialBereavementRisk",
    "familyRequiresSupport" BOOLEAN,
    "majorSocialIssues" "SocialMajorIssue"[] DEFAULT ARRAY[]::"SocialMajorIssue"[],
    "majorSocialIssueOther" TEXT,
    "strengthsAndResources" TEXT,
    "areasRequiringIntervention" TEXT,
    "plannedInterventions" "SocialCarePlanIntervention"[] DEFAULT ARRAY[]::"SocialCarePlanIntervention"[],
    "plannedInterventionOther" TEXT,
    "followUpPlan" TEXT,
    "assessmentOutcome" "SocialAssessmentOutcome"[] DEFAULT ARRAY[]::"SocialAssessmentOutcome"[],
    "createdBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" INTEGER,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" INTEGER,
    "deletionReason" TEXT,

    CONSTRAINT "SocialAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialHouseholdMember" (
    "id" SERIAL NOT NULL,
    "socialAssessmentId" INTEGER NOT NULL,
    "name" TEXT,
    "relationship" TEXT,
    "age" INTEGER,
    "occupation" TEXT,

    CONSTRAINT "SocialHouseholdMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpiritualAssessment" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "assessmentType" "SpiritualAssessmentType" NOT NULL,
    "religiousAffiliation" "SpiritualReligiousAffiliation",
    "religiousAffiliationOther" TEXT,
    "faithImportance" "SpiritualFaithImportance",
    "activityParticipation" "SpiritualActivityParticipation",
    "placeOfWorship" TEXT,
    "supportSources" "SpiritualSupportSource"[] DEFAULT ARRAY[]::"SpiritualSupportSource"[],
    "religiousLeaderName" TEXT,
    "religiousLeaderOrganization" TEXT,
    "religiousLeaderPhone" TEXT,
    "lifeMeaningAndPurpose" TEXT,
    "sourcesOfStrength" TEXT,
    "practicesToContinue" BOOLEAN,
    "practicesToContinueDetails" TEXT,
    "ritualsToRespect" BOOLEAN,
    "ritualsToRespectDetails" TEXT,
    "spiritualDistressLevel" "SpiritualDistressLevel",
    "spiritualConcernsDescription" TEXT,
    "currentHopes" TEXT,
    "copingMethods" "SpiritualCopingMethod"[] DEFAULT ARRAY[]::"SpiritualCopingMethod"[],
    "copingMethodOther" TEXT,
    "feelsAtPeace" "SpiritualPeaceStatus",
    "familySharesBeliefs" "SpiritualFamilySharesBeliefs",
    "familyBenefitFromSupport" BOOLEAN,
    "familySpiritualConcerns" TEXT,
    "preferredEndOfLifeCare" "SpiritualEndOfLifeCare"[] DEFAULT ARRAY[]::"SpiritualEndOfLifeCare"[],
    "preferredEndOfLifeCareOther" TEXT,
    "preferredPlaceOfCare" "SpiritualPreferredPlaceOfCare",
    "preferredPlaceOfCareOther" TEXT,
    "preferredPlaceOfDeath" "SpiritualPreferredPlaceOfDeath",
    "religiousPracticesAfterDeath" TEXT,
    "patientStrengths" "SpiritualPatientStrength"[] DEFAULT ARRAY[]::"SpiritualPatientStrength"[],
    "patientStrengthOther" TEXT,
    "additionalStrengths" TEXT,
    "identifiedNeeds" "SpiritualIdentifiedNeed"[] DEFAULT ARRAY[]::"SpiritualIdentifiedNeed"[],
    "identifiedNeedOther" TEXT,
    "plannedInterventions" TEXT,
    "followUpSchedule" "SpiritualFollowUpSchedule",
    "summaryOfAssessment" TEXT,
    "providerDistressLevel" "SpiritualDistressLevel",
    "recommendedServices" "SpiritualRecommendedService"[] DEFAULT ARRAY[]::"SpiritualRecommendedService"[],
    "assessmentOutcome" "SpiritualAssessmentOutcome"[] DEFAULT ARRAY[]::"SpiritualAssessmentOutcome"[],
    "createdBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" INTEGER,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" INTEGER,
    "deletionReason" TEXT,

    CONSTRAINT "SpiritualAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpiritualDistressConcern" (
    "id" SERIAL NOT NULL,
    "spiritualAssessmentId" INTEGER NOT NULL,
    "concern" "SpiritualDistressConcernType" NOT NULL,
    "present" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SpiritualDistressConcern_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PsychiatryAssessment" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "assessmentType" "PsychiatryAssessmentType" NOT NULL,
    "reasonForReferral" TEXT,
    "currentSymptoms" "PsychiatrySymptom"[] DEFAULT ARRAY[]::"PsychiatrySymptom"[],
    "symptomOther" TEXT,
    "onsetAndDuration" TEXT,
    "severity" "PsychiatrySeverity",
    "appearanceBehavior" "PsychiatryAppearanceBehavior"[] DEFAULT ARRAY[]::"PsychiatryAppearanceBehavior"[],
    "speech" "PsychiatrySpeech",
    "mood" "PsychiatryMood",
    "affect" "PsychiatryAffect",
    "thoughtProcess" "PsychiatryThoughtProcess"[] DEFAULT ARRAY[]::"PsychiatryThoughtProcess"[],
    "thoughtContent" "PsychiatryThoughtContent"[] DEFAULT ARRAY[]::"PsychiatryThoughtContent"[],
    "perception" "PsychiatryPerception"[] DEFAULT ARRAY[]::"PsychiatryPerception"[],
    "cognition" "PsychiatryCognition"[] DEFAULT ARRAY[]::"PsychiatryCognition"[],
    "insightJudgment" "PsychiatryInsightJudgment",
    "suicidalIdeation" "PsychiatrySuicidalIdeation",
    "suicideRiskLevel" "PsychiatrySuicideRiskLevel",
    "protectiveFactors" "PsychiatryProtectiveFactor"[] DEFAULT ARRAY[]::"PsychiatryProtectiveFactor"[],
    "organicCauses" "PsychiatryOrganicCause"[] DEFAULT ARRAY[]::"PsychiatryOrganicCause"[],
    "medicationsAffectingMentalState" TEXT,
    "sleepPattern" "PsychiatrySleepPattern",
    "appetite" "PsychiatryAppetite",
    "dailyFunctioning" "PsychiatryDailyFunctioning",
    "socialWithdrawal" "PsychiatrySocialWithdrawal",
    "diagnoses" "PsychiatryDiagnosis"[] DEFAULT ARRAY[]::"PsychiatryDiagnosis"[],
    "diagnosisOther" TEXT,
    "immediateInterventions" "PsychiatryImmediateIntervention"[] DEFAULT ARRAY[]::"PsychiatryImmediateIntervention"[],
    "pharmacologicalPlan" "PsychiatryPharmacologicalPlan"[] DEFAULT ARRAY[]::"PsychiatryPharmacologicalPlan"[],
    "nonPharmacologicalPlan" "PsychiatryNonPharmacologicalPlan"[] DEFAULT ARRAY[]::"PsychiatryNonPharmacologicalPlan"[],
    "monitoringPlan" "PsychiatryMonitoringPlan"[] DEFAULT ARRAY[]::"PsychiatryMonitoringPlan"[],
    "familyDistressLevel" "PsychiatryFamilyDistressLevel",
    "caregiverBurnout" BOOLEAN,
    "familyCounselingNeeded" BOOLEAN,
    "assessmentOutcome" "PsychiatryAssessmentOutcome"[] DEFAULT ARRAY[]::"PsychiatryAssessmentOutcome"[],
    "finalRecommendations" "PsychiatryFinalRecommendation"[] DEFAULT ARRAY[]::"PsychiatryFinalRecommendation"[],
    "createdBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" INTEGER,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" INTEGER,
    "deletionReason" TEXT,

    CONSTRAINT "PsychiatryAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClinicalPharmacistAssessment_patientId_idx" ON "ClinicalPharmacistAssessment"("patientId");

-- CreateIndex
CREATE INDEX "ClinicalPharmacistAssessment_createdBy_idx" ON "ClinicalPharmacistAssessment"("createdBy");

-- CreateIndex
CREATE INDEX "ClinicalPharmacistAssessment_createdAt_idx" ON "ClinicalPharmacistAssessment"("createdAt");

-- CreateIndex
CREATE INDEX "ClinicalPharmacistCurrentMedication_clinicalPharmacistAsses_idx" ON "ClinicalPharmacistCurrentMedication"("clinicalPharmacistAssessmentId");

-- CreateIndex
CREATE INDEX "PhysiotherapyAssessment_patientId_idx" ON "PhysiotherapyAssessment"("patientId");

-- CreateIndex
CREATE INDEX "PhysiotherapyAssessment_createdBy_idx" ON "PhysiotherapyAssessment"("createdBy");

-- CreateIndex
CREATE INDEX "PhysiotherapyAssessment_createdAt_idx" ON "PhysiotherapyAssessment"("createdAt");

-- CreateIndex
CREATE INDEX "PhysiotherapyAdl_physiotherapyAssessmentId_idx" ON "PhysiotherapyAdl"("physiotherapyAssessmentId");

-- CreateIndex
CREATE INDEX "FamilyAssessment_patientId_idx" ON "FamilyAssessment"("patientId");

-- CreateIndex
CREATE INDEX "FamilyAssessment_createdBy_idx" ON "FamilyAssessment"("createdBy");

-- CreateIndex
CREATE INDEX "FamilyAssessment_createdAt_idx" ON "FamilyAssessment"("createdAt");

-- CreateIndex
CREATE INDEX "FamilyHouseholdMember_familyAssessmentId_idx" ON "FamilyHouseholdMember"("familyAssessmentId");

-- CreateIndex
CREATE INDEX "NutritionalAssessment_patientId_idx" ON "NutritionalAssessment"("patientId");

-- CreateIndex
CREATE INDEX "NutritionalAssessment_createdBy_idx" ON "NutritionalAssessment"("createdBy");

-- CreateIndex
CREATE INDEX "NutritionalAssessment_createdAt_idx" ON "NutritionalAssessment"("createdAt");

-- CreateIndex
CREATE INDEX "NutritionalDietaryRecall_nutritionalAssessmentId_idx" ON "NutritionalDietaryRecall"("nutritionalAssessmentId");

-- CreateIndex
CREATE INDEX "NutritionalLabResult_nutritionalAssessmentId_idx" ON "NutritionalLabResult"("nutritionalAssessmentId");

-- CreateIndex
CREATE INDEX "PainAssessment_patientId_idx" ON "PainAssessment"("patientId");

-- CreateIndex
CREATE INDEX "PainAssessment_createdBy_idx" ON "PainAssessment"("createdBy");

-- CreateIndex
CREATE INDEX "PainAssessment_createdAt_idx" ON "PainAssessment"("createdAt");

-- CreateIndex
CREATE INDEX "PainImpact_painAssessmentId_idx" ON "PainImpact"("painAssessmentId");

-- CreateIndex
CREATE INDEX "SocialAssessment_patientId_idx" ON "SocialAssessment"("patientId");

-- CreateIndex
CREATE INDEX "SocialAssessment_createdBy_idx" ON "SocialAssessment"("createdBy");

-- CreateIndex
CREATE INDEX "SocialAssessment_createdAt_idx" ON "SocialAssessment"("createdAt");

-- CreateIndex
CREATE INDEX "SocialHouseholdMember_socialAssessmentId_idx" ON "SocialHouseholdMember"("socialAssessmentId");

-- CreateIndex
CREATE INDEX "SpiritualAssessment_patientId_idx" ON "SpiritualAssessment"("patientId");

-- CreateIndex
CREATE INDEX "SpiritualAssessment_createdBy_idx" ON "SpiritualAssessment"("createdBy");

-- CreateIndex
CREATE INDEX "SpiritualAssessment_createdAt_idx" ON "SpiritualAssessment"("createdAt");

-- CreateIndex
CREATE INDEX "SpiritualDistressConcern_spiritualAssessmentId_idx" ON "SpiritualDistressConcern"("spiritualAssessmentId");

-- CreateIndex
CREATE INDEX "PsychiatryAssessment_patientId_idx" ON "PsychiatryAssessment"("patientId");

-- CreateIndex
CREATE INDEX "PsychiatryAssessment_createdBy_idx" ON "PsychiatryAssessment"("createdBy");

-- CreateIndex
CREATE INDEX "PsychiatryAssessment_createdAt_idx" ON "PsychiatryAssessment"("createdAt");

-- AddForeignKey
ALTER TABLE "ClinicalPharmacistAssessment" ADD CONSTRAINT "ClinicalPharmacistAssessment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicalPharmacistAssessment" ADD CONSTRAINT "ClinicalPharmacistAssessment_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicalPharmacistAssessment" ADD CONSTRAINT "ClinicalPharmacistAssessment_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicalPharmacistAssessment" ADD CONSTRAINT "ClinicalPharmacistAssessment_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicalPharmacistCurrentMedication" ADD CONSTRAINT "ClinicalPharmacistCurrentMedication_clinicalPharmacistAsse_fkey" FOREIGN KEY ("clinicalPharmacistAssessmentId") REFERENCES "ClinicalPharmacistAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhysiotherapyAssessment" ADD CONSTRAINT "PhysiotherapyAssessment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhysiotherapyAssessment" ADD CONSTRAINT "PhysiotherapyAssessment_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhysiotherapyAssessment" ADD CONSTRAINT "PhysiotherapyAssessment_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhysiotherapyAssessment" ADD CONSTRAINT "PhysiotherapyAssessment_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhysiotherapyAdl" ADD CONSTRAINT "PhysiotherapyAdl_physiotherapyAssessmentId_fkey" FOREIGN KEY ("physiotherapyAssessmentId") REFERENCES "PhysiotherapyAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyAssessment" ADD CONSTRAINT "FamilyAssessment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyAssessment" ADD CONSTRAINT "FamilyAssessment_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyAssessment" ADD CONSTRAINT "FamilyAssessment_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyAssessment" ADD CONSTRAINT "FamilyAssessment_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyHouseholdMember" ADD CONSTRAINT "FamilyHouseholdMember_familyAssessmentId_fkey" FOREIGN KEY ("familyAssessmentId") REFERENCES "FamilyAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NutritionalAssessment" ADD CONSTRAINT "NutritionalAssessment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NutritionalAssessment" ADD CONSTRAINT "NutritionalAssessment_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NutritionalAssessment" ADD CONSTRAINT "NutritionalAssessment_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NutritionalAssessment" ADD CONSTRAINT "NutritionalAssessment_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NutritionalDietaryRecall" ADD CONSTRAINT "NutritionalDietaryRecall_nutritionalAssessmentId_fkey" FOREIGN KEY ("nutritionalAssessmentId") REFERENCES "NutritionalAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NutritionalLabResult" ADD CONSTRAINT "NutritionalLabResult_nutritionalAssessmentId_fkey" FOREIGN KEY ("nutritionalAssessmentId") REFERENCES "NutritionalAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PainAssessment" ADD CONSTRAINT "PainAssessment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PainAssessment" ADD CONSTRAINT "PainAssessment_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PainAssessment" ADD CONSTRAINT "PainAssessment_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PainAssessment" ADD CONSTRAINT "PainAssessment_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PainImpact" ADD CONSTRAINT "PainImpact_painAssessmentId_fkey" FOREIGN KEY ("painAssessmentId") REFERENCES "PainAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialAssessment" ADD CONSTRAINT "SocialAssessment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialAssessment" ADD CONSTRAINT "SocialAssessment_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialAssessment" ADD CONSTRAINT "SocialAssessment_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialAssessment" ADD CONSTRAINT "SocialAssessment_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialHouseholdMember" ADD CONSTRAINT "SocialHouseholdMember_socialAssessmentId_fkey" FOREIGN KEY ("socialAssessmentId") REFERENCES "SocialAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpiritualAssessment" ADD CONSTRAINT "SpiritualAssessment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpiritualAssessment" ADD CONSTRAINT "SpiritualAssessment_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpiritualAssessment" ADD CONSTRAINT "SpiritualAssessment_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpiritualAssessment" ADD CONSTRAINT "SpiritualAssessment_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpiritualDistressConcern" ADD CONSTRAINT "SpiritualDistressConcern_spiritualAssessmentId_fkey" FOREIGN KEY ("spiritualAssessmentId") REFERENCES "SpiritualAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PsychiatryAssessment" ADD CONSTRAINT "PsychiatryAssessment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PsychiatryAssessment" ADD CONSTRAINT "PsychiatryAssessment_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PsychiatryAssessment" ADD CONSTRAINT "PsychiatryAssessment_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PsychiatryAssessment" ADD CONSTRAINT "PsychiatryAssessment_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
