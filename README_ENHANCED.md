# Smart Energy AI Dashboard - Enhanced Version

A comprehensive smart home energy management system with AI-powered automation, real-time weather integration, conversational energy advisor, and electricity plan comparison.

## 🌟 New Features

### 1. **Device Onboarding Process**
- Icon-based, family-friendly interface for adding new devices
- Auto-detection capability for network-connected devices
- Visual confirmation when devices are successfully added
- Support for multiple device types (lights, AC, vacuum, kettle, blinds, plugs, fans, heaters, locks, cameras, speakers, TVs)

### 2. **Enhanced Weather Dashboard**
- Real-time weather data from OpenWeatherMap API
- 5-day weather forecast
- Energy impact analysis based on weather conditions
- Weather-energy consumption correlation visualization
- Smart automation suggestions based on current conditions

### 3. **Agentic AI Rules System**
- Natural language rule builder powered by OpenAI
- Create custom automation rules in plain English
- Enable/disable rules with a simple toggle
- Rule execution logging and history
- Pre-built rule templates

**Example Rules:**
- "Turn off all lights when no one is home"
- "Reduce AC usage when electricity prices are high"
- "Turn on the water heater 30 minutes before typical shower times"
- "Close blinds when temperature exceeds 32°C"

### 4. **AI Energy Advisor**
- Conversational AI assistant for energy optimization
- Ask questions about your energy usage
- Personalized recommendations based on usage patterns
- Energy insights and statistics dashboard
- Proactive notifications about unusual consumption
- Behavioral change suggestions

### 5. **Electricity Plan Comparison Tool**
- Compare electricity plans from Singapore providers
- Personalized recommendations based on actual usage
- Calculate potential savings with different plans
- Filter by renewable energy, contract length, and more
- Real-time plan data from major providers:
  - SP Group
  - Geneco
  - Keppel Electric
  - Senoko Energy
  - iSwitch
  - Ohm Energy
  - Sunseap Energy
  - Tuas Power
  - PacificLight

## 🏗️ Architecture

### Frontend (React + TypeScript + Vite)
```
/components
  - Dashboard.tsx              # Main device control dashboard
  - DeviceOnboarding.tsx       # Device onboarding flow
  - WeatherDashboard.tsx       # Weather and energy correlation
  - RulesManager.tsx           # Automation rules management
  - EnergyAdvisor.tsx          # AI conversational assistant
  - PlanComparison.tsx         # Electricity plan comparison
  - DeviceCard.tsx             # Individual device control
  - ImageGenerator.tsx         # AI image generation
  - VideoGenerator.tsx         # AI video generation
  - icons/Icons.tsx            # Icon components
```

### Backend (Express + TypeScript + SQLite)
```
/server/src
  /controllers
    - deviceController.ts      # Device management
    - weatherController.ts     # Weather API integration
    - rulesController.ts       # Automation rules
    - advisorController.ts     # AI energy advisor
    - plansController.ts       # Electricity plans
  
  /services
    - aiService.ts             # OpenAI integration
    - weatherService.ts        # OpenWeatherMap integration
    - electricityPlanService.ts # Plan scraping and comparison
  
  /models
    - database.ts              # SQLite database setup
  
  /routes
    - deviceRoutes.ts
    - weatherRoutes.ts
    - rulesRoutes.ts
    - advisorRoutes.ts
    - plansRoutes.ts
```

### Database Schema (SQLite)
- **devices** - Smart home devices
- **automation_rules** - User-defined automation rules
- **rule_logs** - Rule execution history
- **energy_usage** - Energy consumption tracking
- **user_settings** - User preferences
- **electricity_plans** - Electricity plan data
- **advisor_conversations** - AI advisor chat history

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- OpenAI API key
- OpenWeatherMap API key (free tier available)

### Installation

1. **Clone the repository**
```bash
cd Smart-Home-AI
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Install backend dependencies**
```bash
cd server
npm install
cd ..
```

4. **Set up environment variables**

Create `server/.env` file:
```env
PORT=3001
OPENAI_API_KEY=your_openai_api_key_here
OPENWEATHER_API_KEY=your_openweather_api_key_here
```

5. **Start the backend server**
```bash
cd server
npm run dev
```

The server will start on `http://localhost:3001`

6. **Start the frontend (in a new terminal)**
```bash
npm run dev
```

The app will open at `http://localhost:5173`

## 📝 API Endpoints

### Devices
- `GET /api/devices` - Get all devices
- `GET /api/devices/types` - Get supported device types
- `GET /api/devices/discover` - Auto-detect devices
- `POST /api/devices` - Add new device
- `PUT /api/devices/:id/status` - Update device status
- `PUT /api/devices/:id/value` - Update device value
- `DELETE /api/devices/:id` - Delete device

### Weather
- `GET /api/weather/current` - Get current weather and energy impact
- `GET /api/weather/forecast` - Get 5-day forecast
- `GET /api/weather/energy-correlation` - Get weather-energy correlation

### Automation Rules
- `GET /api/rules` - Get all rules
- `POST /api/rules/natural` - Create rule from natural language
- `POST /api/rules` - Create rule manually
- `PUT /api/rules/:id/toggle` - Toggle rule on/off
- `DELETE /api/rules/:id` - Delete rule
- `GET /api/rules/logs/all` - Get rule execution logs

### AI Energy Advisor
- `POST /api/advisor/chat` - Chat with AI advisor
- `GET /api/advisor/recommendations` - Get personalized recommendations
- `GET /api/advisor/insights` - Get energy insights and statistics
- `GET /api/advisor/unusual` - Check for unusual consumption

### Electricity Plans
- `GET /api/plans` - Get all available plans
- `GET /api/plans/compare` - Compare plans based on usage
- `GET /api/plans/recommendations` - Get recommended plans
- `GET /api/plans/statistics` - Get plan statistics
- `POST /api/plans/refresh` - Refresh plan data

## 🎯 Usage Examples

### Adding a Device
1. Click "Add Device" button in the header
2. Choose "Auto-Detect" or "Manual Setup"
3. For auto-detect: Select discovered device
4. For manual: Choose device type, enter name and room
5. Device is added and appears in dashboard

### Creating an Automation Rule
1. Go to "Rules" tab
2. Click "Create Rule"
3. Type your rule in plain English, e.g.:
   - "Turn off all lights when no one is home"
   - "Set AC to 24°C when temperature exceeds 30°C"
4. AI converts it to a structured rule
5. Rule is activated automatically

### Chatting with AI Energy Advisor
1. Go to "AI Advisor" tab
2. Type your question, e.g.:
   - "How can I reduce my energy bill?"
   - "Why is my consumption higher this month?"
   - "What automation rules would you recommend?"
3. Get personalized advice based on your usage

### Comparing Electricity Plans
1. Go to "Plans" tab
2. Set your monthly usage (default: 400 kWh)
3. Adjust filters (renewable preference, contract length)
4. View ranked plans with savings calculations
5. Click "View Details" to visit provider website

## 🔧 Configuration

### Weather API
The app uses OpenWeatherMap API. Get a free API key at https://openweathermap.org/api

### OpenAI API
The app uses OpenAI's GPT-4 models for:
- Natural language rule parsing
- Energy advisor conversations
- Unusual consumption analysis

Get an API key at https://platform.openai.com/api-keys

### Customizing Device Types
Edit `server/src/controllers/deviceController.ts` to add new device types.

### Customizing Electricity Providers
Edit `server/src/services/electricityPlanService.ts` to add or update electricity plan data.

## 📊 Database

The app uses SQLite for data persistence. The database file is created at `server/data/smarthome.db`.

To reset the database, simply delete this file and restart the server.

## 🛠️ Development

### Frontend Development
```bash
npm run dev
```

### Backend Development
```bash
cd server
npm run dev
```

### Building for Production

Frontend:
```bash
npm run build
```

Backend:
```bash
cd server
npm run build
npm start
```

## 🌐 Deployment

### Frontend
Deploy to Vercel, Netlify, or any static hosting service.

### Backend
Deploy to:
- Railway
- Render
- Heroku
- DigitalOcean App Platform
- AWS EC2

Make sure to set environment variables in your deployment platform.

## 🔐 Security Notes

- Never commit `.env` files
- Keep API keys secure
- Use environment variables for sensitive data
- Implement rate limiting for production
- Add authentication for multi-user scenarios

## 📈 Future Enhancements

- [ ] Real device integration (Home Assistant, Google Home)
- [ ] Mobile app (React Native)
- [ ] Voice control (Gemini Live API)
- [ ] Multi-user support with authentication
- [ ] Real-time energy monitoring with smart meters
- [ ] Machine learning for predictive automation
- [ ] Integration with solar panels
- [ ] Carbon footprint tracking

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- OpenAI for GPT models
- OpenWeatherMap for weather data
- Singapore electricity providers for plan information
- React and TypeScript communities

## 📧 Support

For issues or questions, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ for smarter, more efficient homes**
