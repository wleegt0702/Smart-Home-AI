import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory database
const db = {
  devices: [
    { id: 'light1', name: 'Living Room Light', type: 'light', status: 1, value: 75, room: 'Living Room', icon: '💡' },
    { id: 'ac1', name: 'Air Conditioner', type: 'aircon', status: 1, value: 24, room: 'Bedroom', icon: '❄️' },
    { id: 'vacuum1', name: 'Robot Vacuum', type: 'vacuum', status: 0, value: 0, room: 'Living Room', icon: '🤖' },
    { id: 'kettle1', name: 'Smart Kettle', type: 'kettle', status: 0, value: 0, room: 'Kitchen', icon: '☕' },
    { id: 'blinds1', name: 'Window Blinds', type: 'blinds', status: 1, value: 50, room: 'Bedroom', icon: '🪟' }
  ],
  rules: [
    { id: 1, name: 'Energy Saver', description: 'Turn off lights when away', enabled: 1 },
    { id: 2, name: 'Night Mode', description: 'Dim lights at 10 PM', enabled: 1 }
  ],
  plans: [],
  conversations: []
};

// Initialize Gemini AI (if API key is provided)
let geminiModel = null;
if (process.env.GEMINI_API_KEY) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  } catch (error) {
    console.log('Gemini AI not initialized:', error.message);
  }
}

// ===== ROUTES =====

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    gemini: geminiModel ? 'connected' : 'not configured',
    weather: process.env.OPENWEATHER_API_KEY ? 'configured' : 'not configured'
  });
});

// Get all devices
app.get('/api/devices', (req, res) => {
  res.json(db.devices);
});

// Get device by ID
app.get('/api/devices/:id', (req, res) => {
  const device = db.devices.find(d => d.id === req.params.id);
  if (device) {
    res.json(device);
  } else {
    res.status(404).json({ error: 'Device not found' });
  }
});

// Update device
app.put('/api/devices/:id', (req, res) => {
  const device = db.devices.find(d => d.id === req.params.id);
  if (device) {
    if (req.body.status !== undefined) device.status = req.body.status;
    if (req.body.value !== undefined) device.value = req.body.value;
    res.json(device);
  } else {
    res.status(404).json({ error: 'Device not found' });
  }
});

// Add new device
app.post('/api/devices', (req, res) => {
  const newDevice = {
    id: req.body.id || `device_${Date.now()}`,
    name: req.body.name || 'New Device',
    type: req.body.type || 'unknown',
    status: req.body.status || 0,
    value: req.body.value || 0,
    room: req.body.room || 'Unknown',
    icon: req.body.icon || '📱'
  };
  db.devices.push(newDevice);
  res.status(201).json(newDevice);
});

// Get device types
app.get('/api/devices/types', (req, res) => {
  res.json([
    { type: 'light', icon: '💡', name: 'Light' },
    { type: 'aircon', icon: '❄️', name: 'Air Conditioner' },
    { type: 'vacuum', icon: '🤖', name: 'Vacuum' },
    { type: 'kettle', icon: '☕', name: 'Kettle' },
    { type: 'blinds', icon: '🪟', name: 'Blinds' },
    { type: 'fan', icon: '🌀', name: 'Fan' },
    { type: 'heater', icon: '🔥', name: 'Heater' },
    { type: 'lock', icon: '🔒', name: 'Smart Lock' },
    { type: 'camera', icon: '📷', name: 'Camera' },
    { type: 'speaker', icon: '🔊', name: 'Speaker' },
    { type: 'tv', icon: '📺', name: 'TV' },
    { type: 'plug', icon: '🔌', name: 'Smart Plug' }
  ]);
});

// Get automation rules
app.get('/api/rules', (req, res) => {
  res.json(db.rules);
});

// Add automation rule
app.post('/api/rules', (req, res) => {
  const newRule = {
    id: db.rules.length + 1,
    name: req.body.name || 'New Rule',
    description: req.body.description || '',
    enabled: req.body.enabled !== undefined ? req.body.enabled : 1
  };
  db.rules.push(newRule);
  res.status(201).json(newRule);
});

// Parse natural language rule
app.post('/api/rules/natural', async (req, res) => {
  if (!geminiModel) {
    return res.status(503).json({ error: 'AI service not configured. Please set GEMINI_API_KEY.' });
  }

  try {
    const userInput = req.body.input;
    const prompt = `Convert this smart home rule to a simple description: "${userInput}"
    
Return ONLY a JSON object with this format:
{
  "name": "Brief rule name",
  "description": "What the rule does"
}`;

    const result = await geminiModel.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const parsed = JSON.parse(cleaned);
    
    res.json(parsed);
  } catch (error) {
    console.error('Error parsing rule:', error);
    res.status(500).json({ 
      error: 'Failed to parse rule',
      fallback: {
        name: 'Custom Rule',
        description: req.body.input
      }
    });
  }
});

// Get current weather
app.get('/api/weather/current', async (req, res) => {
  if (!process.env.OPENWEATHER_API_KEY) {
    return res.status(503).json({ error: 'Weather service not configured. Please set OPENWEATHER_API_KEY.' });
  }

  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=Singapore&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`
    );
    
    res.json({
      temperature: Math.round(response.data.main.temp),
      feels_like: Math.round(response.data.main.feels_like),
      humidity: response.data.main.humidity,
      description: response.data.weather[0].description,
      icon: response.data.weather[0].icon,
      wind_speed: response.data.wind.speed
    });
  } catch (error) {
    console.error('Weather API error:', error.message);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// Get weather forecast
app.get('/api/weather/forecast', async (req, res) => {
  if (!process.env.OPENWEATHER_API_KEY) {
    return res.status(503).json({ error: 'Weather service not configured.' });
  }

  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?q=Singapore&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`
    );
    
    const forecast = response.data.list.slice(0, 8).map(item => ({
      time: item.dt_txt,
      temperature: Math.round(item.main.temp),
      humidity: item.main.humidity,
      description: item.weather[0].description,
      icon: item.weather[0].icon
    }));
    
    res.json(forecast);
  } catch (error) {
    console.error('Forecast API error:', error.message);
    res.status(500).json({ error: 'Failed to fetch forecast' });
  }
});

// AI Energy Advisor chat
app.post('/api/advisor/chat', async (req, res) => {
  if (!geminiModel) {
    return res.status(503).json({ error: 'AI service not configured. Please set GEMINI_API_KEY.' });
  }

  try {
    const userMessage = req.body.message;
    const context = `You are an AI Energy Advisor for smart homes in Singapore. 
Help users save energy and reduce costs. Be friendly and practical.

User question: ${userMessage}`;

    const result = await geminiModel.generateContent(context);
    const response = result.response.text();
    
    res.json({ response });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

// Get electricity plans (mock data for Singapore)
app.get('/api/plans', (req, res) => {
  const mockPlans = [
    { id: 1, provider: 'SP Group', plan_name: 'Standard Plan', rate_per_kwh: 0.2834, contract_length: 0, renewable_percentage: 0 },
    { id: 2, provider: 'Geneco', plan_name: 'Fixed 24', rate_per_kwh: 0.2650, contract_length: 24, renewable_percentage: 0 },
    { id: 3, provider: 'Keppel Electric', plan_name: 'Fixed 12', rate_per_kwh: 0.2720, contract_length: 12, renewable_percentage: 0 },
    { id: 4, provider: 'Senoko Energy', plan_name: 'Green Plan', rate_per_kwh: 0.2890, contract_length: 24, renewable_percentage: 100 },
    { id: 5, provider: 'iSwitch', plan_name: 'Saver 24', rate_per_kwh: 0.2600, contract_length: 24, renewable_percentage: 0 }
  ];
  
  res.json(mockPlans);
});

// Compare electricity plans
app.post('/api/plans/compare', (req, res) => {
  const monthlyUsage = req.body.monthlyUsage || 400;
  
  const mockPlans = [
    { id: 1, provider: 'SP Group', plan_name: 'Standard Plan', rate_per_kwh: 0.2834, contract_length: 0, renewable_percentage: 0 },
    { id: 2, provider: 'Geneco', plan_name: 'Fixed 24', rate_per_kwh: 0.2650, contract_length: 24, renewable_percentage: 0 },
    { id: 3, provider: 'Keppel Electric', plan_name: 'Fixed 12', rate_per_kwh: 0.2720, contract_length: 12, renewable_percentage: 0 },
    { id: 4, provider: 'Senoko Energy', plan_name: 'Green Plan', rate_per_kwh: 0.2890, contract_length: 24, renewable_percentage: 100 },
    { id: 5, provider: 'iSwitch', plan_name: 'Saver 24', rate_per_kwh: 0.2600, contract_length: 24, renewable_percentage: 0 }
  ];
  
  const comparison = mockPlans.map(plan => ({
    ...plan,
    monthly_cost: (monthlyUsage * plan.rate_per_kwh).toFixed(2),
    annual_cost: (monthlyUsage * plan.rate_per_kwh * 12).toFixed(2)
  }));
  
  comparison.sort((a, b) => parseFloat(a.monthly_cost) - parseFloat(b.monthly_cost));
  
  res.json(comparison);
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Smart Energy AI Backend',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      devices: '/api/devices',
      rules: '/api/rules',
      weather: '/api/weather/current',
      advisor: '/api/advisor/chat',
      plans: '/api/plans'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Smart Energy AI Backend');
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Devices loaded: ${db.devices.length}`);
  console.log(`✅ Rules loaded: ${db.rules.length}`);
  console.log(`✅ Gemini AI: ${geminiModel ? 'Ready' : 'Not configured'}`);
  console.log(`✅ Weather API: ${process.env.OPENWEATHER_API_KEY ? 'Ready' : 'Not configured'}`);
  console.log('');
  console.log('📍 API Endpoints:');
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Devices: http://localhost:${PORT}/api/devices`);
  console.log(`   Rules: http://localhost:${PORT}/api/rules`);
  console.log(`   Weather: http://localhost:${PORT}/api/weather/current`);
  console.log(`   AI Chat: http://localhost:${PORT}/api/advisor/chat`);
  console.log(`   Plans: http://localhost:${PORT}/api/plans`);
});
