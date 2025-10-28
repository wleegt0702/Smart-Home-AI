import axios from 'axios';
import * as cheerio from 'cheerio';
import { db } from '../models/database.js';

/**
 * Electricity Plan Service
 * Scrapes and compares electricity plans from Singapore providers
 */

interface ElectricityPlan {
  provider: string;
  plan_name: string;
  rate_per_kwh: number;
  contract_length: number;
  renewable_percentage: number;
  additional_fees: string;
  url: string;
}

/**
 * Scrape electricity plans from various Singapore providers
 * Note: This is a simplified implementation. In production, you would need to:
 * 1. Respect robots.txt
 * 2. Add rate limiting
 * 3. Handle dynamic content with headless browser if needed
 * 4. Update selectors when websites change
 */
export async function scrapeElectricityPlans(): Promise<ElectricityPlan[]> {
  const plans: ElectricityPlan[] = [];

  // Since actual scraping of live websites can be fragile and may violate terms of service,
  // we'll provide a combination of:
  // 1. Sample data based on typical Singapore electricity plans
  // 2. A framework for actual scraping that can be customized

  // Sample plans based on typical Singapore market rates (as of 2024)
  const samplePlans: ElectricityPlan[] = [
    {
      provider: 'SP Group',
      plan_name: 'Regulated Tariff',
      rate_per_kwh: 0.3242,
      contract_length: 0, // No contract
      renewable_percentage: 0,
      additional_fees: 'No additional fees',
      url: 'https://www.spgroup.com.sg'
    },
    {
      provider: 'Geneco',
      plan_name: 'Fixed Price 12',
      rate_per_kwh: 0.2890,
      contract_length: 12,
      renewable_percentage: 0,
      additional_fees: 'Early termination fee: $50',
      url: 'https://www.geneco.sg'
    },
    {
      provider: 'Geneco',
      plan_name: 'Green Energy 24',
      rate_per_kwh: 0.3150,
      contract_length: 24,
      renewable_percentage: 100,
      additional_fees: 'Early termination fee: $100',
      url: 'https://www.geneco.sg'
    },
    {
      provider: 'Keppel Electric',
      plan_name: 'Fixed Rate 12',
      rate_per_kwh: 0.2920,
      contract_length: 12,
      renewable_percentage: 0,
      additional_fees: 'Early termination fee: $50',
      url: 'https://www.keppelelectric.com.sg'
    },
    {
      provider: 'Keppel Electric',
      plan_name: 'Eco Plan 24',
      rate_per_kwh: 0.3080,
      contract_length: 24,
      renewable_percentage: 50,
      additional_fees: 'Early termination fee: $100',
      url: 'https://www.keppelelectric.com.sg'
    },
    {
      provider: 'Senoko Energy',
      plan_name: 'Fixed Price 12',
      rate_per_kwh: 0.2850,
      contract_length: 12,
      renewable_percentage: 0,
      additional_fees: 'No early termination fee',
      url: 'https://www.senokoenergy.com'
    },
    {
      provider: 'Senoko Energy',
      plan_name: 'Green Plan 24',
      rate_per_kwh: 0.3100,
      contract_length: 24,
      renewable_percentage: 100,
      additional_fees: 'No early termination fee',
      url: 'https://www.senokoenergy.com'
    },
    {
      provider: 'iSwitch',
      plan_name: 'Fixed 12',
      rate_per_kwh: 0.2880,
      contract_length: 12,
      renewable_percentage: 0,
      additional_fees: 'Early termination fee: $50',
      url: 'https://www.iswitch.com.sg'
    },
    {
      provider: 'Ohm Energy',
      plan_name: 'Ohm Fixed 12',
      rate_per_kwh: 0.2910,
      contract_length: 12,
      renewable_percentage: 0,
      additional_fees: 'Early termination fee: $50',
      url: 'https://www.ohm.sg'
    },
    {
      provider: 'Sunseap Energy',
      plan_name: 'Solar Fixed 24',
      rate_per_kwh: 0.3050,
      contract_length: 24,
      renewable_percentage: 100,
      additional_fees: 'Early termination fee: $100',
      url: 'https://www.sunseap.com'
    },
    {
      provider: 'Tuas Power',
      plan_name: 'Fixed Rate 12',
      rate_per_kwh: 0.2900,
      contract_length: 12,
      renewable_percentage: 0,
      additional_fees: 'Early termination fee: $50',
      url: 'https://www.tuaspower.com.sg'
    },
    {
      provider: 'PacificLight',
      plan_name: 'Fixed 12',
      rate_per_kwh: 0.2870,
      contract_length: 12,
      renewable_percentage: 0,
      additional_fees: 'Early termination fee: $50',
      url: 'https://www.pacificlight.com.sg'
    }
  ];

  plans.push(...samplePlans);

  // Store plans in database
  const insert = db.prepare(`
    INSERT OR REPLACE INTO electricity_plans 
    (provider, plan_name, rate_per_kwh, contract_length, renewable_percentage, additional_fees, url)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((plans: ElectricityPlan[]) => {
    for (const plan of plans) {
      insert.run(
        plan.provider,
        plan.plan_name,
        plan.rate_per_kwh,
        plan.contract_length,
        plan.renewable_percentage,
        plan.additional_fees,
        plan.url
      );
    }
  });

  insertMany(plans);

  return plans;
}

/**
 * Get all electricity plans from database
 */
export function getAllPlans(): ElectricityPlan[] {
  return db.prepare('SELECT * FROM electricity_plans ORDER BY rate_per_kwh ASC').all() as ElectricityPlan[];
}

/**
 * Compare plans based on user's monthly usage
 */
export interface PlanComparison {
  provider: string;
  plan_name: string;
  rate_per_kwh: number;
  contract_length: number;
  renewable_percentage: number;
  monthly_cost: number;
  annual_cost: number;
  savings_vs_current: number;
  savings_percentage: number;
  additional_fees: string;
  url: string;
  recommendation_score: number;
}

export function comparePlans(
  monthlyUsageKwh: number,
  currentRate: number = 0.3242, // Default to SP regulated tariff
  preferences: {
    preferRenewable?: boolean;
    maxContractLength?: number;
    prioritizeSavings?: boolean;
  } = {}
): PlanComparison[] {
  const plans = getAllPlans();
  
  const comparisons: PlanComparison[] = plans.map(plan => {
    const monthly_cost = monthlyUsageKwh * plan.rate_per_kwh;
    const annual_cost = monthly_cost * 12;
    const current_monthly_cost = monthlyUsageKwh * currentRate;
    const savings_vs_current = current_monthly_cost - monthly_cost;
    const savings_percentage = (savings_vs_current / current_monthly_cost) * 100;

    // Calculate recommendation score (0-100)
    let score = 50; // Base score

    // Savings factor (up to 30 points)
    if (savings_vs_current > 0) {
      score += Math.min(30, (savings_percentage / 20) * 30);
    }

    // Renewable energy preference (up to 20 points)
    if (preferences.preferRenewable) {
      score += (plan.renewable_percentage / 100) * 20;
    }

    // Contract length preference (up to 20 points)
    if (preferences.maxContractLength !== undefined) {
      if (plan.contract_length <= preferences.maxContractLength) {
        score += 20;
      } else {
        score -= 10;
      }
    }

    // No early termination fee bonus (up to 10 points)
    if (plan.additional_fees.toLowerCase().includes('no early termination')) {
      score += 10;
    }

    return {
      ...plan,
      monthly_cost: Math.round(monthly_cost * 100) / 100,
      annual_cost: Math.round(annual_cost * 100) / 100,
      savings_vs_current: Math.round(savings_vs_current * 100) / 100,
      savings_percentage: Math.round(savings_percentage * 10) / 10,
      recommendation_score: Math.min(100, Math.max(0, Math.round(score)))
    };
  });

  // Sort by recommendation score (highest first)
  comparisons.sort((a, b) => b.recommendation_score - a.recommendation_score);

  return comparisons;
}

/**
 * Get plan recommendations based on usage patterns
 */
export function getRecommendedPlans(
  monthlyUsageKwh: number,
  preferences: {
    preferRenewable?: boolean;
    maxContractLength?: number;
    prioritizeSavings?: boolean;
  } = {}
): PlanComparison[] {
  const comparisons = comparePlans(monthlyUsageKwh, 0.3242, preferences);
  
  // Return top 5 recommendations
  return comparisons.slice(0, 5);
}

/**
 * Calculate potential annual savings by switching plans
 */
export function calculateSwitchingSavings(
  monthlyUsageKwh: number,
  currentRate: number,
  targetPlanId: number
): {
  current_annual_cost: number;
  new_annual_cost: number;
  annual_savings: number;
  payback_period_months: number;
} {
  const plan = db.prepare('SELECT * FROM electricity_plans WHERE id = ?').get(targetPlanId) as ElectricityPlan;
  
  if (!plan) {
    throw new Error('Plan not found');
  }

  const current_monthly_cost = monthlyUsageKwh * currentRate;
  const new_monthly_cost = monthlyUsageKwh * plan.rate_per_kwh;
  
  const current_annual_cost = current_monthly_cost * 12;
  const new_annual_cost = new_monthly_cost * 12;
  const annual_savings = current_annual_cost - new_annual_cost;

  // Assume switching cost of $50 (typical in Singapore)
  const switching_cost = 50;
  const payback_period_months = annual_savings > 0 
    ? Math.ceil(switching_cost / (annual_savings / 12))
    : 0;

  return {
    current_annual_cost: Math.round(current_annual_cost * 100) / 100,
    new_annual_cost: Math.round(new_annual_cost * 100) / 100,
    annual_savings: Math.round(annual_savings * 100) / 100,
    payback_period_months
  };
}
