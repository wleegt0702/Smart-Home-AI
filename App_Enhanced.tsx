import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import ImageGenerator from './components/ImageGenerator';
import VideoGenerator from './components/VideoGenerator';
import WeatherDashboard from './components/WeatherDashboard';
import RulesManager from './components/RulesManager';
import EnergyAdvisor from './components/EnergyAdvisor';
import PlanComparison from './components/PlanComparison';
import DeviceOnboarding from './components/DeviceOnboarding';
import { 
  HomeIcon, 
  ImageIcon, 
  VideoIcon, 
  CloudIcon, 
  ZapIcon, 
  LightbulbIcon, 
  ChartIcon,
  PlusIcon 
} from './components/icons/Icons';

type Tab = 'dashboard' | 'weather' | 'rules' | 'advisor' | 'plans' | 'image' | 'video';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [refreshDevices, setRefreshDevices] = useState(0);

  const handleDeviceAdded = () => {
    setRefreshDevices(prev => prev + 1);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard key={refreshDevices} />;
      case 'weather':
        return <WeatherDashboard />;
      case 'rules':
        return <RulesManager />;
      case 'advisor':
        return <EnergyAdvisor />;
      case 'plans':
        return <PlanComparison />;
      case 'image':
        return <ImageGenerator />;
      case 'video':
        return <VideoGenerator />;
      default:
        return <Dashboard />;
    }
  };

  const TabButton = ({ 
    tab, 
    label, 
    icon 
  }: { 
    tab: Tab; 
    label: string; 
    icon: React.ReactElement 
  }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 ${
        activeTab === tab 
          ? 'bg-blue-600 text-white shadow-lg' 
          : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
      }`}
    >
      {icon}
      <span className="hidden md:inline text-sm">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm p-4 sticky top-0 z-10 border-b border-gray-700">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white">Smart Energy AI</h1>
              <p className="text-xs text-gray-400">Intelligent Home Energy Management</p>
            </div>
            <button
              onClick={() => setShowOnboarding(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition-colors font-semibold text-sm"
            >
              <PlusIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Add Device</span>
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="flex items-center gap-2 overflow-x-auto pb-2">
            <TabButton tab="dashboard" label="Dashboard" icon={<HomeIcon className="w-5 h-5" />} />
            <TabButton tab="weather" label="Weather" icon={<CloudIcon className="w-5 h-5" />} />
            <TabButton tab="rules" label="Rules" icon={<ZapIcon className="w-5 h-5" />} />
            <TabButton tab="advisor" label="AI Advisor" icon={<LightbulbIcon className="w-5 h-5" />} />
            <TabButton tab="plans" label="Plans" icon={<ChartIcon className="w-5 h-5" />} />
            <TabButton tab="image" label="Image Gen" icon={<ImageIcon className="w-5 h-5" />} />
            <TabButton tab="video" label="Video Gen" icon={<VideoIcon className="w-5 h-5" />} />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </main>

      {/* Device Onboarding Modal */}
      {showOnboarding && (
        <DeviceOnboarding
          onDeviceAdded={handleDeviceAdded}
          onClose={() => setShowOnboarding(false)}
        />
      )}

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
          <p>Smart Energy AI Dashboard - Powered by OpenAI & Real-time Weather Data</p>
          <p className="mt-2">© 2024 Smart Home AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
