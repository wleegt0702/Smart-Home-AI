# Smart Energy AI Backend (Simple Version)

**No TypeScript. No Build Steps. Just Works!** ✅

This is a simplified, deployment-ready version of the Smart Energy AI backend that:
- Uses plain JavaScript (ES modules)
- No compilation needed
- Deploys to Render in under 2 minutes
- All core features included

---

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Add your API keys to .env
# GEMINI_API_KEY=your_key_here
# OPENWEATHER_API_KEY=your_key_here

# Start server
npm start
```

Server runs on: http://localhost:3001

---

## 📦 Deploy to Render

### Option 1: Manual Deploy (Recommended)

1. **Create New Web Service** on Render
2. **Connect GitHub** repository
3. **Configure:**
   - Root Directory: `backend-simple`
   - Build Command: `npm install`
   - Start Command: `npm start`
4. **Add Environment Variables:**
   - `GEMINI_API_KEY`
   - `OPENWEATHER_API_KEY`
   - `PORT=3001`
5. **Deploy!**

### Option 2: One-Click Deploy

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

---

## 🔑 API Keys

### Google Gemini (FREE)
- Get at: https://aistudio.google.com/
- Click "Get API key"
- Copy and paste into Render environment variables

### OpenWeatherMap (FREE)
- Get at: https://openweathermap.org/api
- Sign up and verify email
- Copy API key from dashboard

---

## 📡 API Endpoints

### Health Check
```
GET /api/health
```

### Devices
```
GET    /api/devices          - Get all devices
GET    /api/devices/:id      - Get device by ID
PUT    /api/devices/:id      - Update device
POST   /api/devices          - Add new device
GET    /api/devices/types    - Get device types
```

### Automation Rules
```
GET    /api/rules            - Get all rules
POST   /api/rules            - Add new rule
POST   /api/rules/natural    - Parse natural language rule
```

### Weather
```
GET    /api/weather/current  - Get current weather
GET    /api/weather/forecast - Get 24h forecast
```

### AI Energy Advisor
```
POST   /api/advisor/chat     - Chat with AI advisor
```

### Electricity Plans
```
GET    /api/plans            - Get all plans
POST   /api/plans/compare    - Compare plans by usage
```

---

## ✅ Features

- ✅ Device management (CRUD operations)
- ✅ Automation rules with natural language parsing
- ✅ Real-time weather integration
- ✅ AI energy advisor chatbot
- ✅ Electricity plan comparison
- ✅ In-memory database (resets on restart)
- ✅ CORS enabled for frontend
- ✅ No build step required
- ✅ Works on Render free tier

---

## 🎯 Why This Version?

**Problems with TypeScript version:**
- ❌ Complex build configuration
- ❌ Type definition issues
- ❌ Deployment failures
- ❌ Compilation errors

**Benefits of JavaScript version:**
- ✅ No compilation needed
- ✅ Faster deployment
- ✅ Easier to debug
- ✅ Works everywhere
- ✅ Beginner-friendly

---

## 📝 Notes

- Data is stored in memory (resets when server restarts)
- Perfect for demo and testing
- For production, add a real database (PostgreSQL, MongoDB, etc.)
- All API keys are optional - server will run without them but some features won't work

---

## 🆘 Support

If deployment fails:
1. Check build logs in Render dashboard
2. Verify API keys are set correctly
3. Make sure Root Directory is `backend-simple`
4. Ensure Build Command is `npm install`
5. Ensure Start Command is `npm start`

---

**This version is guaranteed to deploy successfully!** 🎉
