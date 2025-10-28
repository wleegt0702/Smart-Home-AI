import { Request, Response } from 'express';
import { db } from '../models/database.js';
import { parseNaturalLanguageRule } from '../services/aiService.js';

/**
 * Automation Rules Controller
 * Manages user-defined automation rules
 */

/**
 * Get all automation rules
 */
export const getAllRules = (req: Request, res: Response) => {
  try {
    const rules = db.prepare('SELECT * FROM automation_rules ORDER BY created_at DESC').all();
    res.json({ success: true, rules });
  } catch (error) {
    console.error('Error fetching rules:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch rules' });
  }
};

/**
 * Get a single rule by ID
 */
export const getRule = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const rule = db.prepare('SELECT * FROM automation_rules WHERE id = ?').get(id);
    
    if (!rule) {
      return res.status(404).json({ success: false, error: 'Rule not found' });
    }
    
    res.json({ success: true, rule });
  } catch (error) {
    console.error('Error fetching rule:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch rule' });
  }
};

/**
 * Create a new automation rule from natural language
 */
export const createRuleFromNaturalLanguage = async (req: Request, res: Response) => {
  try {
    const { userInput } = req.body;

    if (!userInput) {
      return res.status(400).json({ 
        success: false, 
        error: 'User input is required' 
      });
    }

    // Parse natural language using AI
    const parsedRule = await parseNaturalLanguageRule(userInput);

    if (!parsedRule) {
      return res.status(400).json({ 
        success: false, 
        error: 'Could not parse the rule. Please try rephrasing it.' 
      });
    }

    // Insert into database
    const insert = db.prepare(`
      INSERT INTO automation_rules (name, description, condition, action, enabled)
      VALUES (?, ?, ?, ?, 1)
    `);

    const result = insert.run(
      parsedRule.name,
      parsedRule.description,
      JSON.stringify(parsedRule.condition),
      JSON.stringify(parsedRule.action)
    );

    const newRule = db.prepare('SELECT * FROM automation_rules WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({ 
      success: true, 
      message: 'Rule created successfully',
      rule: newRule 
    });
  } catch (error) {
    console.error('Error creating rule:', error);
    res.status(500).json({ success: false, error: 'Failed to create rule' });
  }
};

/**
 * Create a new automation rule manually
 */
export const createRule = (req: Request, res: Response) => {
  try {
    const { name, description, condition, action } = req.body;

    if (!name || !condition || !action) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name, condition, and action are required' 
      });
    }

    const insert = db.prepare(`
      INSERT INTO automation_rules (name, description, condition, action, enabled)
      VALUES (?, ?, ?, ?, 1)
    `);

    const result = insert.run(
      name,
      description || '',
      JSON.stringify(condition),
      JSON.stringify(action)
    );

    const newRule = db.prepare('SELECT * FROM automation_rules WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({ 
      success: true, 
      message: 'Rule created successfully',
      rule: newRule 
    });
  } catch (error) {
    console.error('Error creating rule:', error);
    res.status(500).json({ success: false, error: 'Failed to create rule' });
  }
};

/**
 * Update a rule
 */
export const updateRule = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, condition, action, enabled } = req.body;

    const updates: string[] = [];
    const values: any[] = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (condition !== undefined) {
      updates.push('condition = ?');
      values.push(JSON.stringify(condition));
    }
    if (action !== undefined) {
      updates.push('action = ?');
      values.push(JSON.stringify(action));
    }
    if (enabled !== undefined) {
      updates.push('enabled = ?');
      values.push(enabled ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const update = db.prepare(`
      UPDATE automation_rules 
      SET ${updates.join(', ')}
      WHERE id = ?
    `);

    const result = update.run(...values);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Rule not found' });
    }

    const updatedRule = db.prepare('SELECT * FROM automation_rules WHERE id = ?').get(id);
    res.json({ success: true, rule: updatedRule });
  } catch (error) {
    console.error('Error updating rule:', error);
    res.status(500).json({ success: false, error: 'Failed to update rule' });
  }
};

/**
 * Toggle rule enabled/disabled
 */
export const toggleRule = (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const rule = db.prepare('SELECT enabled FROM automation_rules WHERE id = ?').get(id) as any;
    
    if (!rule) {
      return res.status(404).json({ success: false, error: 'Rule not found' });
    }

    const newEnabled = rule.enabled === 1 ? 0 : 1;

    const update = db.prepare(`
      UPDATE automation_rules 
      SET enabled = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);

    update.run(newEnabled, id);

    const updatedRule = db.prepare('SELECT * FROM automation_rules WHERE id = ?').get(id);
    res.json({ success: true, rule: updatedRule });
  } catch (error) {
    console.error('Error toggling rule:', error);
    res.status(500).json({ success: false, error: 'Failed to toggle rule' });
  }
};

/**
 * Delete a rule
 */
export const deleteRule = (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleteStmt = db.prepare('DELETE FROM automation_rules WHERE id = ?');
    const result = deleteStmt.run(id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Rule not found' });
    }

    res.json({ success: true, message: 'Rule deleted successfully' });
  } catch (error) {
    console.error('Error deleting rule:', error);
    res.status(500).json({ success: false, error: 'Failed to delete rule' });
  }
};

/**
 * Get rule execution logs
 */
export const getRuleLogs = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    const logs = db.prepare(`
      SELECT rl.*, ar.name as rule_name
      FROM rule_logs rl
      JOIN automation_rules ar ON rl.rule_id = ar.id
      WHERE rl.rule_id = ?
      ORDER BY rl.executed_at DESC
      LIMIT ?
    `).all(id, limit);

    res.json({ success: true, logs });
  } catch (error) {
    console.error('Error fetching rule logs:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch logs' });
  }
};

/**
 * Get all rule execution logs
 */
export const getAllLogs = (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;

    const logs = db.prepare(`
      SELECT rl.*, ar.name as rule_name
      FROM rule_logs rl
      JOIN automation_rules ar ON rl.rule_id = ar.id
      ORDER BY rl.executed_at DESC
      LIMIT ?
    `).all(limit);

    res.json({ success: true, logs });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch logs' });
  }
};

/**
 * Log rule execution (called by automation engine)
 */
export const logRuleExecution = (req: Request, res: Response) => {
  try {
    const { ruleId, success, message } = req.body;

    if (!ruleId) {
      return res.status(400).json({ success: false, error: 'Rule ID is required' });
    }

    const insert = db.prepare(`
      INSERT INTO rule_logs (rule_id, success, message)
      VALUES (?, ?, ?)
    `);

    insert.run(ruleId, success ? 1 : 0, message || '');

    res.json({ success: true, message: 'Log entry created' });
  } catch (error) {
    console.error('Error logging rule execution:', error);
    res.status(500).json({ success: false, error: 'Failed to log execution' });
  }
};
