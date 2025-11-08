import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import {
  getProfile,
  updateProfile,
  uploadCV,
  addSkills,
  getAllSkills,
  createSkill,
} from '../controllers/userController.js';
import { upload } from '../utils/cloudinary.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// CV upload
router.post('/cv/upload', upload.single('file'), uploadCV);

// Skills routes
router.get('/skills', getAllSkills); // Get all available skills
router.post('/skills/create', createSkill); // Create a new skill
router.post('/skills', addSkills); // Add skills to user profile (expects skillIds array)

export default router;

