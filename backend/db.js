const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'railmate.db');
const db = new DatabaseSync(dbPath);

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON;');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS journeys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    train_name TEXT NOT NULL,
    train_number TEXT NOT NULL,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    journey_date TEXT NOT NULL,
    departure_time TEXT NOT NULL,
    arrival_time TEXT NOT NULL,
    arrival_date_offset INTEGER DEFAULT 0,
    coach TEXT NOT NULL,
    seat TEXT NOT NULL,
    travel_class TEXT NOT NULL,
    pnr TEXT,
    platform TEXT,
    notes TEXT,
    journey_type TEXT DEFAULT 'intercity',
    suburban_city TEXT DEFAULT '',
    suburban_line TEXT DEFAULT '',
    is_waiting_list INTEGER DEFAULT 0,
    waiting_list_number TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS station_stops (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    journey_id INTEGER NOT NULL,
    station_name TEXT NOT NULL,
    arrival_time TEXT NOT NULL,
    departure_time TEXT NOT NULL,
    stop_order INTEGER NOT NULL,
    FOREIGN KEY(journey_id) REFERENCES journeys(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS stations (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    state TEXT,
    zone TEXT,
    address TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_stations_code ON stations(code);
  CREATE INDEX IF NOT EXISTS idx_stations_name ON stations(name);
`);

// Migration: Ensure suburban columns exist in journeys table
try {
  const tableInfo = db.prepare(`PRAGMA table_info(journeys)`).all();
  const colNames = tableInfo.map(c => c.name);
  if (!colNames.includes('journey_type')) {
    db.exec(`ALTER TABLE journeys ADD COLUMN journey_type TEXT DEFAULT 'intercity'`);
  }
  if (!colNames.includes('suburban_city')) {
    db.exec(`ALTER TABLE journeys ADD COLUMN suburban_city TEXT DEFAULT ''`);
  }
  if (!colNames.includes('suburban_line')) {
    db.exec(`ALTER TABLE journeys ADD COLUMN suburban_line TEXT DEFAULT ''`);
  }
  if (!colNames.includes('is_waiting_list')) {
    db.exec(`ALTER TABLE journeys ADD COLUMN is_waiting_list INTEGER DEFAULT 0`);
  }
  if (!colNames.includes('waiting_list_number')) {
    db.exec(`ALTER TABLE journeys ADD COLUMN waiting_list_number TEXT DEFAULT ''`);
  }
} catch (e) {
  console.warn('Migration warning for journey columns:', e.message);
}

// Auto-populate stations if table is empty
try {
  const countRow = db.prepare('SELECT COUNT(*) as count FROM stations').get();
  if (countRow.count === 0) {
    const stationsJsonPath = path.join(dataDir, 'stations.json');
    if (fs.existsSync(stationsJsonPath)) {
      console.log('Loading 8,900+ Indian stations into SQLite database from cache...');
      const raw = JSON.parse(fs.readFileSync(stationsJsonPath, 'utf8'));
      const features = raw.features || [];
      const insertStmt = db.prepare(`
        INSERT OR IGNORE INTO stations (code, name, state, zone, address)
        VALUES (?, ?, ?, ?, ?)
      `);
      db.exec('BEGIN TRANSACTION;');
      for (const feat of features) {
        const p = feat.properties || {};
        if (p.code && p.name) {
          insertStmt.run(
            p.code.trim().toUpperCase(),
            p.name.trim(),
            p.state ? p.state.trim() : '',
            p.zone ? p.zone.trim() : '',
            p.address ? p.address.trim() : ''
          );
        }
      }
      db.exec('COMMIT;');
      console.log('Loaded stations successfully.');
    }
  }
} catch (e) {
  console.warn('Could not auto-populate stations:', e.message);
}

module.exports = {
  db
};
