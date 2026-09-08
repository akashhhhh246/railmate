export interface StationStop {
  id?: number;
  journey_id?: number;
  station_name: string;
  arrival_time: string;
  departure_time: string;
  stop_order: number;
}

export type JourneyType = 'intercity' | 'suburban';

export interface Journey {
  id: number;
  journey_type?: JourneyType;
  suburban_city?: string;
  suburban_line?: string;
  train_name: string;
  train_number: string;
  origin: string;
  destination: string;
  journey_date: string;
  departure_time: string;
  arrival_time: string;
  arrival_date_offset: number;
  coach: string;
  seat: string;
  travel_class: string;
  pnr?: string;
  platform?: string;
  notes?: string;
  is_waiting_list?: boolean | number;
  waiting_list_number?: string;
  created_at?: string;
  updated_at?: string;
  status: 'upcoming' | 'in_progress' | 'completed';
  departureTimestamp?: number;
  arrivalTimestamp?: number;
  countdownMs?: number;
  stops?: StationStop[];
  totalStops?: number;
}

export interface JourneyFormData {
  journey_type?: JourneyType;
  suburban_city?: string;
  suburban_line?: string;
  train_name: string;
  train_number: string;
  origin: string;
  destination: string;
  journey_date: string;
  departure_time: string;
  arrival_time: string;
  arrival_date_offset: number;
  coach: string;
  seat: string;
  travel_class: string;
  pnr: string;
  platform: string;
  notes: string;
  is_waiting_list?: boolean;
  waiting_list_number?: string;
  stops: {
    station_name: string;
    arrival_time: string;
    departure_time: string;
  }[];
}

export interface JourneyStats {
  total: number;
  upcoming: number;
  in_progress: number;
  completed: number;
  intercity_total?: number;
  intercity_taken?: number;
  intercity_upcoming?: number;
  suburban_total?: number;
  suburban_taken?: number;
  suburban_upcoming?: number;
  waiting_list_count?: number;
  unique_stations?: number;
  unique_cities?: number;
}

export type ViewMode = 'dashboard' | 'journeys' | 'journey-details' | 'create-journey' | 'edit-journey' | 'past-journeys' | 'analytics';
