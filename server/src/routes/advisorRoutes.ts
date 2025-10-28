import express from 'express';
import {
  chat,
  getRecommendations,
  checkUnusualConsumption,
  getConversationHistory,
  getEnergyInsights
} from '../controllers/advisorController.js';

const router = express.Router();

/**
 * AI Energy Advisor Routes
 * 
 * POST /api/advisor/chat                - Chat with AI advisor
 * GET  /api/advisor/recommendations     - Get personalized recommendations
 * GET  /api/advisor/unusual             - Check for unusual consumption
 * GET  /api/advisor/history             - Get conversation history
 * GET  /api/advisor/insights            - Get energy insights and statistics
 */

router.post('/chat', chat);
router.get('/recommendations', getRecommendations);
router.get('/unusual', checkUnusualConsumption);
router.get('/history', getConversationHistory);
router.get('/insights', getEnergyInsights);

export default router;
