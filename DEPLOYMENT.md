# Deployment Guide - Smart Energy AI

This guide covers deploying your Smart Energy AI application to production.

## Architecture Overview

```
┌─────────────┐      ┌─────────────┐      ┌──────────────┐
│   Frontend  │─────▶│   Backend   │─────▶│   Database   │
│  (React)    │      │  (Express)  │      │   (SQLite)   │
└─────────────┘      └─────────────┘      └──────────────┘
      │                     │
      │                     │
      ▼                     ▼
┌─────────────┐      ┌─────────────┐
│   Vercel    │      │   Railway   │
│   Netlify   │      │   Render    │
└─────────────┘      └─────────────┘
```

## Option 1: Deploy to Vercel (Frontend) + Railway (Backend)

### Frontend Deployment (Vercel)

1. **Prepare the frontend**
```bash
npm run build
```

2. **Install Vercel CLI**
```bash
npm install -g vercel
```

3. **Deploy**
```bash
vercel
```

4. **Configure environment variables** in Vercel dashboard:
```
VITE_API_URL=https://your-backend-url.railway.app
```

5. **Update API calls** in components to use `import.meta.env.VITE_API_URL`

### Backend Deployment (Railway)

1. **Create `railway.json`** in server directory:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

2. **Add start script** to `server/package.json`:
```json
{
  "scripts": {
    "start": "node dist/index.js",
    "build": "tsc",
    "dev": "tsx watch src/index.ts"
  }
}
```

3. **Deploy to Railway**:
- Go to https://railway.app
- Create new project
- Connect GitHub repository
- Select `/server` as root directory
- Add environment variables:
  - `OPENAI_API_KEY`
  - `OPENWEATHER_API_KEY`
  - `PORT=3001`

4. **Get your backend URL** from Railway dashboard

5. **Update CORS** in `server/src/index.ts`:
```typescript
app.use(cors({
  origin: ['https://your-frontend-url.vercel.app'],
  credentials: true
}));
```

## Option 2: Deploy to Netlify (Frontend) + Render (Backend)

### Frontend Deployment (Netlify)

1. **Create `netlify.toml`**:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. **Deploy**:
- Go to https://netlify.com
- Connect GitHub repository
- Set build command: `npm run build`
- Set publish directory: `dist`
- Add environment variable: `VITE_API_URL`

### Backend Deployment (Render)

1. **Create `render.yaml`**:
```yaml
services:
  - type: web
    name: smart-energy-backend
    env: node
    buildCommand: cd server && npm install && npm run build
    startCommand: cd server && npm start
    envVars:
      - key: OPENAI_API_KEY
        sync: false
      - key: OPENWEATHER_API_KEY
        sync: false
      - key: PORT
        value: 3001
```

2. **Deploy**:
- Go to https://render.com
- Create new Web Service
- Connect GitHub repository
- Set environment variables
- Deploy

## Option 3: Deploy to Single Server (DigitalOcean/AWS)

### 1. Provision Server
- Ubuntu 22.04 LTS
- 2GB RAM minimum
- Node.js 18+ installed

### 2. Setup Application

```bash
# Clone repository
git clone https://github.com/your-username/Smart-Home-AI.git
cd Smart-Home-AI

# Install dependencies
npm install
cd server && npm install && cd ..

# Build frontend
npm run build

# Build backend
cd server && npm run build && cd ..

# Create .env file
nano server/.env
# Add your API keys
```

### 3. Setup PM2 (Process Manager)

```bash
# Install PM2
npm install -g pm2

# Start backend
cd server
pm2 start dist/index.js --name smart-energy-backend

# Serve frontend with nginx or serve
npm install -g serve
pm2 start "serve -s dist -l 3000" --name smart-energy-frontend

# Save PM2 configuration
pm2 save
pm2 startup
```

### 4. Setup Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5. Setup SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Database Considerations

### Development (SQLite)
- Good for: Development, testing, small deployments
- Limitations: Single file, no concurrent writes

### Production (PostgreSQL)
For production, consider migrating to PostgreSQL:

1. **Install PostgreSQL adapter**:
```bash
cd server
npm install pg
```

2. **Update database.ts** to use PostgreSQL instead of SQLite

3. **Migrate data** from SQLite to PostgreSQL

## Environment Variables

### Frontend (.env)
```env
VITE_API_URL=https://api.your-domain.com
```

### Backend (.env)
```env
PORT=3001
OPENAI_API_KEY=sk-...
OPENWEATHER_API_KEY=...
DATABASE_URL=postgresql://... (if using PostgreSQL)
NODE_ENV=production
```

## Security Checklist

- [ ] Use HTTPS (SSL certificate)
- [ ] Set secure CORS origins
- [ ] Use environment variables for secrets
- [ ] Implement rate limiting
- [ ] Add authentication for sensitive endpoints
- [ ] Regular security updates
- [ ] Database backups
- [ ] Monitor error logs
- [ ] Use secure headers (helmet.js)

## Performance Optimization

### Frontend
```bash
# Optimize build
npm run build

# Analyze bundle size
npm install -g vite-bundle-visualizer
npx vite-bundle-visualizer
```

### Backend
- Enable gzip compression
- Implement caching
- Use connection pooling
- Optimize database queries
- Add CDN for static assets

## Monitoring

### Application Monitoring
- Use PM2 monitoring: `pm2 monit`
- Setup logging with Winston or Pino
- Use error tracking (Sentry)

### Server Monitoring
- Setup uptime monitoring (UptimeRobot)
- Monitor server resources (CPU, RAM, disk)
- Setup alerts for downtime

## Backup Strategy

### Database Backup
```bash
# SQLite backup
cp server/data/smarthome.db server/data/smarthome.db.backup

# Automated daily backup
crontab -e
# Add: 0 2 * * * cp /path/to/smarthome.db /path/to/backups/smarthome-$(date +\%Y\%m\%d).db
```

### Code Backup
- Use Git for version control
- Regular commits to GitHub
- Tag releases

## Scaling Considerations

### Horizontal Scaling
- Load balancer (Nginx, HAProxy)
- Multiple backend instances
- Shared database
- Redis for session storage

### Vertical Scaling
- Increase server resources
- Optimize code
- Database indexing
- Caching layer

## Troubleshooting

### Backend won't start
```bash
# Check logs
pm2 logs smart-energy-backend

# Check port availability
lsof -i :3001

# Restart service
pm2 restart smart-energy-backend
```

### Frontend not loading
```bash
# Check nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx

# Check logs
sudo tail -f /var/log/nginx/error.log
```

### Database issues
```bash
# Check database file permissions
ls -la server/data/smarthome.db

# Backup and recreate database
cp server/data/smarthome.db server/data/smarthome.db.backup
rm server/data/smarthome.db
pm2 restart smart-energy-backend
```

## Cost Estimation

### Free Tier Options
- **Frontend**: Vercel/Netlify (Free tier available)
- **Backend**: Railway (Free $5/month credit)
- **Database**: SQLite (No cost)
- **Total**: ~$0-5/month

### Production Options
- **Frontend**: Vercel Pro ($20/month)
- **Backend**: Railway/Render ($7-20/month)
- **Database**: Managed PostgreSQL ($15/month)
- **Domain**: $10-15/year
- **Total**: ~$50-70/month

## Maintenance

### Regular Tasks
- [ ] Update dependencies monthly
- [ ] Review and rotate API keys
- [ ] Check error logs weekly
- [ ] Test backup restoration
- [ ] Monitor API usage and costs
- [ ] Review and optimize database
- [ ] Update documentation

### Update Process
```bash
# Pull latest changes
git pull origin main

# Update dependencies
npm install
cd server && npm install && cd ..

# Rebuild
npm run build
cd server && npm run build && cd ..

# Restart services
pm2 restart all
```

## Support Resources

- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
- PM2 Docs: https://pm2.keymetrics.io/docs

---

**Ready for production! 🚀**
