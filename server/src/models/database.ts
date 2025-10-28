import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize SQLite database
const dbPath = path.join(__dirname, '../../data/smarthome.db');
export const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

/**
 * Initialize database tables
 * This function creates all necessary tables for the Smart Home AI system
 */
export function initializeDatabase() {
  // Devices table - stores all smart home devices
  db.exec(`
    CREATE TABLE IF NOT EXISTS devices (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      status INTEGER DEFAULT 0,
      value REAL,
      room TEXT,
      icon TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Automation rules table - stores user-defined automation rules
  db.exec(`
    CREATE TABLE IF NOT EXISTS automation_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      condition TEXT NOT NULL,
      action TEXT NOT NULL,
      enabled INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Rule execution log - tracks when rules are triggered
  db.exec(`
    CREATE TABLE IF NOT EXISTS rule_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rule_id INTEGER NOT NULL,
      executed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      success INTEGER DEFAULT 1,
      message TEXT,
      FOREIGN KEY (rule_id) REFERENCES automation_rules(id) ON DELETE CASCADE
    )
  `);

  // Energy usage tracking
  db.exec(`
    CREATE TABLE IF NOT EXISTS energy_usage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      power_consumption REAL NOT NULL,
      duration_minutes INTEGER,
      FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
    )
  `);

  // User preferences and settings
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Electricity plans comparison data
  db.exec(`
    CREATE TABLE IF NOT EXISTS electricity_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      provider TEXT NOT NULL,
      plan_name TEXT NOT NULL,
      rate_per_kwh REAL NOT NULL,
      contract_length INTEGER,
      renewable_percentage INTEGER DEFAULT 0,
      additional_fees TEXT,
      scraped_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      url TEXT
    )
  `);

  // AI advisor conversation history
  db.exec(`
    CREATE TABLE IF NOT EXISTS advisor_conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_message TEXT NOT NULL,
      ai_response TEXT NOT NULL,
      context TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ Database initialized successfully');
}

/**
 * Insert default devices if the database is empty
 */
export function seedDefaultDevices() {
  const count = db.prepare('SELECT COUNT(*) as count FROM devices').get() as { count: number };
  
  if (count.count === 0) {
    const insert = db.prepare(`
      INSERT INTO devices (id, name, type, status, value, room, icon)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const devices = [
      ['livingRoomLight', 'Living Room Light', 'light', 0, null, 'Living Room', '💡'],
      ['neonLight', 'Neon Light', 'light', 0, null, 'Bedroom', '✨'],
      ['aircon', 'Air Conditioner', 'aircon', 0, 24, 'Living Room', '❄️'],
      ['vacuum', 'Vacuum Cleaner', 'vacuum', 0, null, 'Storage', '🧹'],
      ['kettle', 'Hot Water Kettle', 'kettle', 0, null, 'Kitchen', '☕'],
      ['blinds', 'Window Blinds', 'blinds', 0, 100, 'Living Room', '🪟'],
    ];

    const insertMany = db.transaction((devices) => {
      for (const device of devices) {
        insert.run(...device);
      }
    });

    insertMany(devices);
    console.log('✅ Default devices seeded');
  }
}

/**
 * Insert default automation rules
 */
export function seedDefaultRules() {
  const count = db.prepare('SELECT COUNT(*) as count FROM automation_rules').get() as { count: number };
  
  if (count.count === 0) {
    const insert = db.prepare(`
      INSERT INTO automation_rules (name, description, condition, action, enabled)
      VALUES (?, ?, ?, ?, ?)
    `);

    const rules = [
      [
        'Hot Weather Auto-Cool',
        'Turn on AC and adjust blinds when temperature exceeds 30°C',
        JSON.stringify({ type: 'temperature', operator: '>', value: 30 }),
        JSON.stringify([
          { deviceId: 'aircon', action: 'turnOn' },
          { deviceId: 'blinds', action: 'setValue', value: 50 }
        ]),
        1
      ],
      [
        'Evening Lights',
        'Turn on all lights at 7 PM',
        JSON.stringify({ type: 'time', value: '19:00' }),
        JSON.stringify([
          { deviceId: 'livingRoomLight', action: 'turnOn' },
          { deviceId: 'neonLight', action: 'turnOn' }
        ]),
        1
      ]
    ];

    const insertMany = db.transaction((rules) => {
      for (const rule of rules) {
        insert.run(...rule);
      }
    });

    insertMany(rules);
    console.log('✅ Default automation rules seeded');
  }
}
