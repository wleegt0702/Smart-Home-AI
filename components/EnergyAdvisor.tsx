import React, { useState, useEffect, useRef } from 'react';
import { ZapIcon, SendIcon, LightbulbIcon, ChartIcon } from './icons/Icons';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface EnergyInsights {
  totalDevices: number;
  activeDevices: number;
  activeRules: number;
  todayUsage: number;
  todayCost: number;
  weeklyAverage: number;
  monthlyCost: number;
  topConsumers: Array<{
    device: string;
    percentage: number;
    usage: number;
  }>;
  savingsPotential: number;
  efficiencyScore: number;
}

/**
 * Energy Advisor Component
 * Conversational AI assistant for energy optimization
 */
const EnergyAdvisor: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [insights, setInsights] = useState<EnergyInsights | null>(null);
  const [selectedTab, setSelectedTab] = useState<'chat' | 'insights'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load initial data
    fetchRecommendations();
    fetchInsights();
    
    // Add welcome message
    setMessages([{
      role: 'assistant',
      content: "Hello! I'm your AI Energy Advisor. I can help you understand your energy consumption, provide personalized recommendations, and answer questions about optimizing your smart home. How can I assist you today?",
      timestamp: new Date()
    }]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchRecommendations = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/advisor/recommendations');
      const data = await response.json();
      if (data.success) {
        setRecommendations(data.recommendations);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  const fetchInsights = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/advisor/insights');
      const data = await response.json();
      if (data.success) {
        setInsights(data.insights);
      }
    } catch (error) {
      console.error('Error fetching insights:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch('http://localhost:3001/api/advisor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputMessage,
          conversationHistory
        })
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
  };

  const quickQuestions = [
    'How can I reduce my energy bill?',
    'What is using the most energy?',
    'Should I turn off my AC at night?',
    'How does weather affect my energy usage?',
    'What automation rules would you recommend?'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <ZapIcon className="w-8 h-8 text-yellow-400" />
        <h2 className="text-3xl font-bold">AI Energy Advisor</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-700">
        <button
          onClick={() => setSelectedTab('chat')}
          className={`px-6 py-3 font-semibold transition-colors ${
            selectedTab === 'chat'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Chat
        </button>
        <button
          onClick={() => setSelectedTab('insights')}
          className={`px-6 py-3 font-semibold transition-colors ${
            selectedTab === 'insights'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Energy Insights
        </button>
      </div>

      {/* Chat Tab */}
      {selectedTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-2 bg-gray-800 rounded-xl flex flex-col h-[600px]">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-100'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-60 mt-1">
                      {message.timestamp.toLocaleTimeString('en-SG', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-700 rounded-2xl px-4 py-3">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask me anything about your energy usage..."
                  className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <SendIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Questions */}
            <div className="bg-gray-800 p-6 rounded-xl">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <LightbulbIcon className="w-5 h-5 text-yellow-400" />
                Quick Questions
              </h3>
              <div className="space-y-2">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className="w-full text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div className="bg-gray-800 p-6 rounded-xl">
                <h3 className="font-semibold mb-4">💡 Recommendations</h3>
                <div className="space-y-3">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <p className="text-sm text-gray-300">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Insights Tab */}
      {selectedTab === 'insights' && insights && (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-xl">
              <p className="text-blue-100 text-sm mb-1">Today's Usage</p>
              <p className="text-3xl font-bold text-white">{insights.todayUsage} kWh</p>
              <p className="text-blue-200 text-sm mt-2">SGD ${insights.todayCost.toFixed(2)}</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-600 to-green-700 p-6 rounded-xl">
              <p className="text-green-100 text-sm mb-1">Weekly Average</p>
              <p className="text-3xl font-bold text-white">{insights.weeklyAverage} kWh</p>
              <p className="text-green-200 text-sm mt-2">Per day</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-6 rounded-xl">
              <p className="text-purple-100 text-sm mb-1">Monthly Cost</p>
              <p className="text-3xl font-bold text-white">SGD ${insights.monthlyCost.toFixed(2)}</p>
              <p className="text-purple-200 text-sm mt-2">Estimated</p>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 p-6 rounded-xl">
              <p className="text-yellow-100 text-sm mb-1">Efficiency Score</p>
              <p className="text-3xl font-bold text-white">{insights.efficiencyScore}/100</p>
              <p className="text-yellow-200 text-sm mt-2">Good performance</p>
            </div>
          </div>

          {/* Top Energy Consumers */}
          <div className="bg-gray-800 p-6 rounded-xl">
            <h3 className="text-xl font-semibold mb-6">Top Energy Consumers</h3>
            <div className="space-y-4">
              {insights.topConsumers.map((consumer, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{consumer.device}</span>
                    <span className="text-sm text-gray-400">{consumer.usage} kWh ({consumer.percentage}%)</span>
                  </div>
                  <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${consumer.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Savings Potential */}
          <div className="bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-green-500/30 p-6 rounded-xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2">💰 Savings Potential</h3>
                <p className="text-gray-300 mb-4">
                  Based on your usage patterns, you could save up to{' '}
                  <span className="text-green-400 font-bold text-2xl">SGD ${insights.savingsPotential.toFixed(2)}</span>
                  {' '}per month by optimizing your energy consumption.
                </p>
                <button
                  onClick={() => setSelectedTab('chat')}
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition-colors text-sm font-semibold"
                >
                  Get Personalized Tips
                </button>
              </div>
            </div>
          </div>

          {/* Device Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 p-6 rounded-xl text-center">
              <p className="text-gray-400 text-sm mb-2">Total Devices</p>
              <p className="text-4xl font-bold text-white">{insights.totalDevices}</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-xl text-center">
              <p className="text-gray-400 text-sm mb-2">Active Now</p>
              <p className="text-4xl font-bold text-green-400">{insights.activeDevices}</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-xl text-center">
              <p className="text-gray-400 text-sm mb-2">Active Rules</p>
              <p className="text-4xl font-bold text-blue-400">{insights.activeRules}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnergyAdvisor;
