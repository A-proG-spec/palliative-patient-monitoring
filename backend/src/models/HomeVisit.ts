import mongoose, { Schema, Document } from 'mongoose';

export interface IHomeVisit extends Document {
  patientId: mongoose.Types.ObjectId;
  visitDate: Date;
  timeStarted: string;
  timeEnded: string;
  visitType: 'Routine' | 'Emergency' | 'FirstAssessment' | 'PostDischarge' | 'EndOfLife' | 'Bereavement';
  teamMembers: Array<{ staffId: mongoose.Types.ObjectId; role: 'TeamLeader' | 'Physician' | 'Nurse'; name: string }>;
  overallStatus: 'Stable' | 'Deteriorating' | 'Critical' | 'BedBound';
  mobility: 'Ambulatory' | 'RequiresAssistance' | 'Bedridden';
  vitals?: {
    temperature: number;
    pulse: number;
    bp: string;
    respiration: number;
    spo2: number;
  };
  painScore: number;
  painLocation: Array<'Head' | 'Neck' | 'Chest' | 'Abdomen' | 'Back' | 'Limbs' | 'Generalized' | 'Other'>;
  painCharacteristics: Array<'Sharp' | 'Dull' | 'Burning' | 'Cramping' | 'Intermittent' | 'Continuous'>;
  painMedicationEffective: boolean;
  symptoms: Array<'Dyspnea' | 'Nausea' | 'Constipation' | 'Anxiety' | 'Fatigue' | 'PoorAppetite' | 'PressureSores' | 'Other'>;
  adl: {
    feeding: 'Independent' | 'NeedsAssistance' | 'FullyDependent';
    bathing: 'Independent' | 'NeedsAssistance' | 'FullyDependent';
    dressing: 'Independent' | 'NeedsAssistance' | 'FullyDependent';
    toileting: 'Independent' | 'NeedsAssistance' | 'FullyDependent';
    mobility: 'Independent' | 'NeedsAssistance' | 'FullyDependent';
  };
  ppsScore: number;
  kpsScore: number;
  appetite: 'Good' | 'Fair' | 'Poor' | 'UnableToEat';
  oralIntake: 'Adequate' | 'Reduced' | 'Minimal';
  hydrationStatus: 'Adequate' | 'MildDehydration' | 'SevereDehydration';
  emotionalStatus: 'Stable' | 'Anxious' | 'Depressed' | 'Fearful' | 'Distressed';
  familySupport: 'Excellent' | 'Good' | 'Limited' | 'None';
  financialDifficulty: boolean;
  spiritualNeeds: boolean;
  religiousSupportRequested: boolean;
  medicationAvailable: boolean;
  medicationCorrectlyTaken: boolean;
  medicationSideEffects: boolean;
  medicationRefillNeeded: boolean;
  morphineAvailable: boolean;
  adherenceLevel: 'Good' | 'Partial' | 'Poor';
  currentMedications: Array<{ name: string; dosage: string; frequency: string; route: string }>;
  caregiverBurden: 'Low' | 'Moderate' | 'High';
  caregiverUnderstanding: 'Good' | 'Fair' | 'Poor';
  caregivingCapacity: 'Strong' | 'Moderate' | 'Weak';
  familyEmotionalStatus: 'Stable' | 'Stressed' | 'Overwhelmed';
  educationProvided: Array<'MedicationAdministration' | 'PainManagement' | 'NutritionSupport' | 'SkinCare' | 'PressureSorePrevention' | 'EndOfLifeCare' | 'EmergencySigns' | 'EmotionalSupport' | 'Other'>;
  homeCondition: 'Clean' | 'Fair' | 'Poor';
  homeObservations: Array<'AdequateLighting' | 'Ventilation' | 'SafeBed' | 'CleanWater' | 'SanitationIssues'>;
  nursingCareGiven: Array<'Hygiene' | 'WoundCare' | 'MedicationAdmin' | 'PositionChange' | 'FeedingAssistance' | 'Counseling' | 'Other'>;
  redFlags: Array<'SevereUncontrolledPain' | 'SevereShortnessOfBreath' | 'MassiveBleeding' | 'UncontrolledSeizures' | 'AlteredMentalStatus' | 'SevereDehydration' | 'None'>;
  redFlagActions?: string;
  referralsMade: Array<'PhysicianReview' | 'HospitalAdmission' | 'SocialWorker' | 'Psychologist' | 'SpiritualCare' | 'NutritionSupport'>;
  outcome: 'Stable' | 'SymptomsImproved' | 'SymptomsUnchanged' | 'SymptomsWorsened' | 'ReferredToFacility' | 'Deceased';
  nextVisitDate?: Date;
  teamLeaderId: mongoose.Types.ObjectId;
  physicianId: mongoose.Types.ObjectId;
  nurseId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const HomeVisitSchema = new Schema<IHomeVisit>({
  patientId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Patient', 
    required: true 
  },
  visitDate: { 
    type: Date, 
    required: true 
  },
  timeStarted: { 
    type: String, 
    required: true 
  },
  timeEnded: { 
    type: String, 
    required: true 
  },
  visitType: { 
    type: String, 
    enum: ['Routine', 'Emergency', 'FirstAssessment', 'PostDischarge', 'EndOfLife', 'Bereavement'],
    required: true 
  },
  teamMembers: [{
    staffId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Staff' 
    },
    role: { 
      type: String, 
      enum: ['TeamLeader', 'Physician', 'Nurse'] 
    },
    name: { 
      type: String 
    }
  }],
  overallStatus: { 
    type: String, 
    enum: ['Stable', 'Deteriorating', 'Critical', 'BedBound'],
    required: true 
  },
  mobility: { 
    type: String, 
    enum: ['Ambulatory', 'RequiresAssistance', 'Bedridden'],
    required: true 
  },
  vitals: {
    temperature: Number,
    pulse: Number,
    bp: String,
    respiration: Number,
    spo2: Number
  },
  painScore: { 
    type: Number, 
    min: 0, 
    max: 10, 
    required: true 
  },
  painLocation: [{ 
    type: String, 
    enum: ['Head', 'Neck', 'Chest', 'Abdomen', 'Back', 'Limbs', 'Generalized', 'Other'] 
  }],
  painCharacteristics: [{ 
    type: String, 
    enum: ['Sharp', 'Dull', 'Burning', 'Cramping', 'Intermittent', 'Continuous'] 
  }],
  painMedicationEffective: { 
    type: Boolean, 
    required: true 
  },
  symptoms: [{ 
    type: String, 
    enum: ['Dyspnea', 'Nausea', 'Constipation', 'Anxiety', 'Fatigue', 'PoorAppetite', 'PressureSores', 'Other'] 
  }],
  adl: {
    feeding: { 
      type: String, 
      enum: ['Independent', 'NeedsAssistance', 'FullyDependent'] 
    },
    bathing: { 
      type: String, 
      enum: ['Independent', 'NeedsAssistance', 'FullyDependent'] 
    },
    dressing: { 
      type: String, 
      enum: ['Independent', 'NeedsAssistance', 'FullyDependent'] 
    },
    toileting: { 
      type: String, 
      enum: ['Independent', 'NeedsAssistance', 'FullyDependent'] 
    },
    mobility: { 
      type: String, 
      enum: ['Independent', 'NeedsAssistance', 'FullyDependent'] 
    }
  },
  ppsScore: { 
    type: Number, 
    min: 0, 
    max: 100, 
    required: true 
  },
  kpsScore: { 
    type: Number, 
    min: 0, 
    max: 100, 
    required: true 
  },
  appetite: { 
    type: String, 
    enum: ['Good', 'Fair', 'Poor', 'UnableToEat'],
    required: true 
  },
  oralIntake: { 
    type: String, 
    enum: ['Adequate', 'Reduced', 'Minimal'],
    required: true 
  },
  hydrationStatus: { 
    type: String, 
    enum: ['Adequate', 'MildDehydration', 'SevereDehydration'],
    required: true 
  },
  emotionalStatus: { 
    type: String, 
    enum: ['Stable', 'Anxious', 'Depressed', 'Fearful', 'Distressed'],
    required: true 
  },
  familySupport: { 
    type: String, 
    enum: ['Excellent', 'Good', 'Limited', 'None'],
    required: true 
  },
  financialDifficulty: { 
    type: Boolean, 
    required: true 
  },
  spiritualNeeds: { 
    type: Boolean, 
    required: true 
  },
  religiousSupportRequested: { 
    type: Boolean, 
    required: true 
  },
  medicationAvailable: { 
    type: Boolean, 
    required: true 
  },
  medicationCorrectlyTaken: { 
    type: Boolean, 
    required: true 
  },
  medicationSideEffects: { 
    type: Boolean, 
    required: true 
  },
  medicationRefillNeeded: { 
    type: Boolean, 
    required: true 
  },
  morphineAvailable: { 
    type: Boolean, 
    required: true 
  },
  adherenceLevel: { 
    type: String, 
    enum: ['Good', 'Partial', 'Poor'],
    required: true 
  },
  currentMedications: [{
    name: String,
    dosage: String,
    frequency: String,
    route: String
  }],
  caregiverBurden: { 
    type: String, 
    enum: ['Low', 'Moderate', 'High'],
    required: true 
  },
  caregiverUnderstanding: { 
    type: String, 
    enum: ['Good', 'Fair', 'Poor'],
    required: true 
  },
  caregivingCapacity: { 
    type: String, 
    enum: ['Strong', 'Moderate', 'Weak'],
    required: true 
  },
  familyEmotionalStatus: { 
    type: String, 
    enum: ['Stable', 'Stressed', 'Overwhelmed'],
    required: true 
  },
  educationProvided: [{ 
    type: String, 
    enum: ['MedicationAdministration', 'PainManagement', 'NutritionSupport', 'SkinCare', 'PressureSorePrevention', 'EndOfLifeCare', 'EmergencySigns', 'EmotionalSupport', 'Other'] 
  }],
  homeCondition: { 
    type: String, 
    enum: ['Clean', 'Fair', 'Poor'],
    required: true 
  },
  homeObservations: [{ 
    type: String, 
    enum: ['AdequateLighting', 'Ventilation', 'SafeBed', 'CleanWater', 'SanitationIssues'] 
  }],
  nursingCareGiven: [{ 
    type: String, 
    enum: ['Hygiene', 'WoundCare', 'MedicationAdmin', 'PositionChange', 'FeedingAssistance', 'Counseling', 'Other'] 
  }],
  redFlags: [{ 
    type: String, 
    enum: ['SevereUncontrolledPain', 'SevereShortnessOfBreath', 'MassiveBleeding', 'UncontrolledSeizures', 'AlteredMentalStatus', 'SevereDehydration', 'None'] 
  }],
  redFlagActions: String,
  referralsMade: [{ 
    type: String, 
    enum: ['PhysicianReview', 'HospitalAdmission', 'SocialWorker', 'Psychologist', 'SpiritualCare', 'NutritionSupport'] 
  }],
  outcome: { 
    type: String, 
    enum: ['Stable', 'SymptomsImproved', 'SymptomsUnchanged', 'SymptomsWorsened', 'ReferredToFacility', 'Deceased'],
    required: true 
  },
  nextVisitDate: Date,
  teamLeaderId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Staff', 
    required: true 
  },
  physicianId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Staff', 
    required: true 
  },
  nurseId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Staff', 
    required: true 
  },
}, {
  timestamps: true
});

// Indexes
HomeVisitSchema.index({ patientId: 1 });
HomeVisitSchema.index({ visitDate: -1 });

export const HomeVisit = mongoose.model<IHomeVisit>('HomeVisit', HomeVisitSchema);
export default HomeVisit;