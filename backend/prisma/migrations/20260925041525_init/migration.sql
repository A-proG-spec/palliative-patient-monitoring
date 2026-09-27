-- CreateEnum
CREATE TYPE "YesNo" AS ENUM ('No', 'Yes');

-- CreateEnum
CREATE TYPE "YesNoEmpty" AS ENUM ('No', 'Yes', 'Empty');

-- CreateEnum
CREATE TYPE "DiseaseStage" AS ENUM ('Early', 'Advanced', 'EndStage');

-- CreateEnum
CREATE TYPE "DiseaseStageAdmission" AS ENUM ('Early', 'Advanced', 'Terminal');

-- CreateEnum
CREATE TYPE "Prognosis" AS ENUM ('Days', 'Weeks', 'Months', 'Uncertain');

-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('Male', 'Female');

-- CreateEnum
CREATE TYPE "PatientStatus" AS ENUM ('Active', 'Discharged');

-- CreateEnum
CREATE TYPE "CurrentLocation" AS ENUM ('Home', 'ReferredHospital');

-- CreateEnum
CREATE TYPE "StaffRole" AS ENUM ('Physician', 'Nurse', 'Pharmacist', 'Radiologist', 'LaboratoryTechnician', 'Physiologist', 'Psychiatrist', 'Psychologist', 'SocialWorker', 'SpiritualPerson');

-- CreateEnum
CREATE TYPE "StaffStatus" AS ENUM ('Pending', 'Active', 'Rejected');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('StaffApproval', 'ReferralApproval', 'CloseCase');

-- CreateEnum
CREATE TYPE "ReferralType" AS ENUM ('Incoming', 'Outgoing');

-- CreateEnum
CREATE TYPE "ReferralStatus" AS ENUM ('Pending', 'Accepted', 'Declined', 'Admitted', 'InfoRequested');

-- CreateEnum
CREATE TYPE "ReferralActionTaken" AS ENUM ('ReferralAccepted', 'AppointmentScheduled', 'AdditionalInfoRequested', 'ReferralDeclined', 'PatientAdmitted', 'PatientTransferred');

-- CreateEnum
CREATE TYPE "ReferralFollowUpStatus" AS ENUM ('Completed', 'Pending', 'UnableToContact');

-- CreateEnum
CREATE TYPE "ReferralReason" AS ENUM ('PainManagement', 'SymptomControl', 'EndOfLifeCare', 'HomeHospiceCare', 'InpatientAdmission', 'PsychologicalSupport', 'SpiritualCare', 'CaregiverSupport', 'BereavementServices', 'EmergencyCare', 'DiagnosticEvaluation', 'Other');

-- CreateEnum
CREATE TYPE "MedicationAdministeredAt" AS ENUM ('Home', 'Hospital');

-- CreateEnum
CREATE TYPE "MedicationStatus" AS ENUM ('Ordered', 'Given');

-- CreateEnum
CREATE TYPE "LabCategory" AS ENUM ('Hematology', 'Chemistry', 'Hormone', 'Urinalysis', 'Stool', 'Microbiology', 'Histopathology', 'Immunology', 'Cardiac');

-- CreateEnum
CREATE TYPE "LabPriority" AS ENUM ('Routine', 'Urgent', 'Emergency');

-- CreateEnum
CREATE TYPE "LabStatus" AS ENUM ('Ordered', 'Completed', 'Cancelled');

-- CreateEnum
CREATE TYPE "LabLocation" AS ENUM ('Home', 'Hospital');

-- CreateEnum
CREATE TYPE "LabAbnormalFlag" AS ENUM ('Low', 'High', 'Critical', 'Normal');

-- CreateEnum
CREATE TYPE "ImagingModality" AS ENUM ('XRay', 'Ultrasound', 'CT', 'MRI', 'Mammography', 'Fluoroscopy', 'Interventional', 'NuclearMedicine', 'Other');

-- CreateEnum
CREATE TYPE "ImagingContrastDecision" AS ENUM ('No', 'Yes', 'ToBeDetermined', 'NotApplicable');

-- CreateEnum
CREATE TYPE "ImagingPregnancyStatus" AS ENUM ('NotPregnant', 'Pregnant', 'PossiblyPregnant', 'NotApplicable');

-- CreateEnum
CREATE TYPE "ImagingMetallicForeignBody" AS ENUM ('No', 'Yes', 'Unknown');

-- CreateEnum
CREATE TYPE "ImagingPriority" AS ENUM ('Routine', 'Urgent', 'Emergency');

-- CreateEnum
CREATE TYPE "ImagingLaterality" AS ENUM ('Right', 'Left', 'Bilateral', 'NotApplicable');

-- CreateEnum
CREATE TYPE "ImagingImageQuality" AS ENUM ('Diagnostic', 'Limited', 'NonDiagnostic', 'RepeatRequired');

-- CreateEnum
CREATE TYPE "ImagingPreparation" AS ENUM ('None', 'Fasting', 'FullBladder', 'EmptyBladder', 'SpecialMedicationPreparation', 'Other');

-- CreateEnum
CREATE TYPE "ImagingPerformedContrast" AS ENUM ('None', 'Administered', 'NotAdministered');

-- CreateEnum
CREATE TYPE "ImagingStatus" AS ENUM ('Ordered', 'Completed', 'Cancelled');

-- CreateEnum
CREATE TYPE "AdmissionReferredFrom" AS ENUM ('InternalWard', 'OutpatientDepartment', 'ICU', 'ExternalHospital', 'Community', 'Home', 'Other');

-- CreateEnum
CREATE TYPE "AdmissionReferralReason" AS ENUM ('PainManagement', 'EndOfLifeCare', 'SymptomControl', 'HomeBasedCare', 'PsychosocialSupport', 'Other');

-- CreateEnum
CREATE TYPE "AdmissionFunctionalStatus" AS ENUM ('FullyIndependent', 'PartiallyDependent', 'FullyDependent');

-- CreateEnum
CREATE TYPE "AdmissionPainType" AS ENUM ('Acute', 'Chronic', 'Neuropathic', 'Mixed');

-- CreateEnum
CREATE TYPE "AdmissionSymptom" AS ENUM ('Dyspnea', 'Nausea', 'Fatigue', 'Anxiety', 'Depression', 'Insomnia', 'Other');

-- CreateEnum
CREATE TYPE "AdmissionEmotionalStatus" AS ENUM ('Stable', 'Anxious', 'Depressed', 'Distressed');

-- CreateEnum
CREATE TYPE "AdmissionFamilySupport" AS ENUM ('Strong', 'Moderate', 'Weak', 'None');

-- CreateEnum
CREATE TYPE "AdmissionSpiritualSupport" AS ENUM ('ReligiousLeader', 'Counselor', 'Other');

-- CreateEnum
CREATE TYPE "AdmissionDischargeReason" AS ENUM ('Improved', 'Deceased');

-- CreateEnum
CREATE TYPE "AdmissionStatus" AS ENUM ('Active', 'Discharged');

-- CreateEnum
CREATE TYPE "VisitType" AS ENUM ('Routine', 'Emergency', 'FirstAssessment', 'PostDischarge', 'EndOfLife', 'Bereavement');

-- CreateEnum
CREATE TYPE "VisitTeamRole" AS ENUM ('Physician', 'Nurse');

-- CreateEnum
CREATE TYPE "VisitOverallStatus" AS ENUM ('Stable', 'Deteriorating', 'Critical', 'BedBound');

-- CreateEnum
CREATE TYPE "ActivityOfDailyLivingStatus" AS ENUM ('Independent', 'NeedsAssistance', 'FullyDependent');

-- CreateEnum
CREATE TYPE "VisitMobility" AS ENUM ('Ambulatory', 'RequiresAssistance', 'Bedridden');

-- CreateEnum
CREATE TYPE "VisitPainLocation" AS ENUM ('Head', 'Neck', 'Chest', 'Abdomen', 'Back', 'Limbs', 'Generalized', 'Other');

-- CreateEnum
CREATE TYPE "VisitPainCharacteristic" AS ENUM ('Sharp', 'Dull', 'Burning', 'Cramping', 'Intermittent', 'Continuous');

-- CreateEnum
CREATE TYPE "VisitSymptom" AS ENUM ('Dyspnea', 'Nausea', 'Constipation', 'Anxiety', 'Fatigue', 'PoorAppetite', 'PressureSores', 'Other');

-- CreateEnum
CREATE TYPE "VisitADLLevel" AS ENUM ('Independent', 'NeedsAssistance', 'FullyDependent');

-- CreateEnum
CREATE TYPE "VisitAppetite" AS ENUM ('Good', 'Fair', 'Poor', 'UnableToEat');

-- CreateEnum
CREATE TYPE "VisitOralIntake" AS ENUM ('Adequate', 'Reduced', 'Minimal');

-- CreateEnum
CREATE TYPE "ADL" AS ENUM ('Independent', 'NeedAssistance', 'Dependent');

-- CreateEnum
CREATE TYPE "VisitHydrationStatus" AS ENUM ('Adequate', 'MildDehydration', 'SevereDehydration');

-- CreateEnum
CREATE TYPE "VisitEmotionalStatus" AS ENUM ('Stable', 'Anxious', 'Depressed', 'Fearful', 'Distressed');

-- CreateEnum
CREATE TYPE "VisitFamilySupport" AS ENUM ('Excellent', 'Good', 'Limited', 'None');

-- CreateEnum
CREATE TYPE "VisitAdherenceLevel" AS ENUM ('Good', 'Partial', 'Poor');

-- CreateEnum
CREATE TYPE "VisitCaregiverBurden" AS ENUM ('Low', 'Moderate', 'High');

-- CreateEnum
CREATE TYPE "VisitCaregiverUnderstanding" AS ENUM ('Good', 'Fair', 'Poor');

-- CreateEnum
CREATE TYPE "VisitCaregivingCapacity" AS ENUM ('Strong', 'Moderate', 'Weak');

-- CreateEnum
CREATE TYPE "VisitFamilyEmotionalStatus" AS ENUM ('Stable', 'Stressed', 'Overwhelmed');

-- CreateEnum
CREATE TYPE "VisitEducationProvided" AS ENUM ('MedicationAdministration', 'PainManagement', 'NutritionSupport', 'SkinCare', 'PressureSorePrevention', 'EndOfLifeCare', 'EmergencySigns', 'EmotionalSupport', 'Other');

-- CreateEnum
CREATE TYPE "VisitHomeCondition" AS ENUM ('Clean', 'Fair', 'Poor');

-- CreateEnum
CREATE TYPE "VisitHomeObservation" AS ENUM ('AdequateLighting', 'Ventilation', 'SafeBed', 'CleanWater', 'SanitationIssues');

-- CreateEnum
CREATE TYPE "VisitNursingCare" AS ENUM ('Hygiene', 'WoundCare', 'MedicationAdmin', 'PositionChange', 'FeedingAssistance', 'Counseling', 'Other');

-- CreateEnum
CREATE TYPE "VisitRedFlag" AS ENUM ('SevereUncontrolledPain', 'SevereShortnessOfBreath', 'MassiveBleeding', 'UncontrolledSeizures', 'AlteredMentalStatus', 'SevereDehydration', 'None');

-- CreateEnum
CREATE TYPE "VisitReferralMade" AS ENUM ('PhysicianReview', 'HospitalAdmission', 'SocialWorker', 'Psychologist', 'SpiritualCare', 'NutritionSupport');

-- CreateEnum
CREATE TYPE "VisitOutcome" AS ENUM ('Stable', 'SymptomsImproved', 'SymptomsUnchanged', 'SymptomsWorsened', 'ReferredToFacility', 'Deceased');

-- CreateEnum
CREATE TYPE "ProgressNoteSignatureRole" AS ENUM ('Physician', 'Nurse', 'Reviewer');

-- CreateEnum
CREATE TYPE "SymptomSeverity" AS ENUM ('None', 'Mild', 'Moderate', 'Severe');

-- CreateEnum
CREATE TYPE "ProgressNoteGeneralCondition" AS ENUM ('Stable', 'Improving', 'Deteriorating', 'Critical', 'ActivelyDying');

-- CreateEnum
CREATE TYPE "ProgressNoteConsciousness" AS ENUM ('Alert', 'Drowsy', 'Confused', 'Delirious', 'Unresponsive');

-- CreateEnum
CREATE TYPE "ProgressNoteOrientation" AS ENUM ('Oriented', 'PartiallyOriented', 'Disoriented', 'UnableToAssess');

-- CreateEnum
CREATE TYPE "ProgressNoteFunctionalStatus" AS ENUM ('Independent', 'RequiresAssistance', 'Bedbound', 'FullyDependent');

-- CreateEnum
CREATE TYPE "ProgressNoteResponse" AS ENUM ('Good', 'Partial', 'Poor', 'NotApplicable');

-- CreateEnum
CREATE TYPE "ProgressNoteBreathing" AS ENUM ('Comfortable', 'MildDistress', 'ModerateDistress', 'SevereDistress');

-- CreateEnum
CREATE TYPE "ProgressNoteOxygenDelivery" AS ENUM ('NasalCannula', 'Mask', 'Other');

-- CreateEnum
CREATE TYPE "ProgressNoteSecretions" AS ENUM ('None', 'Mild', 'Moderate', 'Excessive');

-- CreateEnum
CREATE TYPE "ProgressNoteOralIntake" AS ENUM ('Good', 'Reduced', 'Minimal', 'None');

-- CreateEnum
CREATE TYPE "ProgressNoteUrineOutput" AS ENUM ('Normal', 'Reduced', 'Minimal', 'UnableToAssess');

-- CreateEnum
CREATE TYPE "ProgressNoteBowelMovement" AS ENUM ('Normal', 'Constipated', 'Diarrhea', 'NoRecentBM');

-- CreateEnum
CREATE TYPE "ProgressNoteSkin" AS ENUM ('Intact', 'Dry', 'Fragile', 'Edematous', 'Other');

-- CreateEnum
CREATE TYPE "ProgressNoteMoodBehavior" AS ENUM ('Calm', 'Anxious', 'Fearful', 'Sad', 'Depressed', 'Agitated', 'Withdrawn');

-- CreateEnum
CREATE TYPE "ProgressNoteDistress" AS ENUM ('None', 'Mild', 'Moderate', 'Severe');

-- CreateEnum
CREATE TYPE "ProgressNoteGoalsOfCare" AS ENUM ('ComfortSymptomControl', 'QualityOfLife', 'FunctionalSupport', 'DiseaseDirectedTreatment', 'EndOfLifeCare', 'HomeHospiceCare', 'Other');

-- CreateEnum
CREATE TYPE "ProgressNotePRNEffectiveness" AS ENUM ('Effective', 'PartiallyEffective', 'Ineffective');

-- CreateEnum
CREATE TYPE "ProgressNoteNursingCare" AS ENUM ('PositioningComfortMeasures', 'PersonalHygiene', 'OralCare', 'PressureInjuryPrevention', 'WoundCare', 'OxygenTherapy', 'SymptomMonitoring', 'MedicationAdministration', 'NutritionHydrationSupport', 'EmotionalSupport', 'FamilyCaregiverEducation', 'Other');

-- CreateEnum
CREATE TYPE "ProgressNoteInvestigation" AS ENUM ('LaboratoryTests', 'Imaging', 'ECGOtherDiagnosticTest', 'None', 'Other');

-- CreateEnum
CREATE TYPE "DischargeType" AS ENUM ('PlannedDischarge', 'Transfer', 'DischargeToHome', 'DischargeToHospice', 'DischargeToLongTermCare', 'TransferToAnotherHospital', 'Other');

-- CreateEnum
CREATE TYPE "DischargeOverallCondition" AS ENUM ('Stable', 'Improved', 'Unchanged', 'Deteriorating', 'RequiresOngoingPalliativeCare');

-- CreateEnum
CREATE TYPE "DischargeConsciousness" AS ENUM ('Alert', 'Drowsy', 'Confused', 'Delirious', 'Unresponsive');

-- CreateEnum
CREATE TYPE "DischargeFunctionalStatus" AS ENUM ('Independent', 'RequiresAssistance', 'Bedbound', 'FullyDependent');

-- CreateEnum
CREATE TYPE "DischargeMobility" AS ENUM ('Independent', 'Assisted', 'Wheelchair', 'Bedbound');

-- CreateEnum
CREATE TYPE "DischargeOralIntake" AS ENUM ('Adequate', 'Reduced', 'Minimal', 'None');

-- CreateEnum
CREATE TYPE "DischargePainControl" AS ENUM ('WellControlled', 'PartiallyControlled', 'PoorlyControlled');

-- CreateEnum
CREATE TYPE "DischargeDiet" AS ENUM ('Regular', 'Soft', 'Pureed', 'Modified', 'Other');

-- CreateEnum
CREATE TYPE "DischargeFeedingAssistance" AS ENUM ('NotRequired', 'Required');

-- CreateEnum
CREATE TYPE "DischargeFeedingTube" AS ENUM ('None', 'NG', 'PEG', 'Other');

-- CreateEnum
CREATE TYPE "DischargeOxygenDelivery" AS ENUM ('NasalCannula', 'Mask', 'Other');

-- CreateEnum
CREATE TYPE "DischargeCodeStatus" AS ENUM ('FullResuscitation', 'DNAR', 'Other');

-- CreateEnum
CREATE TYPE "DischargeAdvanceCarePlan" AS ENUM ('NotAvailable', 'Completed', 'Reviewed', 'Updated');

-- CreateEnum
CREATE TYPE "DischargeDestination" AS ENUM ('Home', 'FamilyCaregiverHome', 'Hospice', 'NursingLongTermCare', 'AnotherHospital', 'Other');

-- CreateEnum
CREATE TYPE "DischargeTransport" AS ENUM ('FamilyPrivateTransport', 'Ambulance', 'MedicalTransport', 'Other');

-- CreateEnum
CREATE TYPE "DischargeHospiceReferral" AS ENUM ('No', 'Yes', 'AlreadyEnrolled');

-- CreateEnum
CREATE TYPE "DischargePatientUnderstanding" AS ENUM ('VerbalizedUnderstanding', 'DemonstratedUnderstanding', 'RequiresFurtherEducation');

-- CreateEnum
CREATE TYPE "DischargeStatus" AS ENUM ('Draft', 'Final');

-- CreateEnum
CREATE TYPE "HospiceConsciousness" AS ENUM ('Alert', 'Drowsy', 'Confused', 'Unresponsive', 'Comatose');

-- CreateEnum
CREATE TYPE "HospiceOrientation" AS ENUM ('OrientedToPerson', 'OrientedToPlace', 'OrientedToTime', 'Disoriented');

-- CreateEnum
CREATE TYPE "HospiceGeneralAppearance" AS ENUM ('Comfortable', 'MildDistress', 'ModerateDistress', 'SevereDistress', 'Cachectic', 'Bedridden', 'WellGroomed', 'PoorHygiene');

-- CreateEnum
CREATE TYPE "HospiceBreathingPattern" AS ENUM ('Normal', 'Labored', 'Shallow', 'Rapid', 'Slow');

-- CreateEnum
CREATE TYPE "HospiceDyspneaSeverity" AS ENUM ('None', 'Mild', 'Moderate', 'Severe');

-- CreateEnum
CREATE TYPE "HospiceCoughType" AS ENUM ('None', 'Dry', 'Productive');

-- CreateEnum
CREATE TYPE "HospiceSputumColor" AS ENUM ('None', 'Clear', 'Yellow', 'Green', 'Bloody');

-- CreateEnum
CREATE TYPE "HospicePulseRhythm" AS ENUM ('Regular', 'Irregular');

-- CreateEnum
CREATE TYPE "HospiceEdemaSeverity" AS ENUM ('None', 'Mild', 'Moderate', 'Severe');

-- CreateEnum
CREATE TYPE "HospiceSkinColor" AS ENUM ('Normal', 'Pale', 'Cyanotic', 'Jaundiced');

-- CreateEnum
CREATE TYPE "HospiceAppetite" AS ENUM ('Good', 'Fair', 'Poor', 'UnableToEat');

-- CreateEnum
CREATE TYPE "HospiceNauseaSeverity" AS ENUM ('None', 'Mild', 'Moderate', 'Severe');

-- CreateEnum
CREATE TYPE "HospiceBowelFunction" AS ENUM ('Normal', 'Constipation', 'Diarrhea', 'Incontinence');

-- CreateEnum
CREATE TYPE "HospiceUrinaryFunction" AS ENUM ('Normal', 'Frequency', 'Retention', 'Incontinence', 'Catheterized');

-- CreateEnum
CREATE TYPE "HospiceUrineAppearance" AS ENUM ('Clear', 'Cloudy', 'Bloody', 'Dark');

-- CreateEnum
CREATE TYPE "HospiceSkinIntegrity" AS ENUM ('Intact', 'Dry', 'Fragile', 'WoundPresent', 'PressureUlcer');

-- CreateEnum
CREATE TYPE "HospicePressureInjuryRisk" AS ENUM ('Low', 'Moderate', 'High');

-- CreateEnum
CREATE TYPE "HospicePressureUlcerStage" AS ENUM ('I', 'II', 'III', 'IV');

-- CreateEnum
CREATE TYPE "HospiceMobilityStatus" AS ENUM ('Independent', 'RequiresAssistance', 'WheelchairDependent', 'Bedridden');

-- CreateEnum
CREATE TYPE "HospiceFallRisk" AS ENUM ('Low', 'Moderate', 'High');

-- CreateEnum
CREATE TYPE "HospiceAssistiveDevice" AS ENUM ('None', 'Cane', 'Walker', 'Wheelchair', 'Other');

-- CreateEnum
CREATE TYPE "HospiceADLLevel" AS ENUM ('Independent', 'Assistance', 'Dependent');

-- CreateEnum
CREATE TYPE "HospiceADLActivity" AS ENUM ('Feeding', 'Bathing', 'Dressing', 'Toileting', 'Mobility');

-- CreateEnum
CREATE TYPE "HospiceEmotionalStatus" AS ENUM ('Stable', 'Anxious', 'Depressed', 'Fearful', 'Agitated', 'Grieving');

-- CreateEnum
CREATE TYPE "HospiceCommunicationAbility" AS ENUM ('Normal', 'Impaired', 'NonVerbal');

-- CreateEnum
CREATE TYPE "HospiceCognitiveStatus" AS ENUM ('Intact', 'MildImpairment', 'SevereImpairment');

-- CreateEnum
CREATE TYPE "HospiceFamilySupport" AS ENUM ('Strong', 'Moderate', 'Limited', 'None');

-- CreateEnum
CREATE TYPE "HospiceCaregiverStress" AS ENUM ('Low', 'Moderate', 'High');

-- CreateEnum
CREATE TYPE "HospiceReligiousAffiliation" AS ENUM ('Orthodox', 'Muslim', 'Protestant', 'Catholic', 'Other');

-- CreateEnum
CREATE TYPE "HospiceNursingDiagnosis" AS ENUM ('AcutePain', 'ChronicPain', 'ImpairedMobility', 'RiskForFalls', 'ImpairedSkinIntegrity', 'ImbalancedNutrition', 'Anxiety', 'CaregiverStrain', 'IneffectiveBreathingPattern', 'Other');

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Staff" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "StaffRole",
    "status" "StaffStatus" NOT NULL DEFAULT 'Pending',
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerificationOtp" TEXT,
    "emailVerificationOtpExpires" TIMESTAMP(3),
    "emailVerificationOtpAttempts" INTEGER NOT NULL DEFAULT 0,
    "assignedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" INTEGER,
    "deletionReason" TEXT,
    "updatedBy" INTEGER,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "sex" "Sex" NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "emergencyContactName" TEXT NOT NULL,
    "emergencyContactPhone" TEXT NOT NULL,
    "caregiverName" TEXT NOT NULL,
    "caregiverPhone" TEXT NOT NULL,
    "caregiverRelation" TEXT,
    "primaryDiagnosis" TEXT NOT NULL,
    "secondaryDiagnoses" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "diseaseStage" "DiseaseStage" NOT NULL,
    "comorbidities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "estimatedPrognosis" "Prognosis" NOT NULL,
    "status" "PatientStatus" NOT NULL DEFAULT 'Active',
    "currentLocation" "CurrentLocation" NOT NULL DEFAULT 'Home',
    "hospitalPatientId" TEXT,
    "registeredBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" INTEGER,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Medication" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "prescribedBy" INTEGER NOT NULL,
    "administeredAt" "MedicationAdministeredAt" NOT NULL,
    "status" "MedicationStatus" NOT NULL DEFAULT 'Ordered',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" INTEGER,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" INTEGER,
    "deletionReason" TEXT,

    CONSTRAINT "Medication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "type" "NotificationType" NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB NOT NULL DEFAULT '{}',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Referral" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "referralType" "ReferralType" NOT NULL,
    "referralDate" TIMESTAMP(3) NOT NULL,
    "primaryDiagnosis" TEXT NOT NULL,
    "diseaseStage" "DiseaseStage" NOT NULL,
    "ppsScore" INTEGER NOT NULL,
    "kpsScore" INTEGER NOT NULL,
    "currentSymptoms" JSONB NOT NULL DEFAULT '{}',
    "reasons" "ReferralReason"[] DEFAULT ARRAY[]::"ReferralReason"[],
    "otherReason" TEXT,
    "referringFacility" TEXT NOT NULL,
    "receivingFacility" TEXT NOT NULL,
    "contactPerson" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "status" "ReferralStatus" NOT NULL DEFAULT 'Pending',
    "actionTaken" "ReferralActionTaken",
    "outcome" TEXT NOT NULL DEFAULT '',
    "followUpDate" TIMESTAMP(3),
    "followUpStatus" "ReferralFollowUpStatus",
    "requestedBy" INTEGER NOT NULL,
    "approvedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LaboratoryTest" (
    "id" SERIAL NOT NULL,
    "hospitalClinic" TEXT NOT NULL DEFAULT 'Yekatit 12 Hospital Medical College',
    "departmentLaboratory" TEXT NOT NULL DEFAULT 'Clinical Laboratory',
    "dateOfRequest" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "patientId" INTEGER NOT NULL,
    "wardClinic" TEXT,
    "physicianRequester" TEXT NOT NULL,
    "contactExtension" TEXT,
    "category" "LabCategory" NOT NULL,
    "testName" TEXT NOT NULL,
    "otherText" TEXT,
    "specimenType" TEXT,
    "specimenSite" TEXT,
    "clinicalHistory" TEXT,
    "priority" "LabPriority" NOT NULL DEFAULT 'Routine',
    "collectionDate" TIMESTAMP(3),
    "collectionTime" TEXT,
    "receivedDate" TIMESTAMP(3),
    "receivedTime" TEXT,
    "dateOrdered" TIMESTAMP(3) NOT NULL,
    "location" "LabLocation" NOT NULL,
    "status" "LabStatus" NOT NULL DEFAULT 'Ordered',
    "datePerformed" TIMESTAMP(3),
    "result" TEXT,
    "referenceRange" TEXT,
    "abnormalFlag" "LabAbnormalFlag",
    "resultNotes" TEXT,
    "performedBy" TEXT,
    "orderedBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" INTEGER,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" INTEGER,
    "deletionReason" TEXT,
    "hospitalAdmissionId" INTEGER,

    CONSTRAINT "LaboratoryTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabResult" (
    "id" SERIAL NOT NULL,
    "labTestOrderId" INTEGER NOT NULL,
    "reportNumber" TEXT,
    "collectedAt" TIMESTAMP(3),
    "reportedAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "stoolMacroscopic" TEXT,
    "stoolChemical" TEXT,
    "stoolMicroscopic" TEXT,
    "stoolAdditional" TEXT,
    "urineChemical" TEXT,
    "urineMicroscopic" TEXT,
    "urineAdditional" TEXT,
    "hemoglobin" DOUBLE PRECISION,
    "hematocrit" DOUBLE PRECISION,
    "rbcCount" DOUBLE PRECISION,
    "wbcCount" DOUBLE PRECISION,
    "plateletCount" DOUBLE PRECISION,
    "mcv" DOUBLE PRECISION,
    "mch" DOUBLE PRECISION,
    "mchc" DOUBLE PRECISION,
    "rdw" DOUBLE PRECISION,
    "neutrophils" DOUBLE PRECISION,
    "neutrophilsAbs" DOUBLE PRECISION,
    "lymphocytes" DOUBLE PRECISION,
    "lymphocytesAbs" DOUBLE PRECISION,
    "monocytes" DOUBLE PRECISION,
    "monocytesAbs" DOUBLE PRECISION,
    "eosinophils" DOUBLE PRECISION,
    "eosinophilsAbs" DOUBLE PRECISION,
    "basophils" DOUBLE PRECISION,
    "basophilsAbs" DOUBLE PRECISION,
    "bloodFilm" TEXT,
    "additionalBloodTests" TEXT,
    "glucose" DOUBLE PRECISION,
    "urea" DOUBLE PRECISION,
    "creatinine" DOUBLE PRECISION,
    "uricAcid" DOUBLE PRECISION,
    "totalProtein" DOUBLE PRECISION,
    "albumin" DOUBLE PRECISION,
    "totalBilirubin" DOUBLE PRECISION,
    "directBilirubin" DOUBLE PRECISION,
    "alt" DOUBLE PRECISION,
    "ast" DOUBLE PRECISION,
    "alp" DOUBLE PRECISION,
    "totalCholesterol" DOUBLE PRECISION,
    "triglycerides" DOUBLE PRECISION,
    "hdlC" DOUBLE PRECISION,
    "ldlC" DOUBLE PRECISION,
    "sodium" DOUBLE PRECISION,
    "potassium" DOUBLE PRECISION,
    "chloride" DOUBLE PRECISION,
    "calcium" DOUBLE PRECISION,
    "phosphate" DOUBLE PRECISION,
    "tsh" DOUBLE PRECISION,
    "freeT4" DOUBLE PRECISION,
    "freeT3" DOUBLE PRECISION,
    "fsh" DOUBLE PRECISION,
    "lh" DOUBLE PRECISION,
    "prolactin" DOUBLE PRECISION,
    "estradiol" DOUBLE PRECISION,
    "progesterone" DOUBLE PRECISION,
    "testosterone" DOUBLE PRECISION,
    "cortisol" DOUBLE PRECISION,
    "insulin" DOUBLE PRECISION,
    "hcg" DOUBLE PRECISION,
    "betaHcg" DOUBLE PRECISION,
    "growthHormone" DOUBLE PRECISION,
    "acth" DOUBLE PRECISION,
    "pth" DOUBLE PRECISION,
    "interpretation" TEXT,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "patientId" INTEGER,

    CONSTRAINT "LabResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImagingOrder" (
    "id" SERIAL NOT NULL,
    "hospital" TEXT DEFAULT 'Diagnostics imaging/Radiology',
    "department" TEXT,
    "patientId" INTEGER NOT NULL,
    "patientName" TEXT,
    "medicalRecordNo" TEXT,
    "wardClinic" TEXT,
    "contactNo" TEXT,
    "provisionalDiagnosis" TEXT,
    "presentingSymptoms" TEXT,
    "medicalHistory" TEXT,
    "previousImaging" BOOLEAN NOT NULL DEFAULT false,
    "previousImagingDetails" TEXT,
    "modality" "ImagingModality" NOT NULL,
    "modalityOtherText" TEXT,
    "bodyRegion" TEXT NOT NULL,
    "bodyRegionOtherText" TEXT,
    "laterality" "ImagingLaterality" NOT NULL DEFAULT 'NotApplicable',
    "contrastRequested" "ImagingContrastDecision" NOT NULL DEFAULT 'No',
    "specificSite" TEXT,
    "protocolViews" TEXT,
    "specialClinicalQuestion" TEXT,
    "previousContrastReaction" BOOLEAN NOT NULL DEFAULT false,
    "previousContrastReactionDetails" TEXT,
    "knownAllergies" TEXT,
    "creatinine" TEXT,
    "egfr" TEXT,
    "otherRelevantMedicationOrCondition" TEXT,
    "pregnancyStatus" "ImagingPregnancyStatus" NOT NULL DEFAULT 'NotApplicable',
    "implantedMedicalDevice" BOOLEAN NOT NULL DEFAULT false,
    "deviceImplantDetails" TEXT,
    "metallicForeignBody" "ImagingMetallicForeignBody" NOT NULL DEFAULT 'No',
    "otherSafetyConsiderations" TEXT,
    "preparation" "ImagingPreparation"[] DEFAULT ARRAY[]::"ImagingPreparation"[],
    "preparationInstructions" TEXT,
    "priority" "ImagingPriority" NOT NULL DEFAULT 'Routine',
    "reasonForUrgency" TEXT,
    "clinicianName" TEXT,
    "clinicianDepartment" TEXT,
    "clinicianLicenseNo" TEXT,
    "clinicianContact" TEXT,
    "examinationPerformed" BOOLEAN NOT NULL DEFAULT false,
    "performedModality" TEXT,
    "performedProtocol" TEXT,
    "performedContrast" "ImagingPerformedContrast" NOT NULL DEFAULT 'None',
    "technologistName" TEXT,
    "radiologistName" TEXT,
    "performedAt" TIMESTAMP(3),
    "imageQuality" "ImagingImageQuality",
    "findings" TEXT,
    "impression" TEXT,
    "recommendation" TEXT,
    "reportDate" TIMESTAMP(3),
    "status" "ImagingStatus" NOT NULL DEFAULT 'Ordered',
    "orderedBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" INTEGER,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" INTEGER,
    "deletionReason" TEXT,

    CONSTRAINT "ImagingOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HospitalAdmission" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "hospitalPatientId" TEXT,
    "referralId" INTEGER,
    "referredFrom" "AdmissionReferredFrom",
    "referredFromOther" TEXT,
    "referringClinician" TEXT,
    "diagnosisAtReferral" TEXT,
    "referralReason" "AdmissionReferralReason",
    "referralReasonOther" TEXT,
    "admissionDate" TIMESTAMP(3) NOT NULL,
    "dischargeDate" TIMESTAMP(3),
    "bedNumber" TEXT NOT NULL,
    "ward" TEXT NOT NULL,
    "admittingPhysician" TEXT NOT NULL,
    "careTeam" TEXT NOT NULL,
    "primaryDiagnosis" TEXT NOT NULL,
    "secondaryDiagnoses" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "diseaseStage" "DiseaseStageAdmission" NOT NULL,
    "comorbidities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "estimatedPrognosis" "Prognosis" NOT NULL,
    "ppsScore" INTEGER NOT NULL,
    "kpsScore" INTEGER,
    "functionalStatus" "AdmissionFunctionalStatus" NOT NULL,
    "painScore" INTEGER NOT NULL,
    "painType" "AdmissionPainType" NOT NULL,
    "symptomsPresent" "AdmissionSymptom"[] DEFAULT ARRAY[]::"AdmissionSymptom"[],
    "symptomsPresentOther" TEXT,
    "emotionalStatus" "AdmissionEmotionalStatus" NOT NULL,
    "familySupport" "AdmissionFamilySupport" NOT NULL,
    "socialChallenges" TEXT,
    "spiritualConcerns" BOOLEAN NOT NULL,
    "spiritualNeedsDescription" TEXT,
    "spiritualSupportPreferred" "AdmissionSpiritualSupport",
    "spiritualSupportPreferredOther" TEXT,
    "painManagementPlan" TEXT NOT NULL,
    "medicationPlan" TEXT NOT NULL,
    "nursingCarePlan" TEXT NOT NULL,
    "homeBasedCareRequired" BOOLEAN NOT NULL,
    "psychosocialSupportPlan" TEXT,
    "physiotherapyRequired" BOOLEAN NOT NULL,
    "admittedToHospiceUnit" BOOLEAN NOT NULL DEFAULT true,
    "dischargeReason" "AdmissionDischargeReason",
    "status" "AdmissionStatus" NOT NULL DEFAULT 'Active',
    "createdBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" INTEGER,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" INTEGER,
    "deletionReason" TEXT,

    CONSTRAINT "HospitalAdmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeVisit" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "visitDate" TIMESTAMP(3) NOT NULL,
    "timeStarted" TEXT NOT NULL,
    "timeEnded" TEXT NOT NULL,
    "visitType" "VisitType" NOT NULL,
    "overallStatus" "VisitOverallStatus" NOT NULL,
    "mobility" "VisitMobility" NOT NULL,
    "temperature" TEXT,
    "pulse" TEXT,
    "bloodPressure" TEXT,
    "respiration" TEXT,
    "spO2" TEXT,
    "painPresent" BOOLEAN,
    "painScore" INTEGER NOT NULL,
    "painLocation" "VisitPainLocation"[] DEFAULT ARRAY[]::"VisitPainLocation"[],
    "painLocationOther" TEXT,
    "painCharacteristics" "VisitPainCharacteristic"[] DEFAULT ARRAY[]::"VisitPainCharacteristic"[],
    "currentPainMedication" BOOLEAN,
    "painMedicationEffective" BOOLEAN NOT NULL,
    "painManagementIneffectiveReason" TEXT,
    "symptoms" "VisitSymptom"[] DEFAULT ARRAY[]::"VisitSymptom"[],
    "symptomsOther" TEXT,
    "feeding" "ActivityOfDailyLivingStatus" NOT NULL,
    "bathing" "ActivityOfDailyLivingStatus" NOT NULL,
    "dressing" "ActivityOfDailyLivingStatus" NOT NULL,
    "toileting" "ActivityOfDailyLivingStatus" NOT NULL,
    "Mobility" "ActivityOfDailyLivingStatus" NOT NULL,
    "ppsScore" INTEGER NOT NULL,
    "kpsScore" INTEGER NOT NULL,
    "appetite" "VisitAppetite" NOT NULL,
    "oralIntake" "VisitOralIntake" NOT NULL,
    "hydrationStatus" "VisitHydrationStatus" NOT NULL,
    "nutritionComments" TEXT,
    "emotionalStatus" "VisitEmotionalStatus" NOT NULL,
    "emotionalComments" TEXT,
    "familySupport" "VisitFamilySupport" NOT NULL,
    "financialDifficulty" BOOLEAN NOT NULL,
    "financialComments" TEXT,
    "spiritualNeeds" BOOLEAN NOT NULL,
    "spiritualNeedsDescription" TEXT,
    "religiousSupportRequested" BOOLEAN NOT NULL,
    "religiousSupportSpecify" TEXT,
    "medicationAvailable" BOOLEAN NOT NULL,
    "medicationCorrectlyTaken" BOOLEAN NOT NULL,
    "medicationSideEffects" BOOLEAN NOT NULL,
    "medicationRefillNeeded" BOOLEAN NOT NULL,
    "morphineAvailable" BOOLEAN DEFAULT true,
    "adherenceLevel" "VisitAdherenceLevel" NOT NULL,
    "medicationIssues" TEXT,
    "primaryCaregiver" TEXT,
    "caregiverBurden" "VisitCaregiverBurden" NOT NULL,
    "caregiverUnderstanding" "VisitCaregiverUnderstanding" NOT NULL,
    "caregivingCapacity" "VisitCaregivingCapacity" NOT NULL,
    "familyEmotionalStatus" "VisitFamilyEmotionalStatus" NOT NULL,
    "educationProvided" "VisitEducationProvided"[] DEFAULT ARRAY[]::"VisitEducationProvided"[],
    "educationProvidedOther" TEXT,
    "trainingNeeds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "additionalSupportNeeded" BOOLEAN,
    "additionalSupportSpecify" TEXT,
    "homeCondition" "VisitHomeCondition" NOT NULL,
    "homeObservations" "VisitHomeObservation"[] DEFAULT ARRAY[]::"VisitHomeObservation"[],
    "homeEnvironmentDetails" TEXT,
    "nursingCareGiven" "VisitNursingCare"[] DEFAULT ARRAY[]::"VisitNursingCare"[],
    "nursingCareOther" TEXT,
    "redFlags" "VisitRedFlag"[] DEFAULT ARRAY[]::"VisitRedFlag"[],
    "redFlagActions" TEXT,
    "referralsMade" "VisitReferralMade"[] DEFAULT ARRAY[]::"VisitReferralMade"[],
    "keyIssues" TEXT,
    "immediateActions" TEXT,
    "followUpPlan" TEXT,
    "nextVisitDate" TIMESTAMP(3),
    "outcome" "VisitOutcome" NOT NULL,
    "dateOfDeath" TIMESTAMP(3),
    "createdBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" INTEGER,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" INTEGER,
    "deletionReason" TEXT,

    CONSTRAINT "HomeVisit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeVisitSignature" (
    "id" SERIAL NOT NULL,
    "homeVisitId" INTEGER NOT NULL,
    "staffId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "role" "VisitTeamRole" NOT NULL,
    "isTeamLeader" BOOLEAN NOT NULL DEFAULT false,
    "signedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HomeVisitSignature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeVisitMedication" (
    "id" SERIAL NOT NULL,
    "homeVisitId" INTEGER NOT NULL,
    "name" TEXT,
    "dosage" TEXT,
    "frequency" TEXT,
    "route" TEXT,

    CONSTRAINT "HomeVisitMedication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DischargeSummary" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "admissionId" INTEGER,
    "hospitalName" TEXT NOT NULL DEFAULT '',
    "palliativeCareUnit" TEXT NOT NULL DEFAULT '',
    "dateOfAdmission" TEXT,
    "dateOfDischarge" TEXT NOT NULL,
    "timeOfDischarge" TEXT,
    "dischargeType" "DischargeType",
    "dischargeTypeOther" TEXT,
    "finalDischargeDiagnosis" TEXT,
    "clinicalProblemsManaged" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "summaryOfClinicalCourse" TEXT,
    "importantInvestigations" TEXT,
    "overallCondition" "DischargeOverallCondition",
    "levelOfConsciousness" "DischargeConsciousness",
    "functionalStatus" "DischargeFunctionalStatus",
    "mobility" "DischargeMobility",
    "oralIntake" "DischargeOralIntake",
    "temperature" TEXT,
    "pulse" TEXT,
    "respiratoryRate" TEXT,
    "bloodPressure" TEXT,
    "oxygenSaturation" TEXT,
    "oxygenRequirement" TEXT,
    "pain" "ProgressNoteDistress",
    "painNote" TEXT,
    "shortnessOfBreath" "ProgressNoteDistress",
    "shortnessOfBreathNote" TEXT,
    "nausea" "ProgressNoteDistress",
    "nauseaNote" TEXT,
    "vomiting" "ProgressNoteDistress",
    "vomitingNote" TEXT,
    "constipation" "ProgressNoteDistress",
    "constipationNote" TEXT,
    "fatigue" "ProgressNoteDistress",
    "fatigueNote" TEXT,
    "anxiety" "ProgressNoteDistress",
    "anxietyNote" TEXT,
    "delirium" "ProgressNoteDistress",
    "deliriumNote" TEXT,
    "appetiteLoss" "ProgressNoteDistress",
    "appetiteLossNote" TEXT,
    "other" "ProgressNoteDistress",
    "otherNote" TEXT,
    "painScore" TEXT,
    "painControl" "DischargePainControl",
    "prnMedications" TEXT,
    "medicationChanges" TEXT,
    "medicationReconciliationCompleted" "DischargeFeedingAssistance",
    "painManagementInstructions" TEXT,
    "breathlessnessManagement" TEXT,
    "nauseaVomitingManagement" TEXT,
    "constipationManagement" TEXT,
    "anxietyAgitationDeliriumManagement" TEXT,
    "otherSymptomManagement" TEXT,
    "diet" "DischargeDiet",
    "dietOther" TEXT,
    "feedingAssistance" "DischargeFeedingAssistance",
    "enteralFeeding" "DischargeFeedingAssistance",
    "feedingTube" "DischargeFeedingTube",
    "feedingTubeOther" TEXT,
    "hydrationInstructions" TEXT,
    "nutritionDietitianFollowUp" "DischargeFeedingAssistance",
    "woundPresent" "DischargeFeedingAssistance",
    "woundLocation" TEXT,
    "woundCareInstructions" TEXT,
    "dressingChanges" TEXT,
    "pressureInjuryPrevention" TEXT,
    "oxygenRequired" "DischargeFeedingAssistance",
    "oxygenDeliveryMethod" "DischargeOxygenDelivery",
    "oxygenDeliveryMethodOther" TEXT,
    "oxygenFlowRate" TEXT,
    "equipmentRequired" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "equipmentOther" TEXT,
    "equipmentArranged" "DischargeFeedingAssistance",
    "currentGoalsOfCare" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "currentGoalsOfCareOther" TEXT,
    "goalsOfCareReviewed" "DischargeFeedingAssistance",
    "patientDecisionMakerPreferences" TEXT,
    "codeStatus" "DischargeCodeStatus",
    "codeStatusOther" TEXT,
    "advanceCarePlan" "DischargeAdvanceCarePlan",
    "dischargedTo" "DischargeDestination",
    "dischargedToOther" TEXT,
    "destinationAddress" TEXT,
    "transport" "DischargeTransport",
    "transportOther" TEXT,
    "escortCaregiver" TEXT,
    "homePalliativeCareRequired" "DischargeFeedingAssistance",
    "hospiceReferral" "DischargeHospiceReferral",
    "communityNursingRequired" "DischargeFeedingAssistance",
    "homeVisitsRequired" "DischargeFeedingAssistance",
    "caregiverSupportRequired" "DischargeFeedingAssistance",
    "servicesArranged" TEXT,
    "responsibleProvider" TEXT,
    "responsibleProviderPhone" TEXT,
    "educationTopics" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "educationOther" TEXT,
    "patientUnderstanding" "DischargePatientUnderstanding",
    "additionalEducationRequired" TEXT,
    "warningSigns" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "warningSignsOther" TEXT,
    "warningSignsSpecificInstructions" TEXT,
    "palliativeCareFollowUp" "DischargeFeedingAssistance",
    "palliativeCareFollowUpDate" TEXT,
    "palliativeCareFollowUpTime" TEXT,
    "physicianSpecialistFollowUp" TEXT,
    "primaryCareFollowUp" TEXT,
    "hospiceHomeCareFollowUp" TEXT,
    "otherAppointments" TEXT,
    "palliativeCareUnitContact" TEXT,
    "palliativeCareUnitPhone" TEXT,
    "attendingClinician" TEXT,
    "attendingClinicianPhone" TEXT,
    "emergencyContactInfo" TEXT,
    "homeHospiceService" TEXT,
    "homeHospiceServicePhone" TEXT,
    "dischargeNotes" TEXT,
    "status" "DischargeStatus" NOT NULL DEFAULT 'Final',
    "createdBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" INTEGER,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" INTEGER,
    "deletionReason" TEXT,

    CONSTRAINT "DischargeSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DischargeMedication" (
    "id" SERIAL NOT NULL,
    "dischargeSummaryId" INTEGER NOT NULL,
    "medication" TEXT DEFAULT '',
    "dose" TEXT DEFAULT '',
    "route" TEXT DEFAULT '',
    "frequency" TEXT DEFAULT '',
    "purpose" TEXT DEFAULT '',
    "instructions" TEXT DEFAULT '',

    CONSTRAINT "DischargeMedication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientProgressNote" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "admissionId" INTEGER,
    "attendingClinician" TEXT NOT NULL,
    "palliativeCareUnit" TEXT,
    "generalCondition" "ProgressNoteGeneralCondition",
    "levelOfConsciousness" "ProgressNoteConsciousness",
    "orientation" "ProgressNoteOrientation",
    "functionalStatus" "ProgressNoteFunctionalStatus",
    "changesSincePreviousReview" TEXT DEFAULT '',
    "temperature" TEXT,
    "pulse" TEXT,
    "respiratoryRate" TEXT,
    "bloodPressure" TEXT,
    "oxygenFlow" TEXT,
    "spO2" TEXT,
    "otherRelevantObservations" TEXT DEFAULT '',
    "pain" "ProgressNoteDistress",
    "painNote" TEXT,
    "shortnessOfBreath" "ProgressNoteDistress",
    "shortnessOfBreathNote" TEXT,
    "nausea" "ProgressNoteDistress",
    "nauseaNote" TEXT,
    "vomiting" "ProgressNoteDistress",
    "vomitingNote" TEXT,
    "constipation" "ProgressNoteDistress",
    "constipationNote" TEXT,
    "diarrhea" "ProgressNoteDistress",
    "diarrheaNote" TEXT,
    "fatigue" "ProgressNoteDistress",
    "fatigueNote" TEXT,
    "anxiety" "ProgressNoteDistress",
    "anxietyNote" TEXT,
    "delirium" "ProgressNoteDistress",
    "deliriumNote" TEXT,
    "insomania" "ProgressNoteDistress",
    "insomaniaNote" TEXT,
    "appetiteLoss" "ProgressNoteDistress",
    "appetiteLossNote" TEXT,
    "other" "ProgressNoteDistress",
    "otherNote" TEXT,
    "painScore" TEXT DEFAULT '',
    "painLocation" TEXT DEFAULT '',
    "painCharacter" TEXT DEFAULT '',
    "currentPainManagement" TEXT DEFAULT '',
    "responseToTreatment" "ProgressNoteResponse",
    "breakthroughPainEpisodes" "DischargeFeedingAssistance",
    "breakthroughPainFrequency" TEXT DEFAULT '',
    "breathing" "ProgressNoteBreathing",
    "oxygenTherapy" "DischargeFeedingAssistance",
    "oxygenDelivery" "ProgressNoteOxygenDelivery",
    "oxygenDeliveryOther" TEXT DEFAULT '',
    "respiratorySecretions" "ProgressNoteSecretions",
    "cough" "DischargeFeedingAssistance",
    "otherRespiratoryFindings" TEXT DEFAULT '',
    "oralIntake" "ProgressNoteOralIntake",
    "diet" TEXT DEFAULT '',
    "fluidIntake" TEXT DEFAULT '',
    "feedingAssistance" "DischargeFeedingAssistance",
    "enteralFeeding" "DischargeFeedingAssistance",
    "ivFluids" "DischargeFeedingAssistance",
    "nauseaVomitingAffectingIntake" "DischargeFeedingAssistance",
    "nutritionHydrationConcerns" TEXT DEFAULT '',
    "urineOutput" "ProgressNoteUrineOutput",
    "urinaryCatheter" "DischargeFeedingAssistance",
    "bowelMovement" "ProgressNoteBowelMovement",
    "lastBowelMovement" TEXT DEFAULT '',
    "otherEliminationConcerns" TEXT DEFAULT '',
    "skin" "ProgressNoteSkin",
    "skinOther" TEXT DEFAULT '',
    "pressureInjury" "DischargeFeedingAssistance",
    "pressureInjuryLocationStage" TEXT DEFAULT '',
    "woundCareProvided" "DischargeFeedingAssistance",
    "woundPressureInjuryChanges" TEXT DEFAULT '',
    "moodBehavior" "ProgressNoteMoodBehavior"[] DEFAULT ARRAY[]::"ProgressNoteMoodBehavior"[],
    "psychologicalDistress" "ProgressNoteDistress",
    "patientsMainConcernsToday" TEXT DEFAULT '',
    "counselingPsychologicalSupportProvided" "DischargeFeedingAssistance",
    "spiritualDistressIdentified" "DischargeFeedingAssistance",
    "patientsSpiritualCulturalConcerns" TEXT DEFAULT '',
    "spiritualCareProvided" "DischargeFeedingAssistance",
    "spiritualReferralRequired" "DischargeFeedingAssistance",
    "spiritualNotes" TEXT DEFAULT '',
    "familyCaregiverPresent" "DischargeFeedingAssistance",
    "familyCaregiverConcerns" TEXT DEFAULT '',
    "familyEducationSupportProvided" TEXT DEFAULT '',
    "familyMeetingHeld" "DischargeFeedingAssistance",
    "familyMeetingParticipants" TEXT DEFAULT '',
    "currentGoalsOfCare" "ProgressNoteGoalsOfCare"[] DEFAULT ARRAY[]::"ProgressNoteGoalsOfCare"[],
    "currentGoalsOfCareOther" TEXT DEFAULT '',
    "goalsReviewedToday" "DischargeFeedingAssistance",
    "changeInGoalsIdentified" "DischargeFeedingAssistance",
    "patientDecisionMakerPreferences" TEXT DEFAULT '',
    "codeStatus" "DischargeCodeStatus",
    "codeStatusOther" TEXT DEFAULT '',
    "advanceCarePlanReviewed" "DischargeFeedingAssistance",
    "currentMedicationRegimenReviewed" "DischargeFeedingAssistance",
    "changesMade" "DischargeFeedingAssistance",
    "prnBreakthroughMedicationUsed" "DischargeFeedingAssistance",
    "prnEffectiveness" "ProgressNotePRNEffectiveness",
    "medicationSideEffects" TEXT DEFAULT 'None',
    "medicationSideEffectsDetail" TEXT DEFAULT '',
    "nursingSupportiveCareProvided" "ProgressNoteNursingCare"[] DEFAULT ARRAY[]::"ProgressNoteNursingCare"[],
    "nursingSupportiveCareOther" TEXT DEFAULT '',
    "responseToSupportiveCare" TEXT DEFAULT '',
    "investigationsPerformedReviewed" "ProgressNoteInvestigation"[] DEFAULT ARRAY[]::"ProgressNoteInvestigation"[],
    "investigationsPerformedReviewedOther" TEXT DEFAULT '',
    "significantResults" TEXT DEFAULT '',
    "clinicalSignificanceActionTaken" TEXT DEFAULT '',
    "overallAssessment" TEXT DEFAULT '',
    "problemsIdentifiedToday" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "symptomManagementPlan" TEXT DEFAULT '',
    "medicationPlan" TEXT DEFAULT '',
    "nursingSupportiveCarePlan" TEXT DEFAULT '',
    "investigationsMonitoring" TEXT DEFAULT '',
    "familyCaregiverPlan" TEXT DEFAULT '',
    "referralsConsultations" TEXT DEFAULT '',
    "dischargeTransferHospicePlanning" TEXT DEFAULT '',
    "soapSubjective" TEXT DEFAULT '',
    "soapObjective" TEXT DEFAULT '',
    "soapAssessment" TEXT DEFAULT '',
    "soapPlan" TEXT DEFAULT '',
    "responsibleClinicianId" INTEGER NOT NULL,
    "facilityStamp" TEXT DEFAULT '',
    "createdBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" INTEGER,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" INTEGER,
    "deletionReason" TEXT,

    CONSTRAINT "PatientProgressNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgressNoteMedication" (
    "id" SERIAL NOT NULL,
    "progressNoteId" INTEGER NOT NULL,
    "medicationTreatment" TEXT DEFAULT '',
    "dose" TEXT DEFAULT '',
    "route" TEXT DEFAULT '',
    "frequency" TEXT DEFAULT '',
    "reasonResponse" TEXT DEFAULT '',

    CONSTRAINT "ProgressNoteMedication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgressNoteSignature" (
    "id" SERIAL NOT NULL,
    "progressNoteId" INTEGER NOT NULL,
    "staffId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "role" "ProgressNoteSignatureRole" NOT NULL,
    "signedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProgressNoteSignature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgressNoteMDTReview" (
    "id" SERIAL NOT NULL,
    "progressNoteId" INTEGER NOT NULL,
    "discipline" TEXT DEFAULT '',
    "reviewIntervention" TEXT DEFAULT '',
    "followUpRequired" "DischargeFeedingAssistance",

    CONSTRAINT "ProgressNoteMDTReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgressNoteAdditionalNote" (
    "id" SERIAL NOT NULL,
    "progressNoteId" INTEGER NOT NULL,
    "date" TEXT DEFAULT '',
    "time" TEXT DEFAULT '',
    "note" TEXT DEFAULT '',
    "clinicianName" TEXT DEFAULT '',

    CONSTRAINT "ProgressNoteAdditionalNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HospiceNursingAssessment" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "assessmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assessedByStaffId" INTEGER,
    "levelOfConsciousness" "HospiceConsciousness",
    "orientation" "HospiceOrientation"[] DEFAULT ARRAY[]::"HospiceOrientation"[],
    "generalAppearance" "HospiceGeneralAppearance"[] DEFAULT ARRAY[]::"HospiceGeneralAppearance"[],
    "bloodPressure" TEXT,
    "pulseRate" DOUBLE PRECISION,
    "respiratoryRate" DOUBLE PRECISION,
    "temperature" DOUBLE PRECISION,
    "oxygenSaturation" DOUBLE PRECISION,
    "weightKg" DOUBLE PRECISION,
    "heightCm" DOUBLE PRECISION,
    "painPresent" BOOLEAN,
    "painScore" INTEGER,
    "painLocation" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "painLocationOther" TEXT,
    "painCharacteristics" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "painReliefMeasures" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "painReliefOther" TEXT,
    "breathingPattern" "HospiceBreathingPattern",
    "dyspneaSeverity" "HospiceDyspneaSeverity",
    "oxygenTherapy" BOOLEAN,
    "oxygenFlowRate" TEXT,
    "cough" "HospiceCoughType",
    "sputumColor" "HospiceSputumColor",
    "respiratoryNotes" TEXT,
    "pulseRhythm" "HospicePulseRhythm",
    "peripheralEdema" "HospiceEdemaSeverity",
    "edemaLocation" TEXT,
    "skinColor" "HospiceSkinColor",
    "appetite" "HospiceAppetite",
    "nausea" "HospiceNauseaSeverity",
    "vomiting" BOOLEAN,
    "vomitingFrequency" TEXT,
    "bowelFunction" "HospiceBowelFunction",
    "lastBowelMovement" TIMESTAMP(3),
    "urinaryFunction" "HospiceUrinaryFunction",
    "urineAppearance" "HospiceUrineAppearance",
    "skinIntegrity" "HospiceSkinIntegrity",
    "pressureInjuryRisk" "HospicePressureInjuryRisk",
    "pressureUlcerPresent" BOOLEAN,
    "pressureUlcerLocation" TEXT,
    "pressureUlcerStage" "HospicePressureUlcerStage",
    "mobilityStatus" "HospiceMobilityStatus",
    "fallRisk" "HospiceFallRisk",
    "assistiveDevices" "HospiceAssistiveDevice"[] DEFAULT ARRAY[]::"HospiceAssistiveDevice"[],
    "assistiveDevicesOther" TEXT,
    "feeding" "ADL",
    "bathing" "ADL",
    "dressing" "ADL",
    "toileting" "ADL",
    "mobility" "ADL",
    "emotionalStatus" "HospiceEmotionalStatus",
    "communicationAbility" "HospiceCommunicationAbility",
    "cognitiveStatus" "HospiceCognitiveStatus",
    "primaryCaregiverName" TEXT,
    "primaryCaregiverRelationship" TEXT,
    "primaryCaregiverPhone" TEXT,
    "familySupport" "HospiceFamilySupport",
    "caregiverStressLevel" "HospiceCaregiverStress",
    "spiritualSupportRequested" BOOLEAN,
    "religiousAffiliation" "HospiceReligiousAffiliation",
    "religiousAffiliationOther" TEXT,
    "culturalConsiderations" TEXT,
    "nursingDiagnoses" "HospiceNursingDiagnosis"[] DEFAULT ARRAY[]::"HospiceNursingDiagnosis"[],
    "nursingDiagnosesOther" TEXT,
    "nurseSummary" TEXT,
    "createdBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" INTEGER,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" INTEGER,
    "deletionReason" TEXT,
    "hospitalAdmissionId" INTEGER,

    CONSTRAINT "HospiceNursingAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_email_key" ON "Staff"("email");

-- CreateIndex
CREATE INDEX "Staff_status_idx" ON "Staff"("status");

-- CreateIndex
CREATE INDEX "Staff_isEmailVerified_idx" ON "Staff"("isEmailVerified");

-- CreateIndex
CREATE INDEX "Staff_emailVerificationOtpExpires_idx" ON "Staff"("emailVerificationOtpExpires");

-- CreateIndex
CREATE INDEX "Staff_role_idx" ON "Staff"("role");

-- CreateIndex
CREATE INDEX "Staff_deletedAt_idx" ON "Staff"("deletedAt");

-- CreateIndex
CREATE INDEX "Patient_status_idx" ON "Patient"("status");

-- CreateIndex
CREATE INDEX "Patient_currentLocation_idx" ON "Patient"("currentLocation");

-- CreateIndex
CREATE INDEX "Patient_registeredBy_idx" ON "Patient"("registeredBy");

-- CreateIndex
CREATE INDEX "Medication_patientId_idx" ON "Medication"("patientId");

-- CreateIndex
CREATE INDEX "Medication_createdAt_idx" ON "Medication"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_read_idx" ON "Notification"("read");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "Referral_patientId_idx" ON "Referral"("patientId");

-- CreateIndex
CREATE INDEX "Referral_status_idx" ON "Referral"("status");

-- CreateIndex
CREATE INDEX "Referral_createdAt_idx" ON "Referral"("createdAt");

-- CreateIndex
CREATE INDEX "Referral_requestedBy_idx" ON "Referral"("requestedBy");

-- CreateIndex
CREATE INDEX "LaboratoryTest_patientId_dateOrdered_idx" ON "LaboratoryTest"("patientId", "dateOrdered");

-- CreateIndex
CREATE INDEX "LaboratoryTest_patientId_status_idx" ON "LaboratoryTest"("patientId", "status");

-- CreateIndex
CREATE INDEX "LaboratoryTest_status_idx" ON "LaboratoryTest"("status");

-- CreateIndex
CREATE INDEX "LaboratoryTest_priority_idx" ON "LaboratoryTest"("priority");

-- CreateIndex
CREATE INDEX "LaboratoryTest_category_idx" ON "LaboratoryTest"("category");

-- CreateIndex
CREATE INDEX "LaboratoryTest_testName_idx" ON "LaboratoryTest"("testName");

-- CreateIndex
CREATE INDEX "LaboratoryTest_dateOfRequest_idx" ON "LaboratoryTest"("dateOfRequest");

-- CreateIndex
CREATE UNIQUE INDEX "LabResult_labTestOrderId_key" ON "LabResult"("labTestOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "LabResult_reportNumber_key" ON "LabResult"("reportNumber");

-- CreateIndex
CREATE INDEX "LabResult_reportedAt_idx" ON "LabResult"("reportedAt");

-- CreateIndex
CREATE INDEX "ImagingOrder_patientId_idx" ON "ImagingOrder"("patientId");

-- CreateIndex
CREATE INDEX "ImagingOrder_status_idx" ON "ImagingOrder"("status");

-- CreateIndex
CREATE INDEX "ImagingOrder_modality_idx" ON "ImagingOrder"("modality");

-- CreateIndex
CREATE INDEX "ImagingOrder_priority_idx" ON "ImagingOrder"("priority");

-- CreateIndex
CREATE INDEX "ImagingOrder_createdAt_idx" ON "ImagingOrder"("createdAt");

-- CreateIndex
CREATE INDEX "HospitalAdmission_patientId_idx" ON "HospitalAdmission"("patientId");

-- CreateIndex
CREATE INDEX "HospitalAdmission_status_idx" ON "HospitalAdmission"("status");

-- CreateIndex
CREATE INDEX "HospitalAdmission_admissionDate_idx" ON "HospitalAdmission"("admissionDate");

-- CreateIndex
CREATE INDEX "HospitalAdmission_referralId_idx" ON "HospitalAdmission"("referralId");

-- CreateIndex
CREATE INDEX "HospitalAdmission_bedNumber_status_idx" ON "HospitalAdmission"("bedNumber", "status");

-- CreateIndex
CREATE INDEX "HomeVisit_patientId_idx" ON "HomeVisit"("patientId");

-- CreateIndex
CREATE INDEX "HomeVisit_visitDate_idx" ON "HomeVisit"("visitDate");

-- CreateIndex
CREATE INDEX "HomeVisit_outcome_idx" ON "HomeVisit"("outcome");

-- CreateIndex
CREATE INDEX "HomeVisit_redFlags_idx" ON "HomeVisit"("redFlags");

-- CreateIndex
CREATE INDEX "HomeVisit_nextVisitDate_idx" ON "HomeVisit"("nextVisitDate");

-- CreateIndex
CREATE INDEX "HomeVisitSignature_homeVisitId_idx" ON "HomeVisitSignature"("homeVisitId");

-- CreateIndex
CREATE INDEX "HomeVisitSignature_staffId_idx" ON "HomeVisitSignature"("staffId");

-- CreateIndex
CREATE INDEX "HomeVisitSignature_homeVisitId_isTeamLeader_idx" ON "HomeVisitSignature"("homeVisitId", "isTeamLeader");

-- CreateIndex
CREATE INDEX "HomeVisitMedication_homeVisitId_idx" ON "HomeVisitMedication"("homeVisitId");

-- CreateIndex
CREATE INDEX "DischargeSummary_patientId_idx" ON "DischargeSummary"("patientId");

-- CreateIndex
CREATE INDEX "DischargeSummary_admissionId_idx" ON "DischargeSummary"("admissionId");

-- CreateIndex
CREATE INDEX "DischargeSummary_dateOfDischarge_idx" ON "DischargeSummary"("dateOfDischarge");

-- CreateIndex
CREATE INDEX "DischargeSummary_status_idx" ON "DischargeSummary"("status");

-- CreateIndex
CREATE INDEX "DischargeSummary_createdBy_idx" ON "DischargeSummary"("createdBy");

-- CreateIndex
CREATE INDEX "DischargeMedication_dischargeSummaryId_idx" ON "DischargeMedication"("dischargeSummaryId");

-- CreateIndex
CREATE INDEX "PatientProgressNote_patientId_createdAt_idx" ON "PatientProgressNote"("patientId", "createdAt");

-- CreateIndex
CREATE INDEX "PatientProgressNote_admissionId_createdAt_idx" ON "PatientProgressNote"("admissionId", "createdAt");

-- CreateIndex
CREATE INDEX "PatientProgressNote_createdBy_idx" ON "PatientProgressNote"("createdBy");

-- CreateIndex
CREATE INDEX "PatientProgressNote_responsibleClinicianId_idx" ON "PatientProgressNote"("responsibleClinicianId");

-- CreateIndex
CREATE INDEX "ProgressNoteMedication_progressNoteId_idx" ON "ProgressNoteMedication"("progressNoteId");

-- CreateIndex
CREATE INDEX "ProgressNoteSignature_progressNoteId_idx" ON "ProgressNoteSignature"("progressNoteId");

-- CreateIndex
CREATE INDEX "ProgressNoteSignature_staffId_idx" ON "ProgressNoteSignature"("staffId");

-- CreateIndex
CREATE INDEX "ProgressNoteMDTReview_progressNoteId_idx" ON "ProgressNoteMDTReview"("progressNoteId");

-- CreateIndex
CREATE INDEX "ProgressNoteAdditionalNote_progressNoteId_idx" ON "ProgressNoteAdditionalNote"("progressNoteId");

-- CreateIndex
CREATE INDEX "HospiceNursingAssessment_patientId_assessmentDate_idx" ON "HospiceNursingAssessment"("patientId", "assessmentDate");

-- CreateIndex
CREATE INDEX "HospiceNursingAssessment_createdBy_idx" ON "HospiceNursingAssessment"("createdBy");

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_registeredBy_fkey" FOREIGN KEY ("registeredBy") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medication" ADD CONSTRAINT "Medication_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medication" ADD CONSTRAINT "Medication_prescribedBy_fkey" FOREIGN KEY ("prescribedBy") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medication" ADD CONSTRAINT "Medication_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medication" ADD CONSTRAINT "Medication_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_requestedBy_fkey" FOREIGN KEY ("requestedBy") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaboratoryTest" ADD CONSTRAINT "LaboratoryTest_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaboratoryTest" ADD CONSTRAINT "LaboratoryTest_orderedBy_fkey" FOREIGN KEY ("orderedBy") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaboratoryTest" ADD CONSTRAINT "LaboratoryTest_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaboratoryTest" ADD CONSTRAINT "LaboratoryTest_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaboratoryTest" ADD CONSTRAINT "LaboratoryTest_hospitalAdmissionId_fkey" FOREIGN KEY ("hospitalAdmissionId") REFERENCES "HospitalAdmission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabResult" ADD CONSTRAINT "LabResult_labTestOrderId_fkey" FOREIGN KEY ("labTestOrderId") REFERENCES "LaboratoryTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabResult" ADD CONSTRAINT "LabResult_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImagingOrder" ADD CONSTRAINT "ImagingOrder_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImagingOrder" ADD CONSTRAINT "ImagingOrder_orderedBy_fkey" FOREIGN KEY ("orderedBy") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImagingOrder" ADD CONSTRAINT "ImagingOrder_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImagingOrder" ADD CONSTRAINT "ImagingOrder_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HospitalAdmission" ADD CONSTRAINT "HospitalAdmission_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HospitalAdmission" ADD CONSTRAINT "HospitalAdmission_referralId_fkey" FOREIGN KEY ("referralId") REFERENCES "Referral"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HospitalAdmission" ADD CONSTRAINT "HospitalAdmission_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HospitalAdmission" ADD CONSTRAINT "HospitalAdmission_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HospitalAdmission" ADD CONSTRAINT "HospitalAdmission_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeVisit" ADD CONSTRAINT "HomeVisit_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeVisit" ADD CONSTRAINT "HomeVisit_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeVisit" ADD CONSTRAINT "HomeVisit_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeVisit" ADD CONSTRAINT "HomeVisit_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeVisitSignature" ADD CONSTRAINT "HomeVisitSignature_homeVisitId_fkey" FOREIGN KEY ("homeVisitId") REFERENCES "HomeVisit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeVisitSignature" ADD CONSTRAINT "HomeVisitSignature_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeVisitMedication" ADD CONSTRAINT "HomeVisitMedication_homeVisitId_fkey" FOREIGN KEY ("homeVisitId") REFERENCES "HomeVisit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DischargeSummary" ADD CONSTRAINT "DischargeSummary_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DischargeSummary" ADD CONSTRAINT "DischargeSummary_admissionId_fkey" FOREIGN KEY ("admissionId") REFERENCES "HospitalAdmission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DischargeSummary" ADD CONSTRAINT "DischargeSummary_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DischargeSummary" ADD CONSTRAINT "DischargeSummary_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DischargeSummary" ADD CONSTRAINT "DischargeSummary_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DischargeMedication" ADD CONSTRAINT "DischargeMedication_dischargeSummaryId_fkey" FOREIGN KEY ("dischargeSummaryId") REFERENCES "DischargeSummary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientProgressNote" ADD CONSTRAINT "PatientProgressNote_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientProgressNote" ADD CONSTRAINT "PatientProgressNote_admissionId_fkey" FOREIGN KEY ("admissionId") REFERENCES "HospitalAdmission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientProgressNote" ADD CONSTRAINT "PatientProgressNote_responsibleClinicianId_fkey" FOREIGN KEY ("responsibleClinicianId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientProgressNote" ADD CONSTRAINT "PatientProgressNote_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientProgressNote" ADD CONSTRAINT "PatientProgressNote_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientProgressNote" ADD CONSTRAINT "PatientProgressNote_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressNoteMedication" ADD CONSTRAINT "ProgressNoteMedication_progressNoteId_fkey" FOREIGN KEY ("progressNoteId") REFERENCES "PatientProgressNote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressNoteSignature" ADD CONSTRAINT "ProgressNoteSignature_progressNoteId_fkey" FOREIGN KEY ("progressNoteId") REFERENCES "PatientProgressNote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressNoteSignature" ADD CONSTRAINT "ProgressNoteSignature_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressNoteMDTReview" ADD CONSTRAINT "ProgressNoteMDTReview_progressNoteId_fkey" FOREIGN KEY ("progressNoteId") REFERENCES "PatientProgressNote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressNoteAdditionalNote" ADD CONSTRAINT "ProgressNoteAdditionalNote_progressNoteId_fkey" FOREIGN KEY ("progressNoteId") REFERENCES "PatientProgressNote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HospiceNursingAssessment" ADD CONSTRAINT "HospiceNursingAssessment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HospiceNursingAssessment" ADD CONSTRAINT "HospiceNursingAssessment_assessedByStaffId_fkey" FOREIGN KEY ("assessedByStaffId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HospiceNursingAssessment" ADD CONSTRAINT "HospiceNursingAssessment_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HospiceNursingAssessment" ADD CONSTRAINT "HospiceNursingAssessment_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HospiceNursingAssessment" ADD CONSTRAINT "HospiceNursingAssessment_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HospiceNursingAssessment" ADD CONSTRAINT "HospiceNursingAssessment_hospitalAdmissionId_fkey" FOREIGN KEY ("hospitalAdmissionId") REFERENCES "HospitalAdmission"("id") ON DELETE SET NULL ON UPDATE CASCADE;
