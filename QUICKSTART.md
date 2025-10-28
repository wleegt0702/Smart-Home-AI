# Quick Start Guide - Smart Energy AI

Get your Smart Energy AI application running in 5 minutes!

## Prerequisites

- Node.js 18+ installed ([Download here](https://nodejs.org/))
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- OpenWeatherMap API key ([Get free key here](https://openweathermap.org/api))

## Installation Steps

### 1. Run Setup Script

```bash
./setup.sh
```

This will:
- Install all frontend and backend dependencies
- Create necessary directories
- Set up environment configuration template

### 2. Configure API Keys

Edit `server/.env` and add your API keys:

```env
PORT=3001
OPENAI_API_KEY=sk-your-openai-key-here
OPENWEATHER_API_KEY=your-openweather-key-here
```

### 3. Start the Backend Server

Open a terminal and run:

```bash
cd server
npm run dev
```

You should see:
```
✅ Smart Home AI Backend Server is running!
📍 Server: http://localhost:3001
```

### 4. Start the Frontend

Open a **new terminal** and run:

```bash
npm run dev
```

The app will open at: http://localhost:5173

## First Steps

### 1. Explore the Dashboard
- View your default devices (lights, AC, vacuum, etc.)
- Toggle devices on/off
- Adjust device values (temperature, brightness)

### 2. Check the Weather
- Click "Weather" tab
- View current conditions and forecast
- See energy impact analysis
- Check weather-energy correlation

### 3. Create an Automation Rule
- Click "Rules" tab
- Click "Create Rule"
- Try: "Turn off all lights when no one is home"
- Watch AI convert it to a working rule!

### 4. Chat with AI Advisor
- Click "AI Advisor" tab
- Ask: "How can I reduce my energy bill?"
- Get personalized recommendations
- View energy insights

### 5. Compare Electricity Plans
- Click "Plans" tab
- Set your monthly usage (e.g., 400 kWh)
- View ranked plans with savings
- Filter by preferences

### 6. Add a New Device
- Click "Add Device" button (top right)
- Choose "Manual Setup"
- Select device type (e.g., Smart Plug)
- Enter name and room
- Device appears in dashboard!

## Common Issues

### Backend won't start
- Make sure you've added API keys to `server/.env`
- Check if port 3001 is available
- Run `cd server && npm install` again

### Frontend won't start
- Check if backend is running first
- Run `npm install` again
- Clear browser cache

### API errors
- Verify your API keys are correct
- Check your OpenAI account has credits
- Ensure OpenWeatherMap key is activated

### Database errors
- Delete `server/data/smarthome.db`
- Restart the backend server

## Features Overview

### 🏠 Dashboard
- Control all your smart devices
- Real-time status updates
- Device grouping by room

### 🌤️ Weather
- Current weather and 5-day forecast
- Energy impact analysis
- Smart automation suggestions

### ⚡ Rules
- Natural language rule creation
- Enable/disable rules
- Execution history logs

### 💡 AI Advisor
- Conversational energy assistant
- Personalized recommendations
- Usage insights and statistics

### 📊 Plans
- Compare electricity providers
- Calculate potential savings
- Filter by preferences

### 🎨 Image/Video Gen
- AI-powered image generation
- Video creation from images
- Creative content tools

## Next Steps

1. **Customize your devices**: Add your actual smart home devices
2. **Create automation rules**: Set up rules for your lifestyle
3. **Optimize energy usage**: Follow AI advisor recommendations
4. **Compare plans**: Find the best electricity plan for you
5. **Explore advanced features**: Check README_ENHANCED.md

## Getting Help

- Read the full documentation: `README_ENHANCED.md`
- Check API documentation in the README
- Review code comments for implementation details

## Tips for Beginners

1. **Start simple**: Begin with the dashboard and basic device control
2. **Try examples**: Use the example rules provided in the Rules tab
3. **Ask questions**: The AI Advisor is very helpful for learning
4. **Experiment**: All changes are stored in a local database, safe to test
5. **Check logs**: Backend terminal shows useful debugging information

## Development Tips

### Hot Reload
Both frontend and backend support hot reload:
- Frontend: Changes auto-refresh in browser
- Backend: Server restarts automatically on code changes

### Debugging
- Frontend: Open browser DevTools (F12)
- Backend: Check terminal output for logs
- Database: Use SQLite browser to view `server/data/smarthome.db`

### Making Changes
- Frontend components: Edit files in `/components`
- Backend logic: Edit files in `/server/src`
- Database schema: Modify `/server/src/models/database.ts`
- API routes: Update files in `/server/src/routes`

## Production Deployment

When ready to deploy:

1. Build frontend: `npm run build`
2. Build backend: `cd server && npm run build`
3. Deploy to your hosting service
4. Set environment variables in hosting platform
5. Use production database (PostgreSQL recommended)

## Support

Need help? 
- Check the README_ENHANCED.md for detailed docs
- Review the codebase - it's well-commented!
- Open an issue on GitHub

---

**Happy energy saving! 🌱⚡**
