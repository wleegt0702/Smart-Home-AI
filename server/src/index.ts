import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase, seedDefaultDevices, seedDefaultRules } from './models/database.js';
import deviceRoutes from './routes/deviceRoutes.js';
import weatherRoutes from './routes/weatherRoutes.js';
import rulesRoutes from './routes/rulesRoutes.js';
import advisorRoutes from './routes/advisorRoutes.js';
import plansRoutes from './routes/plansRoutes.js';
import { scrapeElectricityPlans } from './services/electricityPlanService.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

/**
 * Middleware
 */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Request logging middleware
 */
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

/**
 * API Routes
 */
app.use('/api/devices', deviceRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/rules', rulesRoutes);
app.use('/api/advisor', advisorRoutes);
app.use('/api/plans', plansRoutes);

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

/**
 * Root endpoint
 */
app.get('/', (req, res) => {
  res.json({
    message: 'Smart Home AI Backend Server',
    version: '1.0.0',
    endpoints: {
      devices: '/api/devices',
      weather: '/api/weather',
      rules: '/api/rules',
      advisor: '/api/advisor',
      plans: '/api/plans'
    }
  });
});

/**
 * Error handling middleware
 */
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

/**
 * 404 handler
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

/**
 * Initialize database and start server
 */
async function startServer() {
  try {
    console.log('🔧 Initializing database...');
    initializeDatabase();
    seedDefaultDevices();
    seedDefaultRules();
    
    console.log('📊 Loading electricity plans...');
    await scrapeElectricityPlans();
    
    app.listen(PORT, () => {
      console.log(`\n✅ Smart Home AI Backend Server is running!`);
      console.log(`📍 Server: http://localhost:${PORT}`);
      console.log(`🏥 Health: http://localhost:${PORT}/health`);
      console.log(`\n📚 API Endpoints:`);
      console.log(`   - Devices:  http://localhost:${PORT}/api/devices`);
      console.log(`   - Weather:  http://localhost:${PORT}/api/weather`);
      console.log(`   - Rules:    http://localhost:${PORT}/api/rules`);
      console.log(`   - Advisor:  http://localhost:${PORT}/api/advisor`);
      console.log(`   - Plans:    http://localhost:${PORT}/api/plans`);
      console.log(`\n🚀 Ready to accept requests!\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
