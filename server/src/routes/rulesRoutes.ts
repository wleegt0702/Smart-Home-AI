import express from 'express';
import {
  getAllRules,
  getRule,
  createRuleFromNaturalLanguage,
  createRule,
  updateRule,
  toggleRule,
  deleteRule,
  getRuleLogs,
  getAllLogs,
  logRuleExecution
} from '../controllers/rulesController.js';

const router = express.Router();

/**
 * Automation Rules Routes
 * 
 * GET    /api/rules              - Get all rules
 * GET    /api/rules/:id          - Get specific rule
 * POST   /api/rules/natural      - Create rule from natural language
 * POST   /api/rules              - Create rule manually
 * PUT    /api/rules/:id          - Update rule
 * PUT    /api/rules/:id/toggle   - Toggle rule enabled/disabled
 * DELETE /api/rules/:id          - Delete rule
 * GET    /api/rules/:id/logs     - Get logs for specific rule
 * GET    /api/rules/logs/all     - Get all rule execution logs
 * POST   /api/rules/logs         - Log rule execution
 */

router.get('/logs/all', getAllLogs);
router.get('/:id/logs', getRuleLogs);
router.get('/:id', getRule);
router.get('/', getAllRules);
router.post('/natural', createRuleFromNaturalLanguage);
router.post('/logs', logRuleExecution);
router.post('/', createRule);
router.put('/:id/toggle', toggleRule);
router.put('/:id', updateRule);
router.delete('/:id', deleteRule);

export default router;
