import express from 'express';
import { checkATS } from '../controllers/atsController.js';
import { authenticate } from '../middleware/authMiddleware.js';


const router = express.Router();

// ATS checker route (protected - requires authentication)
router.post('/ats/check', authenticate, checkATS);

export default router;

