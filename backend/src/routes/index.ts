import { Router } from 'express';
import authRoutes from './auth.routes.js';
import adminRoutes from './admin.routes.js';
import patientRoutes from './patient.routes.js';
import visitRoutes from './visit.routes.js';
import medicationRoutes from './medication.routes.js';
import labRoutes from './lab.routes.js';
import referralRoutes from './referral.routes.js';
import admissionRoutes from './admission.routes.js';
import staffRoutes from './staff.routes.js';

const router = Router();

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// Feature routes
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/patients', patientRoutes);
router.use('/patients/:patientId/visits', visitRoutes);
router.use('/patients/:patientId/medications', medicationRoutes);
router.use('/patients/:patientId/labs', labRoutes);
router.use('/patients/:patientId/referrals', referralRoutes);
router.use('/patients/:patientId/admissions', admissionRoutes);
router.use('/staff', staffRoutes);

export default router;