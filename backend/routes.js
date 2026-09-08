const express = require('express');
const { db } = require('./db');

const router = express.Router();

function computeJourneyStatus(journey, now = new Date()) {
  try {
    if (!journey.departure_time || !journey.arrival_time) {
      // For suburban frequency commute where exact scheduled timings are unknown
      const journeyDateStart = new Date(`${journey.journey_date}T00:00:00`);
      const journeyDateEnd = new Date(`${journey.journey_date}T23:59:59`);
      const nowMs = now.getTime();
      const startMs = journeyDateStart.getTime();
      const endMs = journeyDateEnd.getTime();

      let status = 'upcoming';
      if (nowMs >= startMs && nowMs <= endMs) {
        status = 'in_progress';
      } else if (nowMs > endMs) {
        status = 'completed';
      }

      return {
        status,
        departureTimestamp: startMs,
        arrivalTimestamp: endMs,
        countdownMs: status === 'upcoming' ? Math.max(0, startMs - nowMs) : 0
      };
    }

    const depDateTime = new Date(`${journey.journey_date}T${journey.departure_time}:00`);
    
    let arrivalDate = new Date(journey.journey_date);
    let offset = journey.arrival_date_offset || 0;
    
    if (offset === 0 && journey.arrival_time < journey.departure_time) {
      offset = 1;
    }
    arrivalDate.setDate(arrivalDate.getDate() + offset);
    const yyyy = arrivalDate.getFullYear();
    const mm = String(arrivalDate.getMonth() + 1).padStart(2, '0');
    const dd = String(arrivalDate.getDate()).padStart(2, '0');
    const arrDateTime = new Date(`${yyyy}-${mm}-${dd}T${journey.arrival_time}:00`);

    const nowMs = now.getTime();
    const depMs = depDateTime.getTime();
    const arrMs = arrDateTime.getTime();

    if (nowMs < depMs) {
      return {
        status: 'upcoming',
        departureTimestamp: depMs,
        arrivalTimestamp: arrMs,
        countdownMs: depMs - nowMs
      };
    } else if (nowMs >= depMs && nowMs <= arrMs) {
      return {
        status: 'in_progress',
        departureTimestamp: depMs,
        arrivalTimestamp: arrMs,
        countdownMs: 0
      };
    } else {
      return {
        status: 'completed',
        departureTimestamp: depMs,
        arrivalTimestamp: arrMs,
        countdownMs: 0
      };
    }
  } catch (err) {
    return {
      status: 'upcoming',
      departureTimestamp: null,
      arrivalTimestamp: null,
      countdownMs: null
    };
  }
}

// GET /api/journeys
router.get('/journeys', (req, res) => {
  try {
    const { search, status, sort } = req.query;
    
    let query = `SELECT * FROM journeys`;
    const params = [];
    const conditions = [];

    if (search && search.trim()) {
      const s = `%${search.trim()}%`;
      conditions.push(`(train_name LIKE ? OR train_number LIKE ? OR origin LIKE ? OR destination LIKE ? OR pnr LIKE ?)`);
      params.push(s, s, s, s, s);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    if (sort === 'date_desc') {
      query += ` ORDER BY journey_date DESC, departure_time DESC`;
    } else if (sort === 'date_asc') {
      query += ` ORDER BY journey_date ASC, departure_time ASC`;
    } else if (sort === 'name_asc') {
      query += ` ORDER BY train_name ASC`;
    } else {
      query += ` ORDER BY journey_date ASC, departure_time ASC`;
    }

    const rows = db.prepare(query).all(...params);

    const now = new Date();
    const stopsStmt = db.prepare(`SELECT * FROM station_stops WHERE journey_id = ? ORDER BY stop_order ASC`);

    const enhanced = rows.map(journey => {
      const timing = computeJourneyStatus(journey, now);
      const stops = stopsStmt.all(journey.id);
      
      return {
        ...journey,
        status: timing.status,
        departureTimestamp: timing.departureTimestamp,
        arrivalTimestamp: timing.arrivalTimestamp,
        countdownMs: timing.countdownMs,
        stops,
        totalStops: stops.length
      };
    });

    let filtered = enhanced;
    if (status && status !== 'all') {
      filtered = enhanced.filter(j => j.status === status);
    }

    res.json({ success: true, data: filtered });
  } catch (error) {
    console.error('Error fetching journeys:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/journeys/next (Next upcoming or in-progress journey)
router.get('/journeys/next', (req, res) => {
  try {
    const rows = db.prepare(`SELECT * FROM journeys ORDER BY journey_date ASC, departure_time ASC`).all();
    const now = new Date();

    const stopsStmt = db.prepare(`SELECT * FROM station_stops WHERE journey_id = ? ORDER BY stop_order ASC`);

    const mapped = rows.map(j => {
      const timing = computeJourneyStatus(j, now);
      return { ...j, ...timing };
    });

    // In-progress takes priority, then next upcoming
    let next = mapped.find(j => j.status === 'in_progress');
    if (!next) {
      next = mapped.find(j => j.status === 'upcoming');
    }

    if (!next) {
      return res.json({ success: true, data: null });
    }

    const stops = stopsStmt.all(next.id);

    res.json({
      success: true,
      data: {
        ...next,
        stops
      }
    });
  } catch (error) {
    console.error('Error fetching next journey:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/journeys/:id
router.get('/journeys/:id', (req, res) => {
  try {
    const journeyId = parseInt(req.params.id, 10);
    const journey = db.prepare(`SELECT * FROM journeys WHERE id = ?`).get(journeyId);
    
    if (!journey) {
      return res.status(404).json({ success: false, error: 'Journey not found' });
    }

    const stops = db.prepare(`SELECT * FROM station_stops WHERE journey_id = ? ORDER BY stop_order ASC`).all(journeyId);

    const timing = computeJourneyStatus(journey);

    res.json({
      success: true,
      data: {
        ...journey,
        ...timing,
        stops
      }
    });
  } catch (error) {
    console.error('Error fetching journey:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/journeys
router.post('/journeys', (req, res) => {
  try {
    let {
      journey_type = 'intercity',
      suburban_city = '',
      suburban_line = '',
      train_name = '',
      train_number = '',
      origin = '',
      destination = '',
      journey_date = '',
      departure_time = '',
      arrival_time = '',
      arrival_date_offset = 0,
      coach = '',
      seat = '',
      travel_class = '',
      pnr = '',
      platform = '',
      notes = '',
      stops = [],
      is_waiting_list = false,
      waiting_list_number = ''
    } = req.body;

    const isSuburban = journey_type === 'suburban';
    const isWL = !isSuburban && (Boolean(is_waiting_list) || Boolean(waiting_list_number && String(waiting_list_number).trim()));

    if (isSuburban) {
      if (!origin || !destination || !journey_date) {
        return res.status(400).json({ success: false, error: 'Origin, Destination, and Journey Date are required for suburban journeys' });
      }
      if (!train_name || !train_name.trim()) {
        train_name = `${suburban_city ? suburban_city + ' ' : ''}Local EMU`;
      }
      if (!train_number || !train_number.trim()) {
        train_number = 'EMU Local';
      }
      if (!coach || !coach.trim()) {
        coach = 'General Coach';
      }
      if (!seat || !seat.trim()) {
        seat = 'Standing / Open';
      }
      if (!travel_class || !travel_class.trim()) {
        travel_class = 'Suburban EMU (2S)';
      }
      notes = '';
    } else {
      if (isWL) {
        if (!train_name || !train_number || !origin || !destination || !journey_date || !departure_time || !arrival_time || !travel_class) {
          return res.status(400).json({ success: false, error: 'Please fill in all required journey fields' });
        }
        coach = (coach && coach.trim()) ? coach.trim() : 'Waiting List';
        seat = (waiting_list_number && String(waiting_list_number).trim()) ? String(waiting_list_number).trim() : ((seat && seat.trim()) ? seat.trim() : 'WL');
      } else {
        if (!train_name || !train_number || !origin || !destination || !journey_date || !departure_time || !arrival_time || !coach || !seat || !travel_class) {
          return res.status(400).json({ success: false, error: 'Please fill in all required journey fields' });
        }
      }
    }

    const insertJourney = db.prepare(`
      INSERT INTO journeys (
        train_name, train_number, origin, destination, journey_date,
        departure_time, arrival_time, arrival_date_offset,
        coach, seat, travel_class, pnr, platform, notes,
        journey_type, suburban_city, suburban_line,
        is_waiting_list, waiting_list_number
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertJourney.run(
      train_name.trim(),
      train_number.trim(),
      origin.trim(),
      destination.trim(),
      journey_date.trim(),
      (departure_time || '').trim(),
      (arrival_time || '').trim(),
      parseInt(arrival_date_offset, 10) || 0,
      coach.trim(),
      seat.trim(),
      travel_class.trim(),
      (pnr || '').trim(),
      (platform || '').trim(),
      (notes || '').trim(),
      isSuburban ? 'suburban' : 'intercity',
      (suburban_city || '').trim(),
      (suburban_line || '').trim(),
      isWL ? 1 : 0,
      isWL ? (waiting_list_number || '').trim() : ''
    );

    const journeyId = Number(result.lastInsertRowid);

    // Insert intermediate stops
    if (Array.isArray(stops) && stops.length > 0) {
      const insertStop = db.prepare(`
        INSERT INTO station_stops (journey_id, station_name, arrival_time, departure_time, stop_order)
        VALUES (?, ?, ?, ?, ?)
      `);

      stops.forEach((stop, index) => {
        if (stop.station_name && stop.station_name.trim()) {
          insertStop.run(
            journeyId,
            stop.station_name.trim(),
            (stop.arrival_time || '').trim(),
            (stop.departure_time || '').trim(),
            index + 1
          );
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Journey created successfully',
      journeyId
    });
  } catch (error) {
    console.error('Error creating journey:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/journeys/sync (Bulk sync / restore client journeys if backend database was reset/ephemeral)
router.post('/journeys/sync', (req, res) => {
  try {
    const { journeys = [] } = req.body;
    if (!Array.isArray(journeys) || journeys.length === 0) {
      return res.json({ success: true, message: 'No journeys to sync', count: 0 });
    }

    const existingJourneys = db.prepare('SELECT train_name, train_number, journey_date, origin, destination FROM journeys').all();
    const existingKey = (j) => `${j.train_name}_${j.train_number}_${j.journey_date}_${j.origin}_${j.destination}`;
    const existingSet = new Set(existingJourneys.map(existingKey));

    const insertJourney = db.prepare(`
      INSERT INTO journeys (
        train_name, train_number, origin, destination, journey_date,
        departure_time, arrival_time, arrival_date_offset,
        coach, seat, travel_class, pnr, platform, notes,
        journey_type, suburban_city, suburban_line,
        is_waiting_list, waiting_list_number
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertStop = db.prepare(`
      INSERT INTO station_stops (journey_id, station_name, arrival_time, departure_time, stop_order)
      VALUES (?, ?, ?, ?, ?)
    `);

    let restoredCount = 0;
    db.exec('BEGIN TRANSACTION;');

    for (const j of journeys) {
      const key = existingKey(j);
      if (!existingSet.has(key)) {
        const isSuburban = j.journey_type === 'suburban';
        const isWL = Boolean(j.is_waiting_list);

        const result = insertJourney.run(
          (j.train_name || '').trim(),
          (j.train_number || '').trim(),
          (j.origin || '').trim(),
          (j.destination || '').trim(),
          (j.journey_date || '').trim(),
          (j.departure_time || '').trim(),
          (j.arrival_time || '').trim(),
          parseInt(j.arrival_date_offset, 10) || 0,
          (j.coach || '').trim(),
          (j.seat || '').trim(),
          (j.travel_class || '').trim(),
          (j.pnr || '').trim(),
          (j.platform || '').trim(),
          (j.notes || '').trim(),
          isSuburban ? 'suburban' : 'intercity',
          (j.suburban_city || '').trim(),
          (j.suburban_line || '').trim(),
          isWL ? 1 : 0,
          isWL ? (j.waiting_list_number || '').trim() : ''
        );

        const journeyId = Number(result.lastInsertRowid);
        existingSet.add(key);
        restoredCount++;

        if (Array.isArray(j.stops) && j.stops.length > 0) {
          j.stops.forEach((stop, index) => {
            if (stop.station_name && stop.station_name.trim()) {
              insertStop.run(
                journeyId,
                stop.station_name.trim(),
                (stop.arrival_time || '').trim(),
                (stop.departure_time || '').trim(),
                index + 1
              );
            }
          });
        }
      }
    }

    db.exec('COMMIT;');
    res.json({ success: true, message: `Synced ${restoredCount} journeys`, count: restoredCount });
  } catch (error) {
    console.error('Error syncing journeys:', error);
    try { db.exec('ROLLBACK;'); } catch (_) {}
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/journeys/:id
router.put('/journeys/:id', (req, res) => {
  try {
    const journeyId = parseInt(req.params.id, 10);
    const existing = db.prepare(`SELECT id FROM journeys WHERE id = ?`).get(journeyId);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Journey not found' });
    }

    let {
      journey_type = 'intercity',
      suburban_city = '',
      suburban_line = '',
      train_name = '',
      train_number = '',
      origin = '',
      destination = '',
      journey_date = '',
      departure_time = '',
      arrival_time = '',
      arrival_date_offset = 0,
      coach = '',
      seat = '',
      travel_class = '',
      pnr = '',
      platform = '',
      notes = '',
      stops = [],
      is_waiting_list = false,
      waiting_list_number = ''
    } = req.body;

    const isSuburban = journey_type === 'suburban';
    const isWL = !isSuburban && (Boolean(is_waiting_list) || Boolean(waiting_list_number && String(waiting_list_number).trim()));

    if (isSuburban) {
      if (!origin || !destination || !journey_date) {
        return res.status(400).json({ success: false, error: 'Origin, Destination, and Journey Date are required for suburban journeys' });
      }
      if (!train_name || !train_name.trim()) {
        train_name = `${suburban_city ? suburban_city + ' ' : ''}Local EMU`;
      }
      if (!train_number || !train_number.trim()) {
        train_number = 'EMU Local';
      }
      if (!coach || !coach.trim()) {
        coach = 'General Coach';
      }
      if (!seat || !seat.trim()) {
        seat = 'Standing / Open';
      }
      if (!travel_class || !travel_class.trim()) {
        travel_class = 'Suburban EMU (2S)';
      }
      notes = '';
    } else {
      if (isWL) {
        if (!train_name || !train_number || !origin || !destination || !journey_date || !departure_time || !arrival_time || !travel_class) {
          return res.status(400).json({ success: false, error: 'Missing required journey fields' });
        }
        coach = (coach && coach.trim()) ? coach.trim() : 'Waiting List';
        seat = (waiting_list_number && String(waiting_list_number).trim()) ? String(waiting_list_number).trim() : ((seat && seat.trim()) ? seat.trim() : 'WL');
      } else {
        if (!train_name || !train_number || !origin || !destination || !journey_date || !departure_time || !arrival_time || !coach || !seat || !travel_class) {
          return res.status(400).json({ success: false, error: 'Missing required journey fields' });
        }
      }
    }

    db.prepare(`
      UPDATE journeys SET
        train_name = ?, train_number = ?, origin = ?, destination = ?,
        journey_date = ?, departure_time = ?, arrival_time = ?, arrival_date_offset = ?,
        coach = ?, seat = ?, travel_class = ?, pnr = ?, platform = ?, notes = ?,
        journey_type = ?, suburban_city = ?, suburban_line = ?,
        is_waiting_list = ?, waiting_list_number = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).run(
      train_name.trim(),
      train_number.trim(),
      origin.trim(),
      destination.trim(),
      journey_date.trim(),
      (departure_time || '').trim(),
      (arrival_time || '').trim(),
      parseInt(arrival_date_offset, 10) || 0,
      coach.trim(),
      seat.trim(),
      travel_class.trim(),
      (pnr || '').trim(),
      (platform || '').trim(),
      (notes || '').trim(),
      isSuburban ? 'suburban' : 'intercity',
      (suburban_city || '').trim(),
      (suburban_line || '').trim(),
      isWL ? 1 : 0,
      isWL ? (waiting_list_number || '').trim() : '',
      journeyId
    );

    // Replace station stops
    db.prepare(`DELETE FROM station_stops WHERE journey_id = ?`).run(journeyId);

    if (Array.isArray(stops) && stops.length > 0) {
      const insertStop = db.prepare(`
        INSERT INTO station_stops (journey_id, station_name, arrival_time, departure_time, stop_order)
        VALUES (?, ?, ?, ?, ?)
      `);

      stops.forEach((stop, index) => {
        if (stop.station_name && stop.station_name.trim()) {
          insertStop.run(
            journeyId,
            stop.station_name.trim(),
            (stop.arrival_time || '').trim(),
            (stop.departure_time || '').trim(),
            index + 1
          );
        }
      });
    }

    res.json({ success: true, message: 'Journey updated successfully', journeyId });
  } catch (error) {
    console.error('Error updating journey:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/journeys/:id
router.delete('/journeys/:id', (req, res) => {
  try {
    const journeyId = parseInt(req.params.id, 10);
    const existing = db.prepare(`SELECT id FROM journeys WHERE id = ?`).get(journeyId);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Journey not found' });
    }

    db.prepare(`DELETE FROM station_stops WHERE journey_id = ?`).run(journeyId);
    db.prepare(`DELETE FROM journeys WHERE id = ?`).run(journeyId);

    res.json({ success: true, message: 'Journey deleted successfully' });
  } catch (error) {
    console.error('Error deleting journey:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/stats
router.get('/stats', (req, res) => {
  try {
    const all = db.prepare(`SELECT * FROM journeys`).all();
    const now = new Date();

    let upcoming = 0;
    let in_progress = 0;
    let completed = 0;

    let intercity_total = 0;
    let intercity_taken = 0;
    let intercity_upcoming = 0;

    let suburban_total = 0;
    let suburban_taken = 0;
    let suburban_upcoming = 0;

    let waiting_list_count = 0;
    const stationsSet = new Set();
    const citiesSet = new Set();

    all.forEach(j => {
      const st = computeJourneyStatus(j, now);
      const isSuburban = j.journey_type === 'suburban';

      if (st.status === 'upcoming') {
        upcoming++;
        if (isSuburban) suburban_upcoming++;
        else intercity_upcoming++;
      } else if (st.status === 'in_progress') {
        in_progress++;
        if (isSuburban) suburban_upcoming++;
        else intercity_upcoming++;
      } else if (st.status === 'completed') {
        completed++;
        if (isSuburban) suburban_taken++;
        else intercity_taken++;
      }

      if (isSuburban) {
        suburban_total++;
        if (j.suburban_city) citiesSet.add(j.suburban_city);
      } else {
        intercity_total++;
        const isWL = Boolean(j.is_waiting_list) || (j.coach && j.coach.toLowerCase().includes('waiting'));
        if (isWL) waiting_list_count++;
      }

      if (j.origin) stationsSet.add(j.origin);
      if (j.destination) stationsSet.add(j.destination);
    });

    res.json({
      success: true,
      data: {
        total: all.length,
        upcoming,
        in_progress,
        completed,
        intercity_total,
        intercity_taken,
        intercity_upcoming,
        suburban_total,
        suburban_taken,
        suburban_upcoming,
        waiting_list_count,
        unique_stations: stationsSet.size,
        unique_cities: citiesSet.size
      }
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/seed
router.post('/seed', (req, res) => {
  try {
    const now = new Date();
    
    // Journey 1: Upcoming Vande Bharat in 3 days
    const futureDate = new Date(now);
    futureDate.setDate(now.getDate() + 3);
    const futureDateStr = futureDate.toISOString().split('T')[0];

    // Journey 2: Past Tejas Rajdhani 7 days ago
    const pastDate = new Date(now);
    pastDate.setDate(now.getDate() - 7);
    const pastDateStr = pastDate.toISOString().split('T')[0];

    const j1 = db.prepare(`
      INSERT INTO journeys (
        train_name, train_number, origin, destination, journey_date,
        departure_time, arrival_time, arrival_date_offset,
        coach, seat, travel_class, pnr, platform, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Vande Bharat Express',
      '20644',
      'Coimbatore Jn (CBE)',
      'Chennai Central (MAS)',
      futureDateStr,
      '06:00',
      '13:50',
      0,
      'C3',
      '42 Window',
      'CC - AC Chair Car',
      '4528193021',
      'Platform 1A',
      'Morning departure. Breakfast served on board around 07:15. Pack headphones and light jacket.'
    );
    const j1Id = Number(j1.lastInsertRowid);

    const insertStop = db.prepare(`
      INSERT INTO station_stops (journey_id, station_name, arrival_time, departure_time, stop_order)
      VALUES (?, ?, ?, ?, ?)
    `);

    insertStop.run(j1Id, 'Tiruppur (TUP)', '06:45', '06:47', 1);
    insertStop.run(j1Id, 'Erode Jn (ED)', '07:30', '07:35', 2);
    insertStop.run(j1Id, 'Salem Jn (SA)', '08:25', '08:30', 3);
    insertStop.run(j1Id, 'Katpadi Jn (KPD)', '11:20', '11:25', 4);

    const j2 = db.prepare(`
      INSERT INTO journeys (
        train_name, train_number, origin, destination, journey_date,
        departure_time, arrival_time, arrival_date_offset,
        coach, seat, travel_class, pnr, platform, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Tejas Rajdhani Express',
      '12952',
      'New Delhi (NDLS)',
      'Mumbai Central (MMCT)',
      pastDateStr,
      '16:55',
      '08:35',
      1,
      'B4',
      '23 Side Lower',
      '3A - AC 3 Tier',
      '2849102844',
      'Platform 3',
      'Overnight Rajdhani express trip across Kota and Vadodara. Very comfortable ride.'
    );
    const j2Id = Number(j2.lastInsertRowid);

    insertStop.run(j2Id, 'Kota Jn (KOTA)', '21:30', '21:40', 1);
    insertStop.run(j2Id, 'Vadodara Jn (BRC)', '03:45', '03:55', 2);
    insertStop.run(j2Id, 'Surat (ST)', '05:30', '05:35', 3);

    res.json({
      success: true,
      message: 'Sample journeys loaded successfully',
      count: 2
    });
  } catch (error) {
    console.error('Error seeding data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/reset
router.post('/reset', (req, res) => {
  try {
    db.prepare(`DELETE FROM station_stops`).run();
    db.prepare(`DELETE FROM journeys`).run();

    res.json({ success: true, message: 'All journeys cleared successfully' });
  } catch (error) {
    console.error('Error resetting database:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/stations?q=...&limit=30
router.get('/stations', (req, res) => {
  try {
    const q = req.query.q ? String(req.query.q).trim() : '';
    const limit = Math.min(parseInt(req.query.limit, 10) || 40, 100);

    let stations;
    if (!q) {
      stations = db.prepare(`
        SELECT code, name, state, zone, address
        FROM stations
        WHERE name LIKE '%Jn%' OR name LIKE '%Junction%' OR name LIKE '%Central%' OR name LIKE '%Terminus%'
        ORDER BY name ASC
        LIMIT ?
      `).all(limit);
    } else {
      const tokens = q.split(/\s+/).filter(Boolean);
      const searchParam = `%${q}%`;
      const prefixParam = `${q}%`;
      const wordParam = `% ${q}%`;

      if (tokens.length > 1) {
        // Multi-word search (e.g. "Chennai Beach", "New Delhi")
        const conditions = tokens.map(() => `(name LIKE ? OR code LIKE ? OR address LIKE ?)`).join(' AND ');
        const params = [];
        tokens.forEach(t => {
          params.push(`%${t}%`, `%${t}%`, `%${t}%`);
        });
        params.push(limit);

        stations = db.prepare(`
          SELECT code, name, state, zone, address
          FROM stations
          WHERE ${conditions}
          ORDER BY 
            CASE 
              WHEN name LIKE ? THEN 1
              WHEN name LIKE ? THEN 2
              ELSE 3
            END,
            name ASC
          LIMIT ?
        `).all(...params.slice(0, -1), prefixParam, searchParam, limit);
      } else {
        stations = db.prepare(`
          SELECT code, name, state, zone, address
          FROM stations
          WHERE code LIKE ? OR name LIKE ? OR address LIKE ?
          ORDER BY 
            CASE 
              WHEN code = ? THEN 1
              WHEN code LIKE ? THEN 2
              WHEN name LIKE ? THEN 3
              WHEN name LIKE ? THEN 4
              WHEN name LIKE ? THEN 5
              ELSE 6
            END,
            name ASC
          LIMIT ?
        `).all(searchParam, searchParam, searchParam, q.toUpperCase(), prefixParam, prefixParam, wordParam, searchParam, limit);
      }
    }

    res.json({
      success: true,
      data: stations
    });
  } catch (err) {
    console.error('Error fetching stations:', err);
    res.status(500).json({ success: false, message: 'Failed to search stations' });
  }
});

module.exports = router;
