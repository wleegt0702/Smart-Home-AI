# API Keys Setup Guide

This guide will help you get the free API keys needed for your Smart Energy AI application.

---

## 🔑 Required API Keys

You need **2 API keys** - both are **FREE** and **no credit card required**!

1. **Google Gemini API Key** - For AI features (rules, advisor)
2. **OpenWeatherMap API Key** - For weather data

---

## 1. Google Gemini API Key (FREE)

### What it's used for:
- Natural language automation rules
- AI Energy Advisor conversations
- Energy-saving recommendations
- Unusual consumption analysis

### How to get it:

**Step 1:** Go to Google AI Studio
- Visit: https://aistudio.google.com/

**Step 2:** Sign in
- Use your Google account (Gmail)
- No payment method required!

**Step 3:** Get API Key
- Click **"Get API key"** button (top right)
- Click **"Create API key"**
- Select a Google Cloud project (or create new one)
- Click **"Create API key in new project"** if you don't have one

**Step 4:** Copy Your Key
- Your API key will look like: `AIzaSyB...` (39 characters)
- Copy it immediately!
- Save it somewhere safe

### Free Tier Limits:
- ✅ **15 requests per minute**
- ✅ **1 million tokens per day**
- ✅ **1,500 requests per day**
- ✅ More than enough for personal use!

---

## 2. OpenWeatherMap API Key (FREE)

### What it's used for:
- Current weather conditions
- 5-day weather forecast
- Temperature, humidity, wind data
- Weather-energy correlation

### How to get it:

**Step 1:** Go to OpenWeatherMap
- Visit: https://openweathermap.org/api

**Step 2:** Sign Up
- Click **"Sign Up"** (top right)
- Fill in your details:
  - Username
  - Email
  - Password
- Agree to terms
- Click **"Create Account"**

**Step 3:** Verify Email
- Check your email inbox
- Click the verification link

**Step 4:** Get Your API Key
- After login, go to: https://home.openweathermap.org/api_keys
- You'll see a default API key already created
- Copy the key (32 characters)

**Step 5:** Wait for Activation
- New API keys take **10 minutes to 2 hours** to activate
- You can start using it after activation

### Free Tier Limits:
- ✅ **60 calls per minute**
- ✅ **1,000,000 calls per month**
- ✅ Current weather + 5-day forecast included
- ✅ Perfect for your app!

---

## 3. Add Keys to Your Application

### For Local Development:

1. **Navigate to server directory:**
```bash
cd Smart-Home-AI/server
```

2. **Create .env file:**
```bash
cp .env.example .env
```

3. **Edit .env file:**
```bash
nano .env
```

4. **Add your keys:**
```env
PORT=3001

# Google Gemini API Key
GEMINI_API_KEY=AIzaSyB_your_actual_key_here

# OpenWeatherMap API Key
OPENWEATHER_API_KEY=your_actual_key_here
```

5. **Save and exit:**
- Press `Ctrl + X`
- Press `Y` to confirm
- Press `Enter`

### For Render Deployment:

When deploying to Render, add these as **Environment Variables**:

1. **GEMINI_API_KEY** = `your_gemini_key`
2. **OPENWEATHER_API_KEY** = `your_openweather_key`
3. **PORT** = `3001`

---

## 🔒 Security Best Practices

### DO:
- ✅ Keep API keys in `.env` file (never commit to Git)
- ✅ Add `.env` to `.gitignore`
- ✅ Use environment variables in production
- ✅ Regenerate keys if accidentally exposed

### DON'T:
- ❌ Share API keys publicly
- ❌ Commit `.env` file to GitHub
- ❌ Hardcode keys in source code
- ❌ Use production keys for testing

---

## 🧪 Testing Your Keys

### Test Gemini API Key:

```bash
curl https://generativelanguage.googleapis.com/v1/models?key=YOUR_GEMINI_KEY
```

If it works, you'll see a list of available models.

### Test OpenWeatherMap API Key:

```bash
curl "https://api.openweathermap.org/data/2.5/weather?q=Singapore&appid=YOUR_OPENWEATHER_KEY"
```

If it works, you'll see Singapore weather data in JSON format.

---

## 💰 Cost Comparison

### Google Gemini:
- **Free Tier:** 15 requests/min, 1M tokens/day
- **Paid Tier:** Not needed for personal use
- **Your Usage:** ~100-500 requests/day
- **Cost:** **$0/month** ✅

### OpenWeatherMap:
- **Free Tier:** 60 calls/min, 1M calls/month
- **Paid Tier:** Starts at $40/month (not needed)
- **Your Usage:** ~50-200 calls/day
- **Cost:** **$0/month** ✅

**Total Monthly Cost: $0** 🎉

---

## ❓ Troubleshooting

### Gemini API Key Issues:

**Error: "API key not valid"**
- Make sure you copied the entire key
- Check for extra spaces
- Key should start with `AIza`

**Error: "Quota exceeded"**
- Free tier: 15 requests/minute
- Wait a minute and try again
- Consider caching responses

### OpenWeatherMap Issues:

**Error: "Invalid API key"**
- Wait 10 minutes - 2 hours for activation
- Check you're using the correct key
- Verify email is confirmed

**Error: "401 Unauthorized"**
- API key not activated yet
- Check your email for verification link
- Try again in 30 minutes

---

## 📚 Additional Resources

### Google Gemini:
- Documentation: https://ai.google.dev/docs
- API Reference: https://ai.google.dev/api
- Pricing: https://ai.google.dev/pricing

### OpenWeatherMap:
- Documentation: https://openweathermap.org/api
- API Guide: https://openweathermap.org/guide
- FAQ: https://openweathermap.org/faq

---

## ✅ Checklist

Before deploying, make sure:

- [ ] Got Google Gemini API key from https://aistudio.google.com/
- [ ] Got OpenWeatherMap API key from https://openweathermap.org/
- [ ] Tested both keys with curl commands
- [ ] Added keys to `server/.env` file
- [ ] Confirmed `.env` is in `.gitignore`
- [ ] Keys are working in local development

---

**You're all set! Both API keys are free and will work great for your Smart Energy AI application.** 🎉

If you have any issues, refer to the troubleshooting section or check the official documentation links above.
