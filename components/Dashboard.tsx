
import React from 'react';
import { useSmartHome } from '../hooks/useSmartHome';
import DeviceCard from './DeviceCard';
import { SunIcon, MoonIcon, ZapIcon } from './icons/Icons';
// FIX: Import Device type to resolve typing issues.
import { Device } from '../types';

const WeatherWidget: React.FC<{ temp: number }> = ({ temp }) => (
  <div className="bg-gray-800 p-4 rounded-xl flex items-center justify-between col-span-1 md:col-span-2">
    <div>
      <h3 className="font-semibold text-lg">Weather Forecast (Simulated)</h3>
      <p className="text-gray-400">myENV App</p>
    </div>
    <div className="flex items-center gap-4">
      <span className="text-5xl font-bold text-yellow-400">{Math.round(temp)}°C</span>
      {temp > 30 ? <SunIcon className="w-12 h-12 text-yellow-400" /> : <MoonIcon className="w-12 h-12 text-blue-400" />}
    </div>
  </div>
);

const AutomationPanel: React.FC<{ enabled: boolean; setEnabled: (e: boolean) => void }> = ({ enabled, setEnabled }) => (
  <div className="bg-gray-800 p-4 rounded-xl col-span-1 md:col-span-2">
    <div className="flex justify-between items-center mb-2">
      <div className="flex items-center gap-2">
        <ZapIcon className="w-6 h-6 text-green-400" />
        <h3 className="font-semibold text-lg">Agentic AI Automation</h3>
      </div>
      <label htmlFor="automation-toggle" className="flex items-center cursor-pointer">
        <div className="relative">
          <input type="checkbox" id="automation-toggle" className="sr-only" checked={enabled} onChange={() => setEnabled(!enabled)} />
          <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
          <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${enabled ? 'transform translate-x-full bg-green-400' : ''}`}></div>
        </div>
      </label>
    </div>
    <div className="text-gray-400 text-sm space-y-1">
        <p><span className="font-semibold text-gray-300">Hot Weather Rule:</span> If temp &gt; 30°C, turn on AC & set blinds to 50%.</p>
        <p><span className="font-semibold text-gray-300">Evening Rule:</span> At 7 PM, turn on all lights.</p>
    </div>
  </div>
);


const Dashboard: React.FC = () => {
  const { devices, toggleDevice, setDeviceValue, weatherTemp, automationEnabled, setAutomationEnabled } = useSmartHome();
  const deviceList = Object.values(devices);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-4">Control Center</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <WeatherWidget temp={weatherTemp} />
          <AutomationPanel enabled={automationEnabled} setEnabled={setAutomationEnabled} />
        </div>
      </div>
      <div>
        <h2 className="text-3xl font-bold mb-4">Devices</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {/* FIX: Explicitly type `device` to fix inference error. */}
          {deviceList.map((device: Device) => (
            <DeviceCard
              key={device.id}
              device={device}
              onToggle={() => toggleDevice(device.id)}
              onValueChange={(value) => setDeviceValue(device.id, value)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
