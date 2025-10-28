import axios from 'axios';

/**
 * Weather Service
 * Integrates with OpenWeatherMap API to fetch real weather data
 * Provides weather information relevant to energy usage
 */

interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  description: string;
  icon: string;
  sunrise: number;
  sunset: number;
}

interface ForecastData {
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

interface EnergyImpact {
  coolingDemand: 'low' | 'medium' | 'high';
  heatingDemand: 'low' | 'medium' | 'high';
  naturalVentilation: boolean;
  recommendation: string;
}

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || '';
const DEFAULT_CITY = 'Singapore';
const DEFAULT_LAT = 1.3521;
const DEFAULT_LON = 103.8198;

/**
 * Get current weather data
 */
export async function getCurrentWeather(city: string = DEFAULT_CITY): Promise<WeatherData | null> {
  try {
    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        q: city,
        appid: OPENWEATHER_API_KEY,
        units: 'metric'
      }
    });

    const data = response.data;
    
    return {
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: data.wind.speed,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset
    };
  } catch (error) {
    console.error('Error fetching current weather:', error);
    return null;
  }
}

/**
 * Get weather forecast (5 days)
 */
export async function getWeatherForecast(city: string = DEFAULT_CITY): Promise<ForecastData[]> {
  try {
    const response = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
      params: {
        q: city,
        appid: OPENWEATHER_API_KEY,
        units: 'metric'
      }
    });

    const forecastList = response.data.list;
    
    // Group by date and calculate daily averages
    const dailyData: { [key: string]: any[] } = {};
    
    forecastList.forEach((item: any) => {
      const date = item.dt_txt.split(' ')[0];
      if (!dailyData[date]) {
        dailyData[date] = [];
      }
      dailyData[date].push(item);
    });

    const forecast: ForecastData[] = Object.entries(dailyData).map(([date, items]) => {
      const temps = items.map(item => item.main.temp);
      const humidities = items.map(item => item.main.humidity);
      
      return {
        date,
        temperature: {
          min: Math.round(Math.min(...temps)),
          max: Math.round(Math.max(...temps)),
          avg: Math.round(temps.reduce((a, b) => a + b, 0) / temps.length)
        },
        humidity: Math.round(humidities.reduce((a, b) => a + b, 0) / humidities.length),
        description: items[0].weather[0].description,
        icon: items[0].weather[0].icon
      };
    });

    return forecast.slice(0, 5); // Return 5-day forecast
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    return [];
  }
}

/**
 * Calculate energy impact based on weather conditions
 */
export function calculateEnergyImpact(weather: WeatherData): EnergyImpact {
  const { temperature, humidity, windSpeed } = weather;
  
  // Cooling demand (for Singapore's tropical climate)
  let coolingDemand: 'low' | 'medium' | 'high' = 'medium';
  if (temperature > 32) coolingDemand = 'high';
  else if (temperature < 28) coolingDemand = 'low';
  
  // Heating demand (rarely needed in Singapore, but included for completeness)
  let heatingDemand: 'low' | 'medium' | 'high' = 'low';
  if (temperature < 20) heatingDemand = 'medium';
  if (temperature < 15) heatingDemand = 'high';
  
  // Natural ventilation suitability
  const naturalVentilation = temperature >= 24 && temperature <= 28 && humidity < 70 && windSpeed > 1;
  
  // Generate recommendation
  let recommendation = '';
  if (coolingDemand === 'high') {
    recommendation = 'High cooling demand. Consider pre-cooling during off-peak hours and using blinds to reduce solar heat gain.';
  } else if (coolingDemand === 'low' && naturalVentilation) {
    recommendation = 'Perfect weather for natural ventilation. Turn off AC and open windows to save energy.';
  } else if (humidity > 80) {
    recommendation = 'High humidity. Use dehumidifier mode on AC for better comfort and efficiency.';
  } else {
    recommendation = 'Moderate conditions. Use fans and partial AC to optimize energy consumption.';
  }
  
  return {
    coolingDemand,
    heatingDemand,
    naturalVentilation,
    recommendation
  };
}

/**
 * Get weather-based automation suggestions
 */
export function getWeatherAutomationSuggestions(weather: WeatherData): string[] {
  const suggestions: string[] = [];
  const { temperature, humidity } = weather;
  
  if (temperature > 30) {
    suggestions.push('Turn on AC and set to 24°C');
    suggestions.push('Close blinds to 50% to reduce heat');
  }
  
  if (temperature < 26 && humidity < 60) {
    suggestions.push('Turn off AC and use natural ventilation');
    suggestions.push('Open blinds for natural lighting');
  }
  
  if (humidity > 80) {
    suggestions.push('Use AC in dehumidifier mode');
  }
  
  const currentHour = new Date().getHours();
  if (currentHour >= 18 && currentHour <= 22) {
    suggestions.push('Turn on evening lights');
  }
  
  return suggestions;
}

/**
 * Compare weather with energy consumption (for visualization)
 */
export interface WeatherEnergyCorrelation {
  date: string;
  temperature: number;
  energyConsumption: number; // kWh
  cost: number; // SGD
}

/**
 * Generate sample correlation data (in production, this would use actual energy data)
 */
export function generateWeatherEnergyCorrelation(forecast: ForecastData[]): WeatherEnergyCorrelation[] {
  return forecast.map(day => {
    // Simulate energy consumption based on temperature
    // Higher temperature = more AC usage = higher consumption
    const baseConsumption = 15; // kWh per day baseline
    const tempFactor = Math.max(0, (day.temperature.avg - 26) * 2);
    const energyConsumption = baseConsumption + tempFactor;
    
    // Singapore electricity rate: approximately $0.30 per kWh
    const cost = energyConsumption * 0.30;
    
    return {
      date: day.date,
      temperature: day.temperature.avg,
      energyConsumption: Math.round(energyConsumption * 10) / 10,
      cost: Math.round(cost * 100) / 100
    };
  });
}
