
import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import ImageGenerator from './components/ImageGenerator';
import VideoGenerator from './components/VideoGenerator';
import { HomeIcon, ImageIcon, VideoIcon } from './components/icons/Icons';

type Tab = 'dashboard' | 'image' | 'video';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'image':
        return <ImageGenerator />;
      case 'video':
        return <VideoGenerator />;
      default:
        return <Dashboard />;
    }
  };

  const TabButton = ({ tab, label, icon }: { tab: Tab; label: string; icon: React.ReactElement }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
        activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-700 hover:bg-gray-600'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <header className="bg-gray-800/50 backdrop-blur-sm p-4 sticky top-0 z-10 border-b border-gray-700">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold text-white">Smart Home AI</h1>
          <nav className="flex items-center space-x-2 sm:space-x-4">
            <TabButton tab="dashboard" label="Dashboard" icon={<HomeIcon />} />
            <TabButton tab="image" label="Image Gen" icon={<ImageIcon />} />
            <TabButton tab="video" label="Video Gen" icon={<VideoIcon />} />
          </nav>
        </div>
      </header>
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
