import { Request, Response } from 'express';
import { db } from '../models/database.js';

/**
 * Device Controller
 * Handles all device-related operations including onboarding, control, and management
 */

interface Device {
  id: string;
  name: string;
  type: string;
  status: number;
  value?: number;
  room?: string;
  icon?: string;
}

/**
 * Get all devices
 */
export const getAllDevices = (req: Request, res: Response) => {
  try {
    const devices = db.prepare('SELECT * FROM devices ORDER BY room, name').all();
    res.json({ success: true, devices });
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch devices' });
  }
};

/**
 * Get a single device by ID
 */
export const getDevice = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const device = db.prepare('SELECT * FROM devices WHERE id = ?').get(id);
    
    if (!device) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }
    
    res.json({ success: true, device });
  } catch (error) {
    console.error('Error fetching device:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch device' });
  }
};

/**
 * Add a new device (Device Onboarding)
 */
export const addDevice = (req: Request, res: Response) => {
  try {
    const { id, name, type, room, icon } = req.body;

    // Validate required fields
    if (!id || !name || !type) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: id, name, and type are required' 
      });
    }

    // Check if device already exists
    const existing = db.prepare('SELECT id FROM devices WHERE id = ?').get(id);
    if (existing) {
      return res.status(409).json({ 
        success: false, 
        error: 'Device with this ID already exists' 
      });
    }

    // Insert new device
    const insert = db.prepare(`
      INSERT INTO devices (id, name, type, status, value, room, icon)
      VALUES (?, ?, ?, 0, ?, ?, ?)
    `);

    const defaultValue = type === 'aircon' ? 24 : type === 'blinds' ? 100 : null;
    const defaultIcon = getDefaultIcon(type);

    insert.run(id, name, type, defaultValue, room || 'Unassigned', icon || defaultIcon);

    const newDevice = db.prepare('SELECT * FROM devices WHERE id = ?').get(id);

    res.status(201).json({ 
      success: true, 
      message: 'Device added successfully',
      device: newDevice 
    });
  } catch (error) {
    console.error('Error adding device:', error);
    res.status(500).json({ success: false, error: 'Failed to add device' });
  }
};

/**
 * Update device status (turn on/off)
 */
export const updateDeviceStatus = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (status === undefined) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }

    const update = db.prepare(`
      UPDATE devices 
      SET status = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);

    const result = update.run(status ? 1 : 0, id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }

    const device = db.prepare('SELECT * FROM devices WHERE id = ?').get(id);
    res.json({ success: true, device });
  } catch (error) {
    console.error('Error updating device status:', error);
    res.status(500).json({ success: false, error: 'Failed to update device status' });
  }
};

/**
 * Update device value (temperature, brightness, etc.)
 */
export const updateDeviceValue = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { value } = req.body;

    if (value === undefined) {
      return res.status(400).json({ success: false, error: 'Value is required' });
    }

    const update = db.prepare(`
      UPDATE devices 
      SET value = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);

    const result = update.run(value, id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }

    const device = db.prepare('SELECT * FROM devices WHERE id = ?').get(id);
    res.json({ success: true, device });
  } catch (error) {
    console.error('Error updating device value:', error);
    res.status(500).json({ success: false, error: 'Failed to update device value' });
  }
};

/**
 * Delete a device
 */
export const deleteDevice = (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleteStmt = db.prepare('DELETE FROM devices WHERE id = ?');
    const result = deleteStmt.run(id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }

    res.json({ success: true, message: 'Device deleted successfully' });
  } catch (error) {
    console.error('Error deleting device:', error);
    res.status(500).json({ success: false, error: 'Failed to delete device' });
  }
};

/**
 * Auto-detect devices (simulated)
 * In a real implementation, this would scan the network for smart devices
 */
export const autoDetectDevices = (req: Request, res: Response) => {
  try {
    // Simulated device discovery
    // In production, this would use protocols like mDNS, UPnP, or manufacturer APIs
    const discoveredDevices = [
      {
        id: `device_${Date.now()}_1`,
        name: 'Smart Bulb',
        type: 'light',
        room: 'Bedroom',
        icon: '💡',
        manufacturer: 'Philips Hue',
        model: 'A19'
      },
      {
        id: `device_${Date.now()}_2`,
        name: 'Smart Plug',
        type: 'plug',
        room: 'Living Room',
        icon: '🔌',
        manufacturer: 'TP-Link',
        model: 'HS100'
      }
    ];

    res.json({ 
      success: true, 
      discovered: discoveredDevices,
      message: 'Device discovery completed. These devices can be added to your system.'
    });
  } catch (error) {
    console.error('Error during device discovery:', error);
    res.status(500).json({ success: false, error: 'Failed to discover devices' });
  }
};

/**
 * Get supported device types
 */
export const getDeviceTypes = (req: Request, res: Response) => {
  const deviceTypes = [
    { type: 'light', name: 'Light', icon: '💡', hasValue: false },
    { type: 'aircon', name: 'Air Conditioner', icon: '❄️', hasValue: true, valueLabel: 'Temperature (°C)' },
    { type: 'vacuum', name: 'Vacuum Cleaner', icon: '🧹', hasValue: false },
    { type: 'kettle', name: 'Kettle', icon: '☕', hasValue: false },
    { type: 'blinds', name: 'Blinds', icon: '🪟', hasValue: true, valueLabel: 'Position (%)' },
    { type: 'plug', name: 'Smart Plug', icon: '🔌', hasValue: false },
    { type: 'fan', name: 'Fan', icon: '🌀', hasValue: true, valueLabel: 'Speed (%)' },
    { type: 'heater', name: 'Heater', icon: '🔥', hasValue: true, valueLabel: 'Temperature (°C)' },
    { type: 'lock', name: 'Smart Lock', icon: '🔒', hasValue: false },
    { type: 'camera', name: 'Security Camera', icon: '📹', hasValue: false },
    { type: 'speaker', name: 'Smart Speaker', icon: '🔊', hasValue: true, valueLabel: 'Volume (%)' },
    { type: 'tv', name: 'Smart TV', icon: '📺', hasValue: false },
  ];

  res.json({ success: true, deviceTypes });
};

/**
 * Helper function to get default icon for device type
 */
function getDefaultIcon(type: string): string {
  const icons: { [key: string]: string } = {
    light: '💡',
    aircon: '❄️',
    vacuum: '🧹',
    kettle: '☕',
    blinds: '🪟',
    plug: '🔌',
    fan: '🌀',
    heater: '🔥',
    lock: '🔒',
    camera: '📹',
    speaker: '🔊',
    tv: '📺',
  };
  return icons[type] || '🏠';
}
