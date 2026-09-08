const { db } = require('../db');

function seedJourneys() {
  console.log('🚆 Seeding sample journeys into RailMate database...');

  const sampleJourneys = [
    {
      train_name: 'Cheran SuperFast Express',
      train_number: '12674',
      origin: 'Coimbatore Jn (CBE)',
      destination: 'Chennai Central (MAS)',
      journey_date: '2026-08-01',
      departure_time: '22:50',
      arrival_time: '07:00',
      arrival_date_offset: 1,
      coach: 'A1',
      seat: '18',
      travel_class: '2A - AC 2 Tier',
      pnr: '4556417836',
      platform: '2',
      notes: 'Smooth overnight transit',
      journey_type: 'intercity',
      suburban_city: '',
      suburban_line: '',
      is_waiting_list: 0,
      waiting_list_number: '',
      stops: [
        { station_name: 'Tiruppur (TUP)', arrival_time: '23:33', departure_time: '23:35', stop_order: 1 },
        { station_name: 'Erode Junction (ED)', arrival_time: '00:25', departure_time: '00:30', stop_order: 2 },
        { station_name: 'Salem Junction (SA)', arrival_time: '01:22', departure_time: '01:25', stop_order: 3 },
        { station_name: 'Jolarpettai Junction (JTJ)', arrival_time: '03:23', departure_time: '03:25', stop_order: 4 },
        { station_name: 'Katpadi Junction (KPD)', arrival_time: '04:23', departure_time: '04:25', stop_order: 5 },
        { station_name: 'Arakkonam Junction (AJJ)', arrival_time: '05:13', departure_time: '05:15', stop_order: 6 },
        { station_name: 'Perambur (PER)', arrival_time: '06:08', departure_time: '06:10', stop_order: 7 }
      ]
    },
    {
      train_name: 'Yercaud SuperFast Express',
      train_number: '22649',
      origin: 'Chennai Central (MAS)',
      destination: 'Salem Jn (SA)',
      journey_date: '2026-08-15',
      departure_time: '23:00',
      arrival_time: '04:05',
      arrival_date_offset: 1,
      coach: 'S6',
      seat: '31L',
      travel_class: 'SL - Sleeper Class',
      pnr: '4949781832',
      platform: '11',
      notes: '',
      journey_type: 'intercity',
      suburban_city: '',
      suburban_line: '',
      is_waiting_list: 0,
      waiting_list_number: '',
      stops: []
    },
    {
      train_name: 'Chennai Local EMU',
      train_number: 'EMU Local',
      origin: 'Chennai Egmore (MS)',
      destination: 'Tambaram (TBM)',
      journey_date: '2026-08-07',
      departure_time: '18:15',
      arrival_time: '19:05',
      arrival_date_offset: 0,
      coach: 'General Coach',
      seat: 'Standing / Open Seating',
      travel_class: 'Suburban / Local EMU',
      pnr: '',
      platform: '1',
      notes: '',
      journey_type: 'suburban',
      suburban_city: 'Chennai',
      suburban_line: 'South Line (Beach ↔ Tambaram ↔ Chengalpattu)',
      is_waiting_list: 0,
      waiting_list_number: '',
      stops: []
    },
    {
      train_name: 'Chennai Local EMU',
      train_number: 'EMU Local',
      origin: 'Tambaram (TBM)',
      destination: 'Chennai Egmore (MS)',
      journey_date: '2026-08-10',
      departure_time: '08:30',
      arrival_time: '09:20',
      arrival_date_offset: 0,
      coach: 'General Coach',
      seat: 'Standing / Open Seating',
      travel_class: 'Suburban / Local EMU',
      pnr: '',
      platform: '2',
      notes: '',
      journey_type: 'suburban',
      suburban_city: 'Chennai',
      suburban_line: 'South Line (Beach ↔ Tambaram ↔ Chengalpattu)',
      is_waiting_list: 0,
      waiting_list_number: '',
      stops: []
    }
  ];

  const insertJourney = db.prepare(`
    INSERT INTO journeys (
      train_name, train_number, origin, destination,
      journey_date, departure_time, arrival_time, arrival_date_offset,
      coach, seat, travel_class, pnr, platform, notes,
      journey_type, suburban_city, suburban_line,
      is_waiting_list, waiting_list_number
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `);

  const insertStop = db.prepare(`
    INSERT INTO station_stops (journey_id, station_name, arrival_time, departure_time, stop_order)
    VALUES (?, ?, ?, ?, ?)
  `);

  db.exec('BEGIN TRANSACTION;');

  for (const j of sampleJourneys) {
    const res = insertJourney.run(
      j.train_name,
      j.train_number,
      j.origin,
      j.destination,
      j.journey_date,
      j.departure_time,
      j.arrival_time,
      j.arrival_date_offset,
      j.coach,
      j.seat,
      j.travel_class,
      j.pnr,
      j.platform,
      j.notes,
      j.journey_type,
      j.suburban_city,
      j.suburban_line,
      j.is_waiting_list,
      j.waiting_list_number
    );

    const journeyId = res.lastInsertRowid;
    if (j.stops && j.stops.length > 0) {
      for (const stop of j.stops) {
        insertStop.run(journeyId, stop.station_name, stop.arrival_time, stop.departure_time, stop.stop_order);
      }
    }
  }

  db.exec('COMMIT;');
  console.log(`✅ Seeded ${sampleJourneys.length} sample journeys successfully.`);
}

if (require.main === module) {
  seedJourneys();
}

module.exports = { seedJourneys };
