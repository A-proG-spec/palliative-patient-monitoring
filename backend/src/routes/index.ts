import { Router } from 'express';
import authRoutes from './auth.routes.js';
import adminRoutes from './admin.routes.js';
import patientRoutes from './patient.routes.js';
import visitRoutes from './visit.routes.js';
import medicationRoutes from './medication.routes.js';
import labRoutes from './lab.routes.js';
import imagingRoutes from './imaging.routes.js';
import referralRoutes from './referral.routes.js';
import admissionRoutes from './admission.routes.js';
import progressNoteRoutes from './progress-note.routes.js';
import dischargeRoutes from './discharge.routes.js';
import staffRoutes from './staff.routes.js';
import profileRoutes from './profile.routes.js';
import hospiceNursingRoutes from './hospice-nursing.routes.js';
import medicationQueueRoutes from './medication-queue.routes.js';
import labQueueRoutes from './lab-queue.routes.js';
import imagingQueueRoutes from './imaging-queue.routes.js';
import pharmacistAssessmentRoutes from './pharmacist-assessment.routes.js';
import physiotherapyAssessmentRoutes from './physiotherapy-assessment.routes.js';
import familyAssessmentRoutes from './family-assessment.routes.js';
import nutritionalAssessmentRoutes from './nutritional-assessment.routes.js';
import painAssessmentRoutes from './pain-assessment.routes.js';
import socialAssessmentRoutes from './social-assessment.routes.js';
import spiritualAssessmentRoutes from './spiritual-assessment.routes.js';
import psychiatryAssessmentRoutes from './psychiatry-assessment.routes.js';

const router = Router();

// ── Health check ──
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// ── Top-level feature routes ──
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/staff', staffRoutes);
router.use('/profile', profileRoutes);
router.use('/patients', patientRoutes);
router.use('/hospice', hospiceNursingRoutes);
router.use('/medications', medicationQueueRoutes);
router.use('/labs', labQueueRoutes);
router.use('/imaging', imagingQueueRoutes);

router.use('/pharmacist', pharmacistAssessmentRoutes);
router.use('/physiotherapy', physiotherapyAssessmentRoutes);
router.use('/family', familyAssessmentRoutes);
router.use('/nutrition', nutritionalAssessmentRoutes);
router.use('/pain', painAssessmentRoutes);
router.use('/social', socialAssessmentRoutes);
router.use('/spiritual', spiritualAssessmentRoutes);
router.use('/psychiatry', psychiatryAssessmentRoutes);

// ── Patient-scoped sub-resources ──
router.use('/patients/:patientId/visits', visitRoutes);
router.use('/patients/:patientId/medications', medicationRoutes);
router.use('/patients/:patientId/labs', labRoutes);
router.use('/patients/:patientId/imaging', imagingRoutes);
router.use('/patients/:patientId/referrals', referralRoutes);
router.use('/patients/:patientId/admissions', admissionRoutes);
router.use('/patients/:patientId/progress-notes', progressNoteRoutes);
router.use('/patients/:patientId/discharge-summary', dischargeRoutes);

export default router;