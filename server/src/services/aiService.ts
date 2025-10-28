import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * AI Service using Google Gemini
 * Uses Gemini API for natural language processing
 * Converts user input into structured automation rules
 */

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

interface AutomationRule {
  name: string;
  description: string;
  condition: {
    type: 'time' | 'temperature' | 'humidity' | 'device_state' | 'presence' | 'price';
    operator?: '>' | '<' | '=' | '>=' | '<=';
    value?: any;
    deviceId?: string;
  };
  action: Array<{
    deviceId: string;
    action: 'turnOn' | 'turnOff' | 'setValue';
    value?: number;
  }>;
}

/**
 * Parse natural language into automation rule using Google Gemini
 */
export async function parseNaturalLanguageRule(userInput: string): Promise<AutomationRule | null> {
  try {
    const systemPrompt = `You are an expert at converting natural language into structured automation rules for a smart home system.

Available device types: light, aircon, vacuum, kettle, blinds, plug, fan, heater, lock, camera, speaker, tv
Available condition types: time, temperature, humidity, device_state, presence, price
Available operators: >, <, =, >=, <=
Available actions: turnOn, turnOff, setValue

Convert the user's natural language rule into a JSON object with this structure:
{
  "name": "Short rule name",
  "description": "Detailed description",
  "condition": {
    "type": "time|temperature|humidity|device_state|presence|price",
    "operator": ">|<|=|>=|<=",
    "value": "condition value",
    "deviceId": "optional device id for device_state conditions"
  },
  "action": [
    {
      "deviceId": "device identifier (e.g., 'aircon', 'livingRoomLight')",
      "action": "turnOn|turnOff|setValue",
      "value": "optional numeric value for setValue"
    }
  ]
}

Examples:
Input: "Turn off all lights when no one is home"
Output: {
  "name": "Lights Off When Away",
  "description": "Turn off all lights when no one is home to save energy",
  "condition": { "type": "presence", "operator": "=", "value": false },
  "action": [
    { "deviceId": "livingRoomLight", "action": "turnOff" },
    { "deviceId": "neonLight", "action": "turnOff" }
  ]
}

Input: "Reduce AC usage when electricity prices are high"
Output: {
  "name": "AC Reduction on High Prices",
  "description": "Reduce AC usage when electricity prices are high",
  "condition": { "type": "price", "operator": ">", "value": 0.35 },
  "action": [
    { "deviceId": "aircon", "action": "setValue", "value": 26 }
  ]
}

Input: "Turn on the water heater 30 minutes before typical shower times"
Output: {
  "name": "Morning Heater Schedule",
  "description": "Turn on water heater at 6:30 AM for morning showers",
  "condition": { "type": "time", "value": "06:30" },
  "action": [
    { "deviceId": "kettle", "action": "turnOn" }
  ]
}

User input: ${userInput}

Return ONLY valid JSON, no additional text or markdown.`;

    const result = await model.generateContent(systemPrompt);
    const response = result.response;
    let text = response.text().trim();
    
    // Remove markdown code blocks if present
    if (text.startsWith('```json')) {
      text = text.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/```\n?/g, '').replace(/```\n?$/g, '');
    }
    
    const rule = JSON.parse(text);
    return rule;
  } catch (error) {
    console.error('Error parsing natural language rule:', error);
    return null;
  }
}

/**
 * Generate energy-saving recommendations using AI
 */
export async function generateEnergySavingRecommendations(
  devices: any[],
  weatherData: any,
  energyUsage: any[]
): Promise<string[]> {
  try {
    const prompt = `You are an energy efficiency expert for smart homes in Singapore. 
Analyze the current state and provide 3-5 specific, actionable recommendations to reduce energy consumption.
Focus on practical advice based on Singapore's tropical climate and typical electricity rates.

Current devices: ${JSON.stringify(devices)}
Current weather: ${JSON.stringify(weatherData)}
Recent energy usage: ${JSON.stringify(energyUsage)}

Return ONLY a JSON object with this structure (no markdown):
{
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    let text = response.text().trim();
    
    // Remove markdown code blocks if present
    if (text.startsWith('```json')) {
      text = text.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/```\n?/g, '').replace(/```\n?$/g, '');
    }
    
    const parsed = JSON.parse(text);
    return parsed.recommendations || [];
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return [
      'Set AC temperature to 25-26°C to balance comfort and efficiency',
      'Use natural ventilation when outdoor temperature is comfortable',
      'Schedule high-power devices during off-peak hours'
    ];
  }
}

/**
 * Chat with AI Energy Advisor
 */
export async function chatWithEnergyAdvisor(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  context: {
    devices: any[];
    weather: any;
    energyUsage: any[];
  }
): Promise<string> {
  try {
    const systemPrompt = `You are an AI Energy Advisor for a smart home system in Singapore.

Your role:
- Help users understand their energy consumption
- Provide personalized recommendations to reduce energy costs
- Explain how weather affects energy usage
- Suggest behavioral changes and automation rules
- Answer questions about their devices and usage patterns

Context about the user's home:
Devices: ${JSON.stringify(context.devices)}
Current weather: ${JSON.stringify(context.weather)}
Recent energy usage: ${JSON.stringify(context.energyUsage)}

Singapore-specific information:
- Tropical climate, average temp 26-32°C
- High humidity year-round
- Electricity rates: ~SGD $0.25-0.35 per kWh
- Peak hours typically 7-11 PM
- AC is the biggest energy consumer in most homes

Be friendly, concise, and practical. Use Singapore dollars (SGD) for cost estimates.`;

    // Build conversation history
    let conversationText = systemPrompt + '\n\n';
    conversationHistory.forEach(msg => {
      conversationText += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
    });
    conversationText += `User: ${userMessage}\nAssistant:`;

    const result = await model.generateContent(conversationText);
    const response = result.response;
    return response.text() || 'Sorry, I could not generate a response.';
  } catch (error) {
    console.error('Error in chat:', error);
    return 'Sorry, I encountered an error. Please try again.';
  }
}

/**
 * Analyze unusual energy consumption patterns
 */
export async function analyzeUnusualConsumption(
  currentUsage: number,
  historicalAverage: number,
  devices: any[]
): Promise<{ isUnusual: boolean; message: string; suggestions: string[] }> {
  const threshold = 1.3; // 30% above average
  const isUnusual = currentUsage > historicalAverage * threshold;

  if (!isUnusual) {
    return {
      isUnusual: false,
      message: 'Energy consumption is within normal range.',
      suggestions: []
    };
  }

  try {
    const prompt = `You are analyzing unusual energy consumption. Identify likely causes and provide suggestions.

Current energy usage: ${currentUsage} kWh
Historical average: ${historicalAverage} kWh
Increase: ${((currentUsage / historicalAverage - 1) * 100).toFixed(1)}%
Active devices: ${JSON.stringify(devices.filter((d: any) => d.status))}

Return ONLY a JSON object with this structure (no markdown):
{
  "message": "Brief explanation of the unusual consumption",
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    let text = response.text().trim();
    
    // Remove markdown code blocks if present
    if (text.startsWith('```json')) {
      text = text.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/```\n?/g, '').replace(/```\n?$/g, '');
    }
    
    const parsed = JSON.parse(text);
    return {
      isUnusual: true,
      message: parsed.message,
      suggestions: parsed.suggestions
    };
  } catch (error) {
    console.error('Error analyzing consumption:', error);
    return {
      isUnusual: true,
      message: 'Energy consumption is unusually high.',
      suggestions: ['Check for devices left on', 'Review AC temperature settings']
    };
  }
}
