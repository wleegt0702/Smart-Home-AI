import React, { useState, useEffect } from 'react';
import { PlusIcon, SearchIcon, CheckCircleIcon } from './icons/Icons';

interface DeviceType {
  type: string;
  name: string;
  icon: string;
  hasValue: boolean;
  valueLabel?: string;
}

interface DiscoveredDevice {
  id: string;
  name: string;
  type: string;
  room: string;
  icon: string;
  manufacturer?: string;
  model?: string;
}

interface DeviceOnboardingProps {
  onDeviceAdded: () => void;
  onClose: () => void;
}

/**
 * Device Onboarding Component
 * Provides a simple, icon-based flow for adding new smart home devices
 * Family-friendly interface with visual confirmation
 */
const DeviceOnboarding: React.FC<DeviceOnboardingProps> = ({ onDeviceAdded, onClose }) => {
  const [step, setStep] = useState<'method' | 'auto' | 'manual' | 'success'>('method');
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [discoveredDevices, setDiscoveredDevices] = useState<DiscoveredDevice[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    room: '',
    icon: ''
  });
  const [addedDevice, setAddedDevice] = useState<any>(null);

  // Fetch supported device types on component mount
  useEffect(() => {
    fetchDeviceTypes();
  }, []);

  const fetchDeviceTypes = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/devices/types');
      const data = await response.json();
      if (data.success) {
        setDeviceTypes(data.deviceTypes);
      }
    } catch (error) {
      console.error('Error fetching device types:', error);
    }
  };

  /**
   * Auto-detect devices on the network
   */
  const handleAutoDetect = async () => {
    setIsScanning(true);
    try {
      const response = await fetch('http://localhost:3001/api/devices/discover');
      const data = await response.json();
      if (data.success) {
        setDiscoveredDevices(data.discovered);
        setStep('auto');
      }
    } catch (error) {
      console.error('Error discovering devices:', error);
      alert('Failed to discover devices. Please try manual setup.');
    } finally {
      setIsScanning(false);
    }
  };

  /**
   * Add a discovered device
   */
  const handleAddDiscoveredDevice = async (device: DiscoveredDevice) => {
    try {
      const response = await fetch('http://localhost:3001/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(device)
      });
      const data = await response.json();
      
      if (data.success) {
        setAddedDevice(data.device);
        setStep('success');
        setTimeout(() => {
          onDeviceAdded();
          onClose();
        }, 2000);
      } else {
        alert(data.error || 'Failed to add device');
      }
    } catch (error) {
      console.error('Error adding device:', error);
      alert('Failed to add device');
    }
  };

  /**
   * Manually add a device
   */
  const handleManualAdd = async () => {
    if (!formData.name || !selectedType) {
      alert('Please fill in all required fields');
      return;
    }

    const deviceType = deviceTypes.find(dt => dt.type === selectedType);
    const newDevice = {
      id: `${selectedType}_${Date.now()}`,
      name: formData.name,
      type: selectedType,
      room: formData.room || 'Unassigned',
      icon: formData.icon || deviceType?.icon || '🏠'
    };

    try {
      const response = await fetch('http://localhost:3001/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDevice)
      });
      const data = await response.json();
      
      if (data.success) {
        setAddedDevice(data.device);
        setStep('success');
        setTimeout(() => {
          onDeviceAdded();
          onClose();
        }, 2000);
      } else {
        alert(data.error || 'Failed to add device');
      }
    } catch (error) {
      console.error('Error adding device:', error);
      alert('Failed to add device');
    }
  };

  // Step 1: Choose onboarding method
  const renderMethodSelection = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center mb-6">Add New Device</h2>
      <p className="text-gray-400 text-center mb-8">How would you like to add your device?</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Auto-detect option */}
        <button
          onClick={handleAutoDetect}
          disabled={isScanning}
          className="bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 p-8 rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <SearchIcon className="w-16 h-16 mx-auto mb-4 text-white" />
          <h3 className="text-xl font-semibold mb-2">Auto-Detect</h3>
          <p className="text-sm text-blue-100">
            {isScanning ? 'Scanning network...' : 'Automatically find devices on your network'}
          </p>
        </button>

        {/* Manual setup option */}
        <button
          onClick={() => setStep('manual')}
          className="bg-gradient-to-br from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 p-8 rounded-2xl transition-all duration-300 transform hover:scale-105"
        >
          <PlusIcon className="w-16 h-16 mx-auto mb-4 text-white" />
          <h3 className="text-xl font-semibold mb-2">Manual Setup</h3>
          <p className="text-sm text-green-100">Add a device manually with custom settings</p>
        </button>
      </div>
    </div>
  );

  // Step 2: Show discovered devices
  const renderAutoDetect = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Discovered Devices</h2>
      <p className="text-gray-400 mb-6">Select a device to add to your system</p>

      {discoveredDevices.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">No devices found</p>
          <button
            onClick={() => setStep('method')}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {discoveredDevices.map((device) => (
            <div
              key={device.id}
              className="bg-gray-800 p-6 rounded-xl hover:bg-gray-750 transition-colors cursor-pointer border-2 border-transparent hover:border-blue-500"
              onClick={() => handleAddDiscoveredDevice(device)}
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">{device.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{device.name}</h3>
                  <p className="text-sm text-gray-400">{device.manufacturer} {device.model}</p>
                  <p className="text-xs text-gray-500 mt-1">Room: {device.room}</p>
                </div>
                <PlusIcon className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center mt-6">
        <button
          onClick={() => setStep('method')}
          className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        >
          Back
        </button>
      </div>
    </div>
  );

  // Step 3: Manual device setup
  const renderManualSetup = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Manual Device Setup</h2>
      
      {/* Device type selection */}
      <div>
        <label className="block text-sm font-medium mb-3">Device Type *</label>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {deviceTypes.map((type) => (
            <button
              key={type.type}
              onClick={() => {
                setSelectedType(type.type);
                setFormData({ ...formData, icon: type.icon });
              }}
              className={`p-4 rounded-xl transition-all duration-200 ${
                selectedType === type.type
                  ? 'bg-blue-600 ring-2 ring-blue-400 scale-105'
                  : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <span className="text-3xl block mb-2">{type.icon}</span>
              <span className="text-xs">{type.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Device name */}
      <div>
        <label className="block text-sm font-medium mb-2">Device Name *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Bedroom Light"
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Room */}
      <div>
        <label className="block text-sm font-medium mb-2">Room</label>
        <input
          type="text"
          value={formData.room}
          onChange={(e) => setFormData({ ...formData, room: e.target.value })}
          placeholder="e.g., Living Room"
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Action buttons */}
      <div className="flex gap-4 mt-8">
        <button
          onClick={() => setStep('method')}
          className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleManualAdd}
          className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors font-semibold"
        >
          Add Device
        </button>
      </div>
    </div>
  );

  // Step 4: Success confirmation
  const renderSuccess = () => (
    <div className="text-center py-12">
      <div className="mb-6 animate-bounce">
        <CheckCircleIcon className="w-24 h-24 mx-auto text-green-400" />
      </div>
      <h2 className="text-3xl font-bold mb-4">Device Added Successfully!</h2>
      {addedDevice && (
        <div className="bg-gray-800 p-6 rounded-xl max-w-md mx-auto mt-6">
          <span className="text-5xl block mb-3">{addedDevice.icon}</span>
          <h3 className="text-xl font-semibold">{addedDevice.name}</h3>
          <p className="text-gray-400 mt-2">{addedDevice.room}</p>
        </div>
      )}
      <p className="text-gray-400 mt-6">Redirecting to dashboard...</p>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 relative border border-gray-800">
        {/* Close button */}
        {step !== 'success' && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Render appropriate step */}
        {step === 'method' && renderMethodSelection()}
        {step === 'auto' && renderAutoDetect()}
        {step === 'manual' && renderManualSetup()}
        {step === 'success' && renderSuccess()}
      </div>
    </div>
  );
};

export default DeviceOnboarding;
