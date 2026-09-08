export interface KnownRouteStop {
  station_name: string;
  arrival_time?: string;
  departure_time?: string;
}

export interface KnownTrainRoute {
  trainNumbers: string[];
  trainName: string;
  origin: string;
  destination: string;
  defaultDepartureTime?: string;
  defaultArrivalTime?: string;
  travelClass?: string;
  stops: KnownRouteStop[];
}

export const KNOWN_INDIAN_TRAIN_ROUTES: KnownTrainRoute[] = [
  {
    trainNumbers: ['12674', '12673'],
    trainName: 'Cheran SuperFast Express',
    origin: 'Coimbatore Junction (CBE)',
    destination: 'Puratchi Thalaivar Dr. M.G. Ramachandran Central (MAS)',
    defaultDepartureTime: '22:50',
    defaultArrivalTime: '07:00',
    travelClass: 'SL - Sleeper Class',
    stops: [
      { station_name: 'Tiruppur (TUP)', arrival_time: '23:33', departure_time: '23:35' },
      { station_name: 'Erode Junction (ED)', arrival_time: '00:25', departure_time: '00:30' },
      { station_name: 'Salem Junction (SA)', arrival_time: '01:27', departure_time: '01:30' },
      { station_name: 'Jolarpettai Junction (JTJ)', arrival_time: '03:33', departure_time: '03:35' },
      { station_name: 'Katpadi Junction (KPD)', arrival_time: '04:43', departure_time: '04:45' },
      { station_name: 'Arakkonam Junction (AJJ)', arrival_time: '05:38', departure_time: '05:40' },
      { station_name: 'Perambur (PER)', arrival_time: '06:33', departure_time: '06:35' }
    ]
  },
  {
    trainNumbers: ['12675', '12676'],
    trainName: 'Kovai Superfast Express',
    origin: 'Puratchi Thalaivar Dr. M.G. Ramachandran Central (MAS)',
    destination: 'Coimbatore Junction (CBE)',
    defaultDepartureTime: '06:10',
    defaultArrivalTime: '14:05',
    travelClass: 'CC - AC Chair Car',
    stops: [
      { station_name: 'Arakkonam Junction (AJJ)', arrival_time: '07:08', departure_time: '07:10' },
      { station_name: 'Walajah Road Junction (WJR)', arrival_time: '07:28', departure_time: '07:30' },
      { station_name: 'Katpadi Junction (KPD)', arrival_time: '07:53', departure_time: '07:55' },
      { station_name: 'Ambur (AB)', arrival_time: '08:33', departure_time: '08:35' },
      { station_name: 'Jolarpettai Junction (JTJ)', arrival_time: '09:18', departure_time: '09:20' },
      { station_name: 'Morappur (MAP)', arrival_time: '09:58', departure_time: '10:00' },
      { station_name: 'Salem Junction (SA)', arrival_time: '10:52', departure_time: '10:55' },
      { station_name: 'Erode Junction (ED)', arrival_time: '11:50', departure_time: '11:55' },
      { station_name: 'Tiruppur (TUP)', arrival_time: '12:38', departure_time: '12:40' },
      { station_name: 'Coimbatore North (CBF)', arrival_time: '13:28', departure_time: '13:30' }
    ]
  },
  {
    trainNumbers: ['20643', '20644'],
    trainName: 'Coimbatore - Chennai Vande Bharat Express',
    origin: 'Coimbatore Junction (CBE)',
    destination: 'Puratchi Thalaivar Dr. M.G. Ramachandran Central (MAS)',
    defaultDepartureTime: '06:00',
    defaultArrivalTime: '11:50',
    travelClass: 'CC - AC Chair Car',
    stops: [
      { station_name: 'Tiruppur (TUP)', arrival_time: '06:35', departure_time: '06:37' },
      { station_name: 'Erode Junction (ED)', arrival_time: '07:12', departure_time: '07:15' },
      { station_name: 'Salem Junction (SA)', arrival_time: '07:58', departure_time: '08:00' }
    ]
  },
  {
    trainNumbers: ['12007', '12008'],
    trainName: 'Chennai - Mysuru Shatabdi Express',
    origin: 'Puratchi Thalaivar Dr. M.G. Ramachandran Central (MAS)',
    destination: 'Mysuru Junction (MYS)',
    defaultDepartureTime: '06:00',
    defaultArrivalTime: '13:00',
    travelClass: 'CC - AC Chair Car',
    stops: [
      { station_name: 'Katpadi Junction (KPD)', arrival_time: '07:38', departure_time: '07:40' },
      { station_name: 'Krantivira Sangolli Rayanna (Bengaluru) (SBC)', arrival_time: '10:55', departure_time: '11:00' },
      { station_name: 'Mandya (MYA)', arrival_time: '12:08', departure_time: '12:10' }
    ]
  },
  {
    trainNumbers: ['12639', '12640'],
    trainName: 'Brindavan Express',
    origin: 'Puratchi Thalaivar Dr. M.G. Ramachandran Central (MAS)',
    destination: 'Krantivira Sangolli Rayanna (Bengaluru) (SBC)',
    defaultDepartureTime: '07:40',
    defaultArrivalTime: '13:40',
    travelClass: 'CC - AC Chair Car',
    stops: [
      { station_name: 'Arakkonam Junction (AJJ)', arrival_time: '08:38', departure_time: '08:40' },
      { station_name: 'Sholinghur (SHU)', arrival_time: '08:58', departure_time: '09:00' },
      { station_name: 'Katpadi Junction (KPD)', arrival_time: '09:38', departure_time: '09:40' },
      { station_name: 'Ambur (AB)', arrival_time: '10:18', departure_time: '10:20' },
      { station_name: 'Vaniyambadi (VN)', arrival_time: '10:33', departure_time: '10:35' },
      { station_name: 'Jolarpettai Junction (JTJ)', arrival_time: '11:03', departure_time: '11:05' },
      { station_name: 'Kuppam (KPN)', arrival_time: '11:38', departure_time: '11:40' },
      { station_name: 'Bangarapet Junction (BWT)', arrival_time: '12:08', departure_time: '12:10' },
      { station_name: 'Krishnarajapuram (KJM)', arrival_time: '12:50', departure_time: '12:52' },
      { station_name: 'Bengaluru Cantt (BNC)', arrival_time: '13:08', departure_time: '13:10' }
    ]
  },
  {
    trainNumbers: ['12621', '12622'],
    trainName: 'Tamil Nadu Superfast Express',
    origin: 'Puratchi Thalaivar Dr. M.G. Ramachandran Central (MAS)',
    destination: 'New Delhi (NDLS)',
    defaultDepartureTime: '22:00',
    defaultArrivalTime: '06:30',
    travelClass: '3A - AC 3 Tier',
    stops: [
      { station_name: 'Vijayawada Junction (BZA)', arrival_time: '03:55', departure_time: '04:05' },
      { station_name: 'Warangal (WL)', arrival_time: '06:50', departure_time: '06:52' },
      { station_name: 'Balharshah Junction (BPQ)', arrival_time: '10:30', departure_time: '10:35' },
      { station_name: 'Nagpur Junction (NGP)', arrival_time: '13:50', departure_time: '13:55' },
      { station_name: 'Itarsi Junction (ET)', arrival_time: '18:30', departure_time: '18:35' },
      { station_name: 'Bhopal Junction (BPL)', arrival_time: '20:10', departure_time: '20:20' },
      { station_name: 'Virangana Lakshmibai Jhansi Junction (VGLJ)', arrival_time: '00:25', departure_time: '00:30' },
      { station_name: 'Gwalior Junction (GWL)', arrival_time: '01:35', departure_time: '01:37' },
      { station_name: 'Agra Cantt (AGC)', arrival_time: '03:15', departure_time: '03:20' }
    ]
  },
  {
    trainNumbers: ['12635', '12636'],
    trainName: 'Vaigai Superfast Express',
    origin: 'Chennai Egmore (MS)',
    destination: 'Madurai Junction (MDU)',
    defaultDepartureTime: '13:50',
    defaultArrivalTime: '21:30',
    travelClass: 'CC - AC Chair Car',
    stops: [
      { station_name: 'Tambaram (TBM)', arrival_time: '14:18', departure_time: '14:20' },
      { station_name: 'Chengalpattu Junction (CGL)', arrival_time: '14:48', departure_time: '14:50' },
      { station_name: 'Villupuram Junction (VM)', arrival_time: '16:00', departure_time: '16:05' },
      { station_name: 'Vriddhachalam Junction (VRI)', arrival_time: '16:45', departure_time: '16:47' },
      { station_name: 'Ariyalur (ALU)', arrival_time: '17:24', departure_time: '17:25' },
      { station_name: 'Tiruchchirappalli Junction (TPJ)', arrival_time: '18:50', departure_time: '18:55' },
      { station_name: 'Dindigul Junction (DG)', arrival_time: '20:12', departure_time: '20:15' }
    ]
  },
  {
    trainNumbers: ['12637', '12638'],
    trainName: 'Pandian Superfast Express',
    origin: 'Chennai Egmore (MS)',
    destination: 'Madurai Junction (MDU)',
    defaultDepartureTime: '21:40',
    defaultArrivalTime: '05:35',
    travelClass: '3A - AC 3 Tier',
    stops: [
      { station_name: 'Tambaram (TBM)', arrival_time: '22:08', departure_time: '22:10' },
      { station_name: 'Chengalpattu Junction (CGL)', arrival_time: '22:38', departure_time: '22:40' },
      { station_name: 'Villupuram Junction (VM)', arrival_time: '00:05', departure_time: '00:10' },
      { station_name: 'Vriddhachalam Junction (VRI)', arrival_time: '00:50', departure_time: '00:52' },
      { station_name: 'Tiruchchirappalli Junction (TPJ)', arrival_time: '02:50', departure_time: '02:55' },
      { station_name: 'Dindigul Junction (DG)', arrival_time: '04:12', departure_time: '04:15' }
    ]
  },
  {
    trainNumbers: ['12951', '12952'],
    trainName: 'Mumbai Rajdhani Express',
    origin: 'Mumbai Central (MMCT)',
    destination: 'New Delhi (NDLS)',
    defaultDepartureTime: '17:00',
    defaultArrivalTime: '08:32',
    travelClass: '2A - AC 2 Tier',
    stops: [
      { station_name: 'Borivali (BVI)', arrival_time: '17:22', departure_time: '17:24' },
      { station_name: 'Surat (ST)', arrival_time: '19:43', departure_time: '19:48' },
      { station_name: 'Vadodara Junction (BRC)', arrival_time: '21:06', departure_time: '21:16' },
      { station_name: 'Ratlam Junction (RTM)', arrival_time: '00:25', departure_time: '00:28' },
      { station_name: 'Kota Junction (KOTA)', arrival_time: '03:15', departure_time: '03:20' }
    ]
  },
  {
    trainNumbers: ['12123', '12124'],
    trainName: 'Deccan Queen Superfast Express',
    origin: 'Chhatrapati Shivaji Maharaj Terminus (CSMT)',
    destination: 'Pune Junction (PUNE)',
    defaultDepartureTime: '17:10',
    defaultArrivalTime: '20:25',
    travelClass: 'CC - AC Chair Car',
    stops: [
      { station_name: 'Karjat Junction (KJT)', arrival_time: '18:33', departure_time: '18:35' },
      { station_name: 'Lonavala (LNL)', arrival_time: '19:18', departure_time: '19:20' },
      { station_name: 'Shivajinagar (SVJR)', arrival_time: '20:09', departure_time: '20:10' }
    ]
  },
  {
    trainNumbers: ['12671', '12672'],
    trainName: 'Nilgiri (Blue Mountain) Superfast Express',
    origin: 'Puratchi Thalaivar Dr. M.G. Ramachandran Central (MAS)',
    destination: 'Mettupalayam (MTP)',
    defaultDepartureTime: '21:05',
    defaultArrivalTime: '06:15',
    travelClass: '1A - AC First Class',
    stops: [
      { station_name: 'Arakkonam Junction (AJJ)', arrival_time: '22:03', departure_time: '22:05' },
      { station_name: 'Katpadi Junction (KPD)', arrival_time: '22:53', departure_time: '22:55' },
      { station_name: 'Salem Junction (SA)', arrival_time: '01:52', departure_time: '01:55' },
      { station_name: 'Erode Junction (ED)', arrival_time: '02:50', departure_time: '02:55' },
      { station_name: 'Tiruppur (TUP)', arrival_time: '03:38', departure_time: '03:40' },
      { station_name: 'Coimbatore Junction (CBE)', arrival_time: '04:50', departure_time: '05:00' }
    ]
  }
];

export function findKnownRoute(trainNumber?: string, trainName?: string, origin?: string, destination?: string): KnownTrainRoute | null {
  const cleanNum = (trainNumber || '').trim();
  const cleanName = (trainName || '').trim().toLowerCase();
  const cleanOrigin = (origin || '').trim().toLowerCase();
  const cleanDest = (destination || '').trim().toLowerCase();

  // 1. Try matching by train number
  if (cleanNum) {
    const numMatch = KNOWN_INDIAN_TRAIN_ROUTES.find(r => r.trainNumbers.includes(cleanNum));
    if (numMatch) return numMatch;
  }

  // 2. Try matching by train name keyword
  if (cleanName) {
    const nameMatch = KNOWN_INDIAN_TRAIN_ROUTES.find(r => {
      const target = r.trainName.toLowerCase();
      return target.includes(cleanName) || cleanName.includes(target.split(' ')[0].toLowerCase());
    });
    if (nameMatch) return nameMatch;
  }

  // 3. Try matching origin & destination station keywords
  if (cleanOrigin && cleanDest) {
    const odMatch = KNOWN_INDIAN_TRAIN_ROUTES.find(r => {
      const origCode = r.origin.toLowerCase();
      const destCode = r.destination.toLowerCase();
      const oMatches = origCode.includes(cleanOrigin) || cleanOrigin.includes(origCode);
      const dMatches = destCode.includes(cleanDest) || cleanDest.includes(destCode);
      return oMatches && dMatches;
    });
    if (odMatch) return odMatch;
  }

  return null;
}
