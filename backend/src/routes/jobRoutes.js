import express from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import {
  createJob,
  getAllJobs,
  getJobById,
  getRelevantJobs,
  updateJob,
  deleteJob,
} from '../controllers/jobController.js';

const router = express.Router();

// Public routes
router.get('/', getAllJobs);
router.get('/relevant', authenticate, getRelevantJobs); // Requires auth to get user skills
router.get('/:id', getJobById);

// Recruiter only routes
router.post('/', authenticate, authorize('recruiter'), createJob);
router.put('/:id', authenticate, authorize('recruiter'), updateJob);
router.delete('/:id', authenticate, authorize('recruiter'), deleteJob);

export default router;

