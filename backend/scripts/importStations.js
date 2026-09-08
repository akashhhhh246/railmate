const { db } = require('../db');
const fs = require('fs');
const path = require('path');

async function importStations() {
  console.log('Fetching Indian Railway stations dataset (8,900+ stations)...');
  
  db.exec(`
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

  let data;
  const localCachePath = path.join(__dirname, '../data/stations.json');

  if (fs.existsSync(localCachePath)) {
    console.log('Found local stations cache, reading...');
    data = JSON.parse(fs.readFileSync(localCachePath, 'utf8'));
  } else {
    console.log('Downloading stations.json from datameet/railways open repository...');
    const res = await fetch('https://raw.githubusercontent.com/datameet/railways/master/stations.json');
    if (!res.ok) {
      throw new Error(`Failed to download stations.json: ${res.statusText}`);
    }
    data = await res.json();
    // Cache locally for offline use
    fs.writeFileSync(localCachePath, JSON.stringify(data));
    console.log('Cached stations.json locally.');
  }

  const features = data.features || [];
  console.log(`Processing ${features.length} stations into SQLite database...`);

  const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO stations (code, name, state, zone, address)
    VALUES (?, ?, ?, ?, ?)
  `);

  db.exec('BEGIN TRANSACTION;');
  let count = 0;
  for (const feat of features) {
    const props = feat.properties || {};
    if (props.code && props.name) {
      insertStmt.run(
        props.code.trim().toUpperCase(),
        props.name.trim(),
        props.state ? props.state.trim() : '',
        props.zone ? props.zone.trim() : '',
        props.address ? props.address.trim() : ''
      );
      count++;
    }
  }
  db.exec('COMMIT;');

  console.log(`Successfully imported ${count} Indian Railway stations into SQLite database!`);
}

importStations().catch(err => {
  console.error('Import failed:', err);
  process.exit(1);
});
