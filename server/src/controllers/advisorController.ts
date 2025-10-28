import { Request, Response } from 'express';
import { db } from '../models/database.js';
import { 
  chatWithEnergyAdvisor, 
  generateEnergySavingRecommendations,
  analyzeUnusualConsumption 
} from '../services/aiService.js';

/**
 * AI Energy Advisor Controller
 * Handles conversational AI interactions and energy recommendations
 */

/**
 * Chat with the AI Energy Advisor
 */
export const chat = async (req: Request, res: Response) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Message is required' 
      });
    }

    // Get context data
    const devices = db.prepare('SELECT * FROM devices').all();
    
    // Get recent energy usage (simulated for now)
    const energyUsage = db.prepare(`
      SELECT * FROM energy_usage 
      ORDER BY timestamp DESC 
      LIMIT 10
    `).all();

    // Weather data would be fetched from weather service
    const weather = { temperature: 30, humidity: 75 }; // Placeholder

    const context = {
      devices,
      weather,
      energyUsage
    };

    const history = conversationHistory || [];
    
    const aiResponse = await chatWithEnergyAdvisor(message, history, context);

    // Save conversation to database
    db.prepare(`
      INSERT INTO advisor_conversations (user_message, ai_response, context)
      VALUES (?, ?, ?)
    `).run(message, aiResponse, JSON.stringify(context));

    res.json({ 
      success: true, 
      response: aiResponse 
    });
  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process chat message' 
    });
  }
};

/**
 * Get personalized energy-saving recommendations
 */
export const getRecommendations = async (req: Request, res: Response) => {
  try {
    const devices = db.prepare('SELECT * FROM devices').all();
    
    const energyUsage = db.prepare(`
      SELECT * FROM energy_usage 
      ORDER BY timestamp DESC 
      LIMIT 20
    `).all();

    const weather = { temperature: 30, humidity: 75 }; // Would fetch from weather service

    const recommendations = await generateEnergySavingRecommendations(
      devices,
      weather,
      energyUsage
    );

    res.json({ 
      success: true, 
      recommendations 
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate recommendations' 
    });
  }
};

/**
 * Check for unusual energy consumption
 */
export const checkUnusualConsumption = async (req: Request, res: Response) => {
  try {
    // Calculate current usage (simulated)
    const currentUsage = 25; // kWh
    const historicalAverage = 18; // kWh

    const devices = db.prepare('SELECT * FROM devices').all();

    const analysis = await analyzeUnusualConsumption(
      currentUsage,
      historicalAverage,
      devices
    );

    res.json({ 
      success: true, 
      analysis 
    });
  } catch (error) {
    console.error('Error analyzing consumption:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to analyze consumption' 
    });
  }
};

/**
 * Get conversation history
 */
export const getConversationHistory = (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;

    const conversations = db.prepare(`
      SELECT * FROM advisor_conversations 
      ORDER BY created_at DESC 
      LIMIT ?
    `).all(limit);

    res.json({ 
      success: true, 
      conversations 
    });
  } catch (error) {
    console.error('Error fetching conversation history:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch conversation history' 
    });
  }
};

/**
 * Get energy insights and statistics
 */
export const getEnergyInsights = (req: Request, res: Response) => {
  try {
    // Get total devices
    const deviceCount = db.prepare('SELECT COUNT(*) as count FROM devices').get() as { count: number };
    
    // Get active devices
    const activeDevices = db.prepare('SELECT COUNT(*) as count FROM devices WHERE status = 1').get() as { count: number };
    
    // Get enabled rules
    const activeRules = db.prepare('SELECT COUNT(*) as count FROM automation_rules WHERE enabled = 1').get() as { count: number };
    
    // Simulated energy data (in production, this would come from actual meters)
    const insights = {
      totalDevices: deviceCount.count,
      activeDevices: activeDevices.count,
      activeRules: activeRules.count,
      todayUsage: 22.5, // kWh
      todayCost: 6.75, // SGD
      weeklyAverage: 21.3, // kWh
      monthlyCost: 195.50, // SGD
      topConsumers: [
        { device: 'Air Conditioner', percentage: 45, usage: 10.1 },
        { device: 'Water Heater', percentage: 25, usage: 5.6 },
        { device: 'Refrigerator', percentage: 15, usage: 3.4 },
        { device: 'Lights', percentage: 10, usage: 2.3 },
        { device: 'Others', percentage: 5, usage: 1.1 }
      ],
      savingsPotential: 35.20, // SGD per month
      efficiencyScore: 72 // out of 100
    };

    res.json({ 
      success: true, 
      insights 
    });
  } catch (error) {
    console.error('Error fetching energy insights:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch energy insights' 
    });
  }
};
