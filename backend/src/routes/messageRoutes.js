import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import {
  sendMessage,
  getConversation,
  getConversations,
  markAsRead,
} from '../controllers/messageController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Message routes
router.post('/messages', sendMessage);
router.get('/conversations', getConversations);
router.get('/conversations/:otherUserId', getConversation);
router.put('/conversations/:otherUserId/read', markAsRead);

export default router;

