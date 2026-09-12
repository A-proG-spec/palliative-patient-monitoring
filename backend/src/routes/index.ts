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
import profileRoutes  from './profile.routes.js';
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