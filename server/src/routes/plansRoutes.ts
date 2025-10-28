import express from 'express';
import {
  refreshPlans,
  getPlans,
  compare,
  getRecommendations,
  calculateSavings,
  getStatistics
} from '../controllers/plansController.js';

const router = express.Router();

/**
 * Electricity Plans Routes
 * 
 * POST /api/plans/refresh              - Refresh plans data from providers
 * GET  /api/plans                      - Get all available plans
 * GET  /api/plans/compare              - Compare plans based on usage
 * GET  /api/plans/recommendations      - Get recommended plans
 * GET  /api/plans/:planId/savings      - Calculate savings for specific plan
 * GET  /api/plans/statistics           - Get plan statistics
 */

router.post('/refresh', refreshPlans);
router.get('/statistics', getStatistics);
router.get('/compare', compare);
router.get('/recommendations', getRecommendations);
router.get('/:planId/savings', calculateSavings);
router.get('/', getPlans);

export default router;
