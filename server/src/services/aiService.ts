import OpenAI from 'openai';

/**
 * AI Service
 * Uses OpenAI API for natural language processing
 * Converts user input into structured automation rules
 */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

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
 * Parse natural language into automation rule using OpenAI
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

Return ONLY valid JSON, no additional text.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userInput }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    if (!content) return null;

    const rule = JSON.parse(content);
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
    const context = `
Current devices: ${JSON.stringify(devices)}
Current weather: ${JSON.stringify(weatherData)}
Recent energy usage: ${JSON.stringify(energyUsage)}
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an energy efficiency expert for smart homes in Singapore. 
Analyze the current state and provide 3-5 specific, actionable recommendations to reduce energy consumption.
Focus on practical advice based on Singapore's tropical climate and typical electricity rates.
Return recommendations as a JSON array of strings.`
        },
        {
          role: 'user',
          content: context
        }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    if (!content) return [];

    const result = JSON.parse(content);
    return result.recommendations || [];
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return [];
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

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...conversationHistory,
      { role: 'user' as const, content: userMessage }
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 500
    });

    return response.choices[0].message.content || 'Sorry, I could not generate a response.';
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
    const context = `
Current energy usage: ${currentUsage} kWh
Historical average: ${historicalAverage} kWh
Increase: ${((currentUsage / historicalAverage - 1) * 100).toFixed(1)}%
Active devices: ${JSON.stringify(devices.filter((d: any) => d.status))}
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are analyzing unusual energy consumption. Identify likely causes and provide suggestions.
Return a JSON object with:
{
  "message": "Brief explanation of the unusual consumption",
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
}`
        },
        {
          role: 'user',
          content: context
        }
      ],
      temperature: 0.5,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      return {
        isUnusual: true,
        message: 'Energy consumption is unusually high.',
        suggestions: ['Check for devices left on', 'Review AC temperature settings']
      };
    }

    const result = JSON.parse(content);
    return {
      isUnusual: true,
      message: result.message,
      suggestions: result.suggestions
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
