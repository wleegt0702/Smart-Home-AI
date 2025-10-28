
import { useState, useEffect } from 'react';
import { Devices } from '../types';

const initialDevices: Devices = {
  livingRoomLight: { id: 'livingRoomLight', name: 'Living Room Light', type: 'light', status: false },
  neonLight: { id: 'neonLight', name: 'Neon Light', type: 'light', status: false },
  aircon: { id: 'aircon', name: 'Air Conditioner', type: 'aircon', status: false, value: 24 },
  vacuum: { id: 'vacuum', name: 'Vacuum Cleaner', type: 'vacuum', status: false },
  kettle: { id: 'kettle', name: 'Hot Water Kettle', type: 'kettle', status: false },
  blinds: { id: 'blinds', name: 'Window Blinds', type: 'blinds', status: false, value: 100 },
};

export const useSmartHome = () => {
  const [devices, setDevices] = useState<Devices>(initialDevices);
  const [weatherTemp, setWeatherTemp] = useState(28); // Simulated temperature
  const [automationEnabled, setAutomationEnabled] = useState(true);

  useEffect(() => {
    if (!automationEnabled) return;

    const automationInterval = setInterval(() => {
      // Rule 1: Temperature control
      if (weatherTemp > 30) {
        setDevices(prev => ({
          ...prev,
          blinds: { ...prev.blinds, status: true, value: 50 },
          aircon: { ...prev.aircon, status: true },
        }));
      }

      // Rule 2: Evening lights
      const now = new Date();
      if (now.getHours() >= 19) { // 7 PM
        setDevices(prev => ({
          ...prev,
          livingRoomLight: { ...prev.livingRoomLight, status: true },
          neonLight: { ...prev.neonLight, status: true },
        }));
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(automationInterval);
  }, [automationEnabled, weatherTemp]);

  const toggleDevice = (id: string) => {
    setDevices(prev => ({
      ...prev,
      [id]: { ...prev[id], status: !prev[id].status },
    }));
  };

  const setDeviceValue = (id: string, value: number) => {
    setDevices(prev => ({
      ...prev,
      [id]: { ...prev[id], value: value },
    }));
  };
  
  // Simulate temperature changes
  useEffect(() => {
    const tempInterval = setInterval(() => {
      setWeatherTemp(25 + Math.random() * 10); // Random temp between 25 and 35
    }, 10000);
    return () => clearInterval(tempInterval);
  }, []);

  return {
    devices,
    toggleDevice,
    setDeviceValue,
    weatherTemp,
    automationEnabled,
    setAutomationEnabled,
  };
};
