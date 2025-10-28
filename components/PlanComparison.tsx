import React, { useState, useEffect } from 'react';
import { ZapIcon, CheckCircleIcon, LeafIcon, FilterIcon } from './icons/Icons';

interface PlanComparison {
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

interface PlanStatistics {
  total_plans: number;
  providers: number;
  average_rate: number;
  min_rate: number;
  max_rate: number;
  renewable_plans: number;
  no_contract_plans: number;
}

/**
 * Plan Comparison Component
 * Compare electricity plans and find the best deal
 */
const PlanComparison: React.FC = () => {
  const [plans, setPlans] = useState<PlanComparison[]>([]);
  const [statistics, setStatistics] = useState<PlanStatistics | null>(null);
  const [monthlyUsage, setMonthlyUsage] = useState(400);
  const [currentRate, setCurrentRate] = useState(0.3242);
  const [preferRenewable, setPreferRenewable] = useState(false);
  const [maxContractLength, setMaxContractLength] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchStatistics();
    fetchPlans();
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchPlans();
    }
  }, [monthlyUsage, currentRate, preferRenewable, maxContractLength]);

  const fetchStatistics = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/plans/statistics');
      const data = await response.json();
      if (data.success) {
        setStatistics(data.statistics);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        monthlyUsage: monthlyUsage.toString(),
        currentRate: currentRate.toString(),
        preferRenewable: preferRenewable.toString(),
        ...(maxContractLength !== undefined && { maxContractLength: maxContractLength.toString() })
      });

      const response = await fetch(`http://localhost:3001/api/plans/compare?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setPlans(data.comparisons);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500/20';
    if (score >= 60) return 'bg-yellow-500/20';
    return 'bg-orange-500/20';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ZapIcon className="w-8 h-8 text-yellow-400" />
          <h2 className="text-3xl font-bold">Electricity Plan Comparison</h2>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        >
          <FilterIcon className="w-5 h-5" />
          Filters
        </button>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 p-4 rounded-xl">
            <p className="text-sm text-gray-400 mb-1">Total Plans</p>
            <p className="text-2xl font-bold">{statistics.total_plans}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-xl">
            <p className="text-sm text-gray-400 mb-1">Providers</p>
            <p className="text-2xl font-bold">{statistics.providers}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-xl">
            <p className="text-sm text-gray-400 mb-1">Best Rate</p>
            <p className="text-2xl font-bold text-green-400">SGD ${statistics.min_rate.toFixed(4)}</p>
            <p className="text-xs text-gray-500">per kWh</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-xl">
            <p className="text-sm text-gray-400 mb-1">Green Plans</p>
            <p className="text-2xl font-bold text-green-400">{statistics.renewable_plans}</p>
          </div>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-800 p-6 rounded-xl space-y-4">
          <h3 className="font-semibold text-lg mb-4">Customize Your Search</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Monthly Usage */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Monthly Usage (kWh)
              </label>
              <input
                type="number"
                value={monthlyUsage}
                onChange={(e) => setMonthlyUsage(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Average Singapore household: 350-450 kWh/month
              </p>
            </div>

            {/* Current Rate */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Current Rate (SGD per kWh)
              </label>
              <input
                type="number"
                step="0.0001"
                value={currentRate}
                onChange={(e) => setCurrentRate(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                SP regulated tariff: SGD $0.3242/kWh
              </p>
            </div>

            {/* Max Contract Length */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Maximum Contract Length (months)
              </label>
              <select
                value={maxContractLength || ''}
                onChange={(e) => setMaxContractLength(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Any length</option>
                <option value="0">No contract</option>
                <option value="6">6 months</option>
                <option value="12">12 months</option>
                <option value="24">24 months</option>
              </select>
            </div>

            {/* Renewable Preference */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferRenewable}
                  onChange={(e) => setPreferRenewable(e.target.checked)}
                  className="w-5 h-5 rounded"
                />
                <div>
                  <span className="font-medium flex items-center gap-2">
                    <LeafIcon className="w-5 h-5 text-green-400" />
                    Prefer Renewable Energy
                  </span>
                  <p className="text-xs text-gray-400">
                    Prioritize plans with green energy sources
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Current Plan Summary */}
      <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 p-6 rounded-xl">
        <h3 className="font-semibold mb-3">Your Current Plan</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-400">Monthly Usage</p>
            <p className="text-2xl font-bold">{monthlyUsage} kWh</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Current Rate</p>
            <p className="text-2xl font-bold">SGD ${currentRate.toFixed(4)}</p>
            <p className="text-xs text-gray-400">per kWh</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Monthly Cost</p>
            <p className="text-2xl font-bold text-red-400">
              SGD ${(monthlyUsage * currentRate).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Plans List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-400 mt-4">Comparing plans...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-gray-800 p-6 rounded-xl border-2 transition-all ${
                index === 0 
                  ? 'border-green-500/50 shadow-lg shadow-green-500/20' 
                  : 'border-gray-700'
              }`}
            >
              {index === 0 && (
                <div className="mb-4 flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-semibold">Best Match</span>
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{plan.provider}</h3>
                    {plan.renewable_percentage > 0 && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center gap-1">
                        <LeafIcon className="w-3 h-3" />
                        {plan.renewable_percentage}% Green
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400">{plan.plan_name}</p>
                </div>
                
                <div className={`px-4 py-2 rounded-lg ${getScoreBg(plan.recommendation_score)}`}>
                  <p className="text-xs text-gray-400">Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor(plan.recommendation_score)}`}>
                    {plan.recommendation_score}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-400">Rate</p>
                  <p className="text-lg font-semibold">SGD ${plan.rate_per_kwh.toFixed(4)}</p>
                  <p className="text-xs text-gray-500">per kWh</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Monthly Cost</p>
                  <p className="text-lg font-semibold">SGD ${plan.monthly_cost.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Annual Cost</p>
                  <p className="text-lg font-semibold">SGD ${plan.annual_cost.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Contract</p>
                  <p className="text-lg font-semibold">
                    {plan.contract_length === 0 ? 'No contract' : `${plan.contract_length} months`}
                  </p>
                </div>
              </div>

              {plan.savings_vs_current > 0 ? (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
                  <p className="text-green-400 font-semibold mb-1">
                    💰 Save SGD ${plan.savings_vs_current.toFixed(2)}/month ({plan.savings_percentage.toFixed(1)}%)
                  </p>
                  <p className="text-sm text-gray-300">
                    Annual savings: SGD ${(plan.savings_vs_current * 12).toFixed(2)}
                  </p>
                </div>
              ) : (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
                  <p className="text-red-400 font-semibold">
                    More expensive by SGD ${Math.abs(plan.savings_vs_current).toFixed(2)}/month
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Additional Fees</p>
                  <p className="text-sm text-gray-300">{plan.additional_fees}</p>
                </div>
                <a
                  href={plan.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors text-sm font-semibold"
                >
                  View Details →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Help Text */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <p className="text-sm text-blue-300">
          💡 <strong>Tip:</strong> Plans are ranked based on your preferences and potential savings. 
          Consider contract length, renewable energy percentage, and early termination fees before switching.
        </p>
      </div>
    </div>
  );
};

export default PlanComparison;
