import { Request, Response } from 'express';
import {
  scrapeElectricityPlans,
  getAllPlans,
  comparePlans,
  getRecommendedPlans,
  calculateSwitchingSavings
} from '../services/electricityPlanService.js';

/**
 * Electricity Plans Controller
 * Handles electricity plan comparison and recommendations
 */

/**
 * Refresh electricity plans data (scrape from providers)
 */
export const refreshPlans = async (req: Request, res: Response) => {
  try {
    const plans = await scrapeElectricityPlans();
    
    res.json({
      success: true,
      message: `Successfully refreshed ${plans.length} electricity plans`,
      count: plans.length
    });
  } catch (error) {
    console.error('Error refreshing plans:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh electricity plans'
    });
  }
};

/**
 * Get all available electricity plans
 */
export const getPlans = (req: Request, res: Response) => {
  try {
    const plans = getAllPlans();
    
    res.json({
      success: true,
      plans,
      count: plans.length
    });
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch electricity plans'
    });
  }
};

/**
 * Compare plans based on user's usage
 */
export const compare = (req: Request, res: Response) => {
  try {
    const monthlyUsage = parseFloat(req.query.monthlyUsage as string) || 400;
    const currentRate = parseFloat(req.query.currentRate as string) || 0.3242;
    
    const preferences = {
      preferRenewable: req.query.preferRenewable === 'true',
      maxContractLength: req.query.maxContractLength 
        ? parseInt(req.query.maxContractLength as string) 
        : undefined,
      prioritizeSavings: req.query.prioritizeSavings === 'true'
    };

    const comparisons = comparePlans(monthlyUsage, currentRate, preferences);
    
    res.json({
      success: true,
      comparisons,
      parameters: {
        monthlyUsage,
        currentRate,
        preferences
      }
    });
  } catch (error) {
    console.error('Error comparing plans:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to compare plans'
    });
  }
};

/**
 * Get recommended plans
 */
export const getRecommendations = (req: Request, res: Response) => {
  try {
    const monthlyUsage = parseFloat(req.query.monthlyUsage as string) || 400;
    
    const preferences = {
      preferRenewable: req.query.preferRenewable === 'true',
      maxContractLength: req.query.maxContractLength 
        ? parseInt(req.query.maxContractLength as string) 
        : undefined,
      prioritizeSavings: req.query.prioritizeSavings === 'true'
    };

    const recommendations = getRecommendedPlans(monthlyUsage, preferences);
    
    res.json({
      success: true,
      recommendations,
      parameters: {
        monthlyUsage,
        preferences
      }
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get plan recommendations'
    });
  }
};

/**
 * Calculate savings for switching to a specific plan
 */
export const calculateSavings = (req: Request, res: Response) => {
  try {
    const { planId } = req.params;
    const monthlyUsage = parseFloat(req.query.monthlyUsage as string) || 400;
    const currentRate = parseFloat(req.query.currentRate as string) || 0.3242;

    const savings = calculateSwitchingSavings(
      monthlyUsage,
      currentRate,
      parseInt(planId)
    );
    
    res.json({
      success: true,
      savings,
      parameters: {
        monthlyUsage,
        currentRate
      }
    });
  } catch (error) {
    console.error('Error calculating savings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate savings'
    });
  }
};

/**
 * Get plan statistics
 */
export const getStatistics = (req: Request, res: Response) => {
  try {
    const plans = getAllPlans();
    
    const rates = plans.map(p => p.rate_per_kwh);
    const avgRate = rates.reduce((a, b) => a + b, 0) / rates.length;
    const minRate = Math.min(...rates);
    const maxRate = Math.max(...rates);
    
    const renewablePlans = plans.filter(p => p.renewable_percentage > 0);
    const noContractPlans = plans.filter(p => p.contract_length === 0);
    
    const statistics = {
      total_plans: plans.length,
      providers: [...new Set(plans.map(p => p.provider))].length,
      average_rate: Math.round(avgRate * 10000) / 10000,
      min_rate: minRate,
      max_rate: maxRate,
      renewable_plans: renewablePlans.length,
      no_contract_plans: noContractPlans.length,
      contract_lengths: [...new Set(plans.map(p => p.contract_length))].sort((a, b) => a - b)
    };
    
    res.json({
      success: true,
      statistics
    });
  } catch (error) {
    console.error('Error getting statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get plan statistics'
    });
  }
};
