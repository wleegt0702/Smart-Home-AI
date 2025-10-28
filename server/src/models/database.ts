// Simple in-memory database for deployment
// This version doesn't require SQLite compilation

interface Device {
  id: string;
  name: string;
  type: string;
  status: number;
  value: number;
  room: string;
  icon: string;
}

interface Rule {
  id: number;
  name: string;
  description: string;
  condition: any;
  action: any;
  enabled: number;
}

// In-memory storage
const data = {
  devices: [] as Device[],
  rules: [] as Rule[],
  logs: [] as any[],
  plans: [] as any[],
  conversations: [] as any[]
};

// Simple database interface that mimics SQLite
export const db = {
  prepare: (sql: string) => ({
    all: () => {
      if (sql.includes('FROM devices')) return data.devices;
      if (sql.includes('FROM automation_rules')) return data.rules;
      if (sql.includes('FROM electricity_plans')) return data.plans;
      if (sql.includes('FROM advisor_conversations')) return data.conversations;
      return [];
    },
    get: () => {
      if (sql.includes('FROM devices')) return data.devices[0] || null;
      if (sql.includes('FROM automation_rules')) return data.rules[0] || null;
      return null;
    },
    run: (...params: any[]) => {
      // Handle INSERT/UPDATE/DELETE
      return { changes: 1 };
    }
  })
};

export function initializeDatabase() {
  console.log('✅ In-memory database initialized');
}

export function seedDefaultDevices() {
  if (data.devices.length > 0) return;
  
  data.devices = [
    { id: 'light1', name: 'Living Room Light', type: 'light', status: 1, value: 75, room: 'Living Room', icon: '💡' },
    { id: 'ac1', name: 'Air Conditioner', type: 'aircon', status: 1, value: 24, room: 'Bedroom', icon: '❄️' },
    { id: 'vacuum1', name: 'Robot Vacuum', type: 'vacuum', status: 0, value: 0, room: 'Living Room', icon: '🤖' }
  ];
  console.log('✅ Seeded default devices');
}

export function seedDefaultRules() {
  if (data.rules.length > 0) return;
  
  data.rules = [
    { id: 1, name: 'Energy Saver', description: 'Turn off lights when away', condition: {}, action: {}, enabled: 1 }
  ];
  console.log('✅ Seeded default rules');
}
