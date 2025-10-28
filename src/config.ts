/**
 * Application Configuration
 * Centralized configuration for API endpoints and environment variables
 */

// API Base URL - uses environment variable or defaults to localhost
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// API Endpoints
export const API_ENDPOINTS = {
  // Devices
  devices: `${API_URL}/api/devices`,
  deviceTypes: `${API_URL}/api/devices/types`,
  deviceDiscover: `${API_URL}/api/devices/discover`,
  
  // Weather
  weatherCurrent: `${API_URL}/api/weather/current`,
  weatherForecast: `${API_URL}/api/weather/forecast`,
  weatherCorrelation: `${API_URL}/api/weather/energy-correlation`,
  
  // Rules
  rules: `${API_URL}/api/rules`,
  rulesNatural: `${API_URL}/api/rules/natural`,
  rulesLogs: `${API_URL}/api/rules/logs/all`,
  
  // AI Advisor
  advisorChat: `${API_URL}/api/advisor/chat`,
  advisorRecommendations: `${API_URL}/api/advisor/recommendations`,
  advisorInsights: `${API_URL}/api/advisor/insights`,
  advisorUnusual: `${API_URL}/api/advisor/unusual`,
  
  // Electricity Plans
  plans: `${API_URL}/api/plans`,
  plansCompare: `${API_URL}/api/plans/compare`,
  plansRecommendations: `${API_URL}/api/plans/recommendations`,
  plansStatistics: `${API_URL}/api/plans/statistics`,
};

// Environment
export const IS_PRODUCTION = import.meta.env.PROD;
export const IS_DEVELOPMENT = import.meta.env.DEV;

// Feature Flags
export const FEATURES = {
  deviceAutoDetection: true,
  weatherIntegration: true,
  aiRules: true,
  energyAdvisor: true,
  planComparison: true,
};

export default {
  API_URL,
  API_ENDPOINTS,
  IS_PRODUCTION,
  IS_DEVELOPMENT,
  FEATURES,
};
