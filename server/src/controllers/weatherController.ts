import { Request, Response } from 'express';
import {
  getCurrentWeather,
  getWeatherForecast,
  calculateEnergyImpact,
  getWeatherAutomationSuggestions,
  generateWeatherEnergyCorrelation
} from '../services/weatherService.js';

/**
 * Weather Controller
 * Handles weather-related API endpoints
 */

/**
 * Get current weather and energy impact
 */
export const getCurrent = async (req: Request, res: Response) => {
  try {
    const city = (req.query.city as string) || 'Singapore';
    
    const weather = await getCurrentWeather(city);
    
    if (!weather) {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch weather data' 
      });
    }
    
    const energyImpact = calculateEnergyImpact(weather);
    const suggestions = getWeatherAutomationSuggestions(weather);
    
    res.json({
      success: true,
      weather,
      energyImpact,
      suggestions
    });
  } catch (error) {
    console.error('Error in getCurrent:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
};

/**
 * Get weather forecast
 */
export const getForecast = async (req: Request, res: Response) => {
  try {
    const city = (req.query.city as string) || 'Singapore';
    
    const forecast = await getWeatherForecast(city);
    
    if (!forecast || forecast.length === 0) {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch forecast data' 
      });
    }
    
    res.json({
      success: true,
      forecast
    });
  } catch (error) {
    console.error('Error in getForecast:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
};

/**
 * Get weather-energy correlation data
 */
export const getEnergyCorrelation = async (req: Request, res: Response) => {
  try {
    const city = (req.query.city as string) || 'Singapore';
    
    const forecast = await getWeatherForecast(city);
    
    if (!forecast || forecast.length === 0) {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch forecast data' 
      });
    }
    
    const correlation = generateWeatherEnergyCorrelation(forecast);
    
    res.json({
      success: true,
      correlation
    });
  } catch (error) {
    console.error('Error in getEnergyCorrelation:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
};
