import express from 'express';
import { getCurrent, getForecast, getEnergyCorrelation } from '../controllers/weatherController.js';

const router = express.Router();

/**
 * Weather Routes
 * 
 * GET /api/weather/current          - Get current weather and energy impact
 * GET /api/weather/forecast         - Get 5-day weather forecast
 * GET /api/weather/energy-correlation - Get weather-energy correlation data
 */

router.get('/current', getCurrent);
router.get('/forecast', getForecast);
router.get('/energy-correlation', getEnergyCorrelation);

export default router;
