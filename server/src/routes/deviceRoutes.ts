import express from 'express';
import {
  getAllDevices,
  getDevice,
  addDevice,
  updateDeviceStatus,
  updateDeviceValue,
  deleteDevice,
  autoDetectDevices,
  getDeviceTypes
} from '../controllers/deviceController.js';

const router = express.Router();

/**
 * Device Routes
 * 
 * GET    /api/devices              - Get all devices
 * GET    /api/devices/types        - Get supported device types
 * GET    /api/devices/discover     - Auto-detect devices on network
 * GET    /api/devices/:id          - Get specific device
 * POST   /api/devices              - Add new device (onboarding)
 * PUT    /api/devices/:id/status   - Update device status (on/off)
 * PUT    /api/devices/:id/value    - Update device value (temp, brightness, etc.)
 * DELETE /api/devices/:id          - Delete device
 */

router.get('/types', getDeviceTypes);
router.get('/discover', autoDetectDevices);
router.get('/:id', getDevice);
router.get('/', getAllDevices);
router.post('/', addDevice);
router.put('/:id/status', updateDeviceStatus);
router.put('/:id/value', updateDeviceValue);
router.delete('/:id', deleteDevice);

export default router;
