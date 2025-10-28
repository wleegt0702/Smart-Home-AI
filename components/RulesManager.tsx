import React, { useState, useEffect } from 'react';
import { ZapIcon, PlusIcon, TrashIcon, CheckCircleIcon, XCircleIcon } from './icons/Icons';

interface AutomationRule {
  id: number;
  name: string;
  description: string;
  condition: string;
  action: string;
  enabled: number;
  created_at: string;
  updated_at: string;
}

interface RuleLog {
  id: number;
  rule_id: number;
  rule_name: string;
  executed_at: string;
  success: number;
  message: string;
}

/**
 * Rules Manager Component
 * Interface for creating and managing automation rules
 */
const RulesManager: React.FC = () => {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [logs, setLogs] = useState<RuleLog[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'rules' | 'logs'>('rules');

  useEffect(() => {
    fetchRules();
    fetchLogs();
    
    // Refresh logs every 30 seconds
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchRules = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/rules');
      const data = await response.json();
      if (data.success) {
        setRules(data.rules);
      }
    } catch (error) {
      console.error('Error fetching rules:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/rules/logs/all?limit=20');
      const data = await response.json();
      if (data.success) {
        setLogs(data.logs);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const handleCreateRule = async () => {
    if (!naturalLanguageInput.trim()) {
      alert('Please enter a rule description');
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('http://localhost:3001/api/rules/natural', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput: naturalLanguageInput })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Rule created successfully!');
        setNaturalLanguageInput('');
        setShowCreateModal(false);
        fetchRules();
      } else {
        alert(data.error || 'Failed to create rule');
      }
    } catch (error) {
      console.error('Error creating rule:', error);
      alert('Failed to create rule');
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleRule = async (ruleId: number) => {
    try {
      const response = await fetch(`http://localhost:3001/api/rules/${ruleId}/toggle`, {
        method: 'PUT'
      });

      const data = await response.json();
      
      if (data.success) {
        fetchRules();
      }
    } catch (error) {
      console.error('Error toggling rule:', error);
    }
  };

  const handleDeleteRule = async (ruleId: number) => {
    if (!confirm('Are you sure you want to delete this rule?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/rules/${ruleId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        fetchRules();
      }
    } catch (error) {
      console.error('Error deleting rule:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-SG', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const parseCondition = (conditionStr: string) => {
    try {
      const condition = JSON.parse(conditionStr);
      const { type, operator, value } = condition;
      
      switch (type) {
        case 'time':
          return `At ${value}`;
        case 'temperature':
          return `Temperature ${operator} ${value}°C`;
        case 'humidity':
          return `Humidity ${operator} ${value}%`;
        case 'presence':
          return value ? 'When someone is home' : 'When no one is home';
        case 'price':
          return `Electricity price ${operator} SGD $${value}`;
        default:
          return type;
      }
    } catch {
      return 'Custom condition';
    }
  };

  const parseActions = (actionStr: string) => {
    try {
      const actions = JSON.parse(actionStr);
      return actions.map((a: any) => {
        if (a.action === 'turnOn') return `Turn on ${a.deviceId}`;
        if (a.action === 'turnOff') return `Turn off ${a.deviceId}`;
        if (a.action === 'setValue') return `Set ${a.deviceId} to ${a.value}`;
        return a.action;
      }).join(', ');
    } catch {
      return 'Custom actions';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ZapIcon className="w-8 h-8 text-yellow-400" />
          <h2 className="text-3xl font-bold">Automation Rules</h2>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors font-semibold"
        >
          <PlusIcon className="w-5 h-5" />
          Create Rule
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-700">
        <button
          onClick={() => setSelectedTab('rules')}
          className={`px-6 py-3 font-semibold transition-colors ${
            selectedTab === 'rules'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Rules ({rules.length})
        </button>
        <button
          onClick={() => setSelectedTab('logs')}
          className={`px-6 py-3 font-semibold transition-colors ${
            selectedTab === 'logs'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Execution Logs
        </button>
      </div>

      {/* Rules Tab */}
      {selectedTab === 'rules' && (
        <div className="space-y-4">
          {rules.length === 0 ? (
            <div className="text-center py-12 bg-gray-800 rounded-xl">
              <ZapIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400 mb-4">No automation rules yet</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
              >
                Create Your First Rule
              </button>
            </div>
          ) : (
            rules.map((rule) => (
              <div
                key={rule.id}
                className={`bg-gray-800 p-6 rounded-xl border-2 transition-all ${
                  rule.enabled ? 'border-green-500/30' : 'border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{rule.name}</h3>
                      {rule.enabled ? (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-600 text-gray-400 text-xs rounded-full">
                          Disabled
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{rule.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-blue-400 font-semibold text-sm">IF:</span>
                        <span className="text-gray-300 text-sm">{parseCondition(rule.condition)}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-400 font-semibold text-sm">THEN:</span>
                        <span className="text-gray-300 text-sm">{parseActions(rule.action)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <label className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={rule.enabled === 1}
                          onChange={() => handleToggleRule(rule.id)}
                        />
                        <div className="block bg-gray-600 w-12 h-7 rounded-full"></div>
                        <div
                          className={`dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition ${
                            rule.enabled ? 'transform translate-x-full bg-green-400' : ''
                          }`}
                        ></div>
                      </div>
                    </label>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-700">
                  Created {formatDate(rule.created_at)}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Logs Tab */}
      {selectedTab === 'logs' && (
        <div className="space-y-3">
          {logs.length === 0 ? (
            <div className="text-center py-12 bg-gray-800 rounded-xl">
              <p className="text-gray-400">No execution logs yet</p>
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="bg-gray-800 p-4 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  {log.success ? (
                    <CheckCircleIcon className="w-6 h-6 text-green-400" />
                  ) : (
                    <XCircleIcon className="w-6 h-6 text-red-400" />
                  )}
                  <div>
                    <p className="font-semibold text-sm">{log.rule_name}</p>
                    {log.message && (
                      <p className="text-xs text-gray-400 mt-1">{log.message}</p>
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-500">{formatDate(log.executed_at)}</span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create Rule Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl max-w-2xl w-full p-8 border border-gray-800">
            <h2 className="text-2xl font-bold mb-4">Create Automation Rule</h2>
            <p className="text-gray-400 mb-6">
              Describe your automation rule in plain English. Our AI will convert it into a working rule.
            </p>

            {/* Example suggestions */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-300 mb-3">Examples:</p>
              <div className="space-y-2">
                {[
                  'Turn off all lights when no one is home',
                  'Reduce AC usage when electricity prices are high',
                  'Turn on the water heater at 6:30 AM on weekdays',
                  'Close blinds when temperature exceeds 32°C',
                  'Turn on living room light at sunset'
                ].map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setNaturalLanguageInput(example)}
                    className="block w-full text-left px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            {/* Input field */}
            <textarea
              value={naturalLanguageInput}
              onChange={(e) => setNaturalLanguageInput(e.target.value)}
              placeholder="e.g., Turn off all lights when no one is home"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-none"
            />

            {/* Action buttons */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNaturalLanguageInput('');
                }}
                className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                disabled={isCreating}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRule}
                disabled={isCreating || !naturalLanguageInput.trim()}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? 'Creating...' : 'Create Rule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RulesManager;
