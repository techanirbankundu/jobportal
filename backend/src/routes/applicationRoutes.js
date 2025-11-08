import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import {
  applyToJob,
  getJobApplications,
  getMyJobApplications,
  getMyApplications,
  updateApplicationStatus,
} from '../controllers/applicationController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Candidate routes
router.post('/jobs/:jobId/apply', applyToJob);
router.get('/my-applications', getMyApplications);

// Recruiter routes
router.get('/jobs/:jobId/applications', getJobApplications);
router.get('/applications', getMyJobApplications);
router.put('/applications/:applicationId/status', updateApplicationStatus);

export default router;

