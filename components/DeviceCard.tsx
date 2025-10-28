
import React from 'react';
import { Device } from '../types';
import { LightbulbIcon, AirconIcon, VacuumIcon, KettleIcon, BlindsIcon } from './icons/Icons';

interface DeviceCardProps {
  device: Device;
  onToggle: () => void;
  onValueChange: (value: number) => void;
}

const ICONS: { [key in Device['type']]: React.FC<{ className?: string }> } = {
  light: LightbulbIcon,
  aircon: AirconIcon,
  vacuum: VacuumIcon,
  kettle: KettleIcon,
  blinds: BlindsIcon,
};

const DeviceCard: React.FC<DeviceCardProps> = ({ device, onToggle, onValueChange }) => {
  const Icon = ICONS[device.type];
  const isActive = device.status;

  return (
    <div className={`p-4 rounded-2xl transition-all duration-300 ${isActive ? 'bg-blue-600/80 shadow-lg' : 'bg-gray-800'}`}>
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-full ${isActive ? 'bg-white/20' : 'bg-gray-700'}`}>
          <Icon className={`w-6 h-6 transition-colors ${isActive ? 'text-white' : 'text-gray-400'}`} />
        </div>
        <label htmlFor={`toggle-${device.id}`} className="flex items-center cursor-pointer">
          <div className="relative">
            <input id={`toggle-${device.id}`} type="checkbox" className="sr-only" checked={isActive} onChange={onToggle} />
            <div className="block bg-gray-600 w-10 h-6 rounded-full"></div>
            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${isActive ? 'transform translate-x-full bg-blue-300' : ''}`}></div>
          </div>
        </label>
      </div>
      <div className="mt-4">
        <p className="font-semibold text-white">{device.name}</p>
        <p className={`text-sm ${isActive ? 'text-blue-200' : 'text-gray-400'}`}>{isActive ? 'On' : 'Off'}</p>
      </div>
      {device.type === 'aircon' && isActive && (
        <div className="mt-4">
          <input
            type="range"
            min="16"
            max="30"
            value={device.value}
            onChange={(e) => onValueChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <p className="text-center text-white mt-1">{device.value}°C</p>
        </div>
      )}
      {device.type === 'blinds' && isActive && (
        <div className="mt-4">
          <input
            type="range"
            min="0"
            max="100"
            value={device.value}
            onChange={(e) => onValueChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <p className="text-center text-white mt-1">{device.value}% Closed</p>
        </div>
      )}
    </div>
  );
};

export default DeviceCard;
