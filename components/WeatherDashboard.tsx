import React, { useState, useEffect } from 'react';
import { SunIcon, CloudIcon, DropletIcon, WindIcon, ZapIcon } from './icons/Icons';

interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  description: string;
  icon: string;
}

interface EnergyImpact {
  coolingDemand: 'low' | 'medium' | 'high';
  heatingDemand: 'low' | 'medium' | 'high';
  naturalVentilation: boolean;
  recommendation: string;
}

interface ForecastDay {
  date: string;
  temperature: {
    min: number;
    max: number;
    avg: number;
  };
  humidity: number;
  description: string;
  icon: string;
}

interface CorrelationData {
  date: string;
  temperature: number;
  energyConsumption: number;
  cost: number;
}

/**
 * Weather Dashboard Component
 * Displays current weather, forecast, and energy correlation
 */
const WeatherDashboard: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [energyImpact, setEnergyImpact] = useState<EnergyImpact | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [correlation, setCorrelation] = useState<CorrelationData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeatherData();
    // Refresh every 30 minutes
    const interval = setInterval(fetchWeatherData, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchWeatherData = async () => {
    try {
      // Fetch current weather
      const currentRes = await fetch('http://localhost:3001/api/weather/current');
      const currentData = await currentRes.json();
      
      if (currentData.success) {
        setWeather(currentData.weather);
        setEnergyImpact(currentData.energyImpact);
        setSuggestions(currentData.suggestions);
      }

      // Fetch forecast
      const forecastRes = await fetch('http://localhost:3001/api/weather/forecast');
      const forecastData = await forecastRes.json();
      
      if (forecastData.success) {
        setForecast(forecastData.forecast);
      }

      // Fetch energy correlation
      const correlationRes = await fetch('http://localhost:3001/api/weather/energy-correlation');
      const correlationData = await correlationRes.json();
      
      if (correlationData.success) {
        setCorrelation(correlationData.correlation);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setLoading(false);
    }
  };

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getDemandBg = (demand: string) => {
    switch (demand) {
      case 'high': return 'bg-red-500/20';
      case 'medium': return 'bg-yellow-500/20';
      case 'low': return 'bg-green-500/20';
      default: return 'bg-gray-500/20';
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 p-6 rounded-xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-24 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Weather Card */}
      {weather && (
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-100 mb-1">Current Weather</h3>
              <p className="text-sm text-blue-200">Singapore</p>
            </div>
            <img 
              src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`} 
              alt={weather.description}
              className="w-16 h-16"
            />
          </div>
          
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-6xl font-bold text-white">{weather.temperature}°</span>
            <span className="text-2xl text-blue-100">C</span>
          </div>
          
          <p className="text-blue-100 capitalize mt-2">{weather.description}</p>
          <p className="text-sm text-blue-200 mt-1">Feels like {weather.feelsLike}°C</p>
          
          {/* Weather details */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-blue-500/30">
            <div className="text-center">
              <DropletIcon className="w-5 h-5 mx-auto mb-1 text-blue-200" />
              <p className="text-sm text-blue-200">Humidity</p>
              <p className="text-lg font-semibold text-white">{weather.humidity}%</p>
            </div>
            <div className="text-center">
              <WindIcon className="w-5 h-5 mx-auto mb-1 text-blue-200" />
              <p className="text-sm text-blue-200">Wind</p>
              <p className="text-lg font-semibold text-white">{weather.windSpeed} m/s</p>
            </div>
            <div className="text-center">
              <CloudIcon className="w-5 h-5 mx-auto mb-1 text-blue-200" />
              <p className="text-sm text-blue-200">Pressure</p>
              <p className="text-lg font-semibold text-white">{weather.pressure} hPa</p>
            </div>
          </div>
        </div>
      )}

      {/* Energy Impact Card */}
      {energyImpact && (
        <div className="bg-gray-800 p-6 rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <ZapIcon className="w-6 h-6 text-yellow-400" />
            <h3 className="text-lg font-semibold">Energy Impact</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className={`p-4 rounded-lg ${getDemandBg(energyImpact.coolingDemand)}`}>
              <p className="text-sm text-gray-300 mb-1">Cooling Demand</p>
              <p className={`text-xl font-bold capitalize ${getDemandColor(energyImpact.coolingDemand)}`}>
                {energyImpact.coolingDemand}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${energyImpact.naturalVentilation ? 'bg-green-500/20' : 'bg-gray-700'}`}>
              <p className="text-sm text-gray-300 mb-1">Natural Ventilation</p>
              <p className={`text-xl font-bold ${energyImpact.naturalVentilation ? 'text-green-400' : 'text-gray-400'}`}>
                {energyImpact.naturalVentilation ? 'Suitable' : 'Not Ideal'}
              </p>
            </div>
          </div>
          
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-sm text-blue-300 font-medium mb-1">💡 Recommendation</p>
            <p className="text-sm text-gray-300">{energyImpact.recommendation}</p>
          </div>
        </div>
      )}

      {/* Automation Suggestions */}
      {suggestions.length > 0 && (
        <div className="bg-gray-800 p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-4">Smart Automation Suggestions</h3>
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
                <span className="text-green-400">✓</span>
                <span className="text-sm text-gray-300">{suggestion}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5-Day Forecast */}
      {forecast.length > 0 && (
        <div className="bg-gray-800 p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-4">5-Day Forecast</h3>
          <div className="grid grid-cols-5 gap-3">
            {forecast.map((day, index) => (
              <div key={index} className="bg-gray-700/50 p-4 rounded-lg text-center">
                <p className="text-xs text-gray-400 mb-2">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </p>
                <img 
                  src={`https://openweathermap.org/img/wn/${day.icon}.png`} 
                  alt={day.description}
                  className="w-12 h-12 mx-auto"
                />
                <p className="text-lg font-semibold mt-2">{day.temperature.max}°</p>
                <p className="text-sm text-gray-400">{day.temperature.min}°</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weather-Energy Correlation */}
      {correlation.length > 0 && (
        <div className="bg-gray-800 p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-4">Weather vs Energy Consumption</h3>
          <div className="space-y-3">
            {correlation.map((day, index) => (
              <div key={index} className="bg-gray-700/50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-sm font-semibold text-blue-400">{day.temperature}°C</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                        style={{ width: `${(day.energyConsumption / 30) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="text-sm font-semibold text-white">{day.energyConsumption} kWh</p>
                    <p className="text-xs text-gray-400">SGD ${day.cost.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-300">
              💡 Higher temperatures correlate with increased AC usage and energy costs. 
              Consider using automation to optimize cooling during off-peak hours.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherDashboard;
