// Simple in-memory database for deployment
// This version doesn't require SQLite compilation and works with all controllers

interface Device {
  id: string;
  name: string;
  type: string;
  status: number;
  value: number;
  room: string;
  icon: string;
  created_at?: string;
  updated_at?: string;
}

interface Rule {
  id: number;
  name: string;
  description: string;
  condition: string;
  action: string;
  enabled: number;
  created_at?: string;
  updated_at?: string;
}

interface Plan {
  id: number;
  provider: string;
  plan_name: string;
  rate_per_kwh: number;
  contract_length: number;
  renewable_percentage: number;
  additional_fees: string;
  url: string;
  scraped_at?: string;
}

interface Conversation {
  id: number;
  user_message: string;
  ai_response: string;
  context: string;
  created_at: string;
}

interface RuleLog {
  id: number;
  rule_id: number;
  executed_at: string;
  success: number;
  message: string;
}

// In-memory storage
const data = {
  devices: [] as Device[],
  rules: [] as Rule[],
  logs: [] as RuleLog[],
  plans: [] as Plan[],
  conversations: [] as Conversation[]
};

let nextRuleId = 1;
let nextLogId = 1;
let nextPlanId = 1;
let nextConversationId = 1;

// Simple database interface that mimics SQLite
export const db = {
  prepare: (sql: string) => {
    const sqlLower = sql.toLowerCase();
    
    return {
      all: (...params: any[]) => {
        if (sqlLower.includes('from devices')) return data.devices;
        if (sqlLower.includes('from automation_rules')) return data.rules;
        if (sqlLower.includes('from electricity_plans')) return data.plans;
        if (sqlLower.includes('from advisor_conversations')) return data.conversations;
        if (sqlLower.includes('from rule_logs')) return data.logs;
        return [];
      },
      get: (...params: any[]) => {
        if (sqlLower.includes('from devices')) {
          if (params.length > 0) {
            return data.devices.find(d => d.id === params[0]) || null;
          }
          return data.devices[0] || null;
        }
        if (sqlLower.includes('from automation_rules')) {
          if (params.length > 0) {
            return data.rules.find(r => r.id === params[0]) || null;
          }
          return data.rules[0] || null;
        }
        if (sqlLower.includes('from electricity_plans')) {
          if (params.length > 0) {
            return data.plans.find(p => p.id === params[0]) || null;
          }
          return data.plans[0] || null;
        }
        if (sqlLower.includes('count(*)')) {
          if (sqlLower.includes('from devices')) return { count: data.devices.length };
          if (sqlLower.includes('from automation_rules')) return { count: data.rules.length };
          if (sqlLower.includes('from electricity_plans')) return { count: data.plans.length };
          return { count: 0 };
        }
        return null;
      },
      run: (...params: any[]) => {
        let lastId = 0;
        
        // Handle INSERT
        if (sqlLower.includes('insert into devices')) {
          const device: Device = {
            id: params[0] || `device_${Date.now()}`,
            name: params[1] || 'New Device',
            type: params[2] || 'unknown',
            status: params[3] || 0,
            value: params[4] || 0,
            room: params[5] || 'Unknown',
            icon: params[6] || '📱',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          data.devices.push(device);
        } else if (sqlLower.includes('insert into automation_rules')) {
          lastId = nextRuleId++;
          const rule: Rule = {
            id: lastId,
            name: params[0] || 'New Rule',
            description: params[1] || '',
            condition: params[2] || '{}',
            action: params[3] || '{}',
            enabled: params[4] !== undefined ? params[4] : 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          data.rules.push(rule);
        } else if (sqlLower.includes('insert into rule_logs')) {
          lastId = nextLogId++;
          const log: RuleLog = {
            id: lastId,
            rule_id: params[0] || 0,
            executed_at: params[1] || new Date().toISOString(),
            success: params[2] !== undefined ? params[2] : 1,
            message: params[3] || ''
          };
          data.logs.push(log);
        } else if (sqlLower.includes('insert into electricity_plans')) {
          lastId = nextPlanId++;
          const plan: Plan = {
            id: lastId,
            provider: params[0] || '',
            plan_name: params[1] || '',
            rate_per_kwh: params[2] || 0,
            contract_length: params[3] || 0,
            renewable_percentage: params[4] || 0,
            additional_fees: params[5] || '',
            url: params[6] || '',
            scraped_at: new Date().toISOString()
          };
          data.plans.push(plan);
        } else if (sqlLower.includes('insert into advisor_conversations')) {
          lastId = nextConversationId++;
          const conversation: Conversation = {
            id: lastId,
            user_message: params[0] || '',
            ai_response: params[1] || '',
            context: params[2] || '{}',
            created_at: new Date().toISOString()
          };
          data.conversations.push(conversation);
        }
        
        // Handle UPDATE
        else if (sqlLower.includes('update devices')) {
          const deviceId = params[params.length - 1];
          const device = data.devices.find(d => d.id === deviceId);
          if (device) {
            if (sqlLower.includes('status')) device.status = params[0];
            if (sqlLower.includes('value')) device.value = params[sqlLower.includes('status') ? 1 : 0];
            device.updated_at = new Date().toISOString();
          }
        } else if (sqlLower.includes('update automation_rules')) {
          const ruleId = params[params.length - 1];
          const rule = data.rules.find(r => r.id === ruleId);
          if (rule) {
            if (sqlLower.includes('enabled')) rule.enabled = params[0];
            rule.updated_at = new Date().toISOString();
          }
        }
        
        // Handle DELETE
        else if (sqlLower.includes('delete from devices')) {
          const deviceId = params[0];
          const index = data.devices.findIndex(d => d.id === deviceId);
          if (index !== -1) data.devices.splice(index, 1);
        } else if (sqlLower.includes('delete from automation_rules')) {
          const ruleId = params[0];
          const index = data.rules.findIndex(r => r.id === ruleId);
          if (index !== -1) data.rules.splice(index, 1);
        } else if (sqlLower.includes('delete from electricity_plans')) {
          data.plans = [];
        }
        
        return { 
          changes: 1,
          lastInsertRowid: lastId
        };
      }
    };
  },
  
  // Transaction support (no-op for in-memory)
  transaction: (fn: () => void) => fn,
  
  // Pragma (no-op for in-memory)
  pragma: () => {}
};

export function initializeDatabase() {
  console.log('✅ In-memory database initialized');
}

export function seedDefaultDevices() {
  if (data.devices.length > 0) {
    console.log('⏭️  Devices already exist, skipping seed');
    return;
  }
  
  data.devices = [
    { 
      id: 'livingRoomLight', 
      name: 'Living Room Light', 
      type: 'light', 
      status: 1, 
      value: 75, 
      room: 'Living Room', 
      icon: '💡',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    { 
      id: 'aircon', 
      name: 'Air Conditioner', 
      type: 'aircon', 
      status: 1, 
      value: 24, 
      room: 'Bedroom', 
      icon: '❄️',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    { 
      id: 'vacuum', 
      name: 'Robot Vacuum', 
      type: 'vacuum', 
      status: 0, 
      value: 0, 
      room: 'Living Room', 
      icon: '🤖',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    { 
      id: 'kettle', 
      name: 'Smart Kettle', 
      type: 'kettle', 
      status: 0, 
      value: 0, 
      room: 'Kitchen', 
      icon: '☕',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    { 
      id: 'blinds', 
      name: 'Window Blinds', 
      type: 'blinds', 
      status: 1, 
      value: 50, 
      room: 'Bedroom', 
      icon: '🪟',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
  console.log(`✅ Seeded ${data.devices.length} default devices`);
}

export function seedDefaultRules() {
  if (data.rules.length > 0) {
    console.log('⏭️  Rules already exist, skipping seed');
    return;
  }
  
  data.rules = [
    { 
      id: nextRuleId++, 
      name: 'Energy Saver Mode', 
      description: 'Turn off all lights when no one is home', 
      condition: JSON.stringify({ type: 'presence', operator: '=', value: false }),
      action: JSON.stringify([{ deviceId: 'livingRoomLight', action: 'turnOff' }]),
      enabled: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    { 
      id: nextRuleId++, 
      name: 'Night Mode', 
      description: 'Dim lights at 10 PM', 
      condition: JSON.stringify({ type: 'time', value: '22:00' }),
      action: JSON.stringify([{ deviceId: 'livingRoomLight', action: 'setValue', value: 30 }]),
      enabled: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
  console.log(`✅ Seeded ${data.rules.length} default rules`);
}
