import React, { useState } from 'react';
import { Train, Plus, Trash2, ArrowUp, ArrowDown, Save, X, Compass, CheckCircle2, Clock, MapPin, Sparkles } from 'lucide-react';
import type { JourneyFormData, JourneyType } from '../types';
import { StationAutocomplete } from './StationAutocomplete';
import { SUBURBAN_CITIES } from '../data/suburbanRoutes';
import { findKnownRoute } from '../data/trainRoutes';

interface JourneyFormProps {
  initialData?: JourneyFormData;
  isEditing?: boolean;
  onSubmit: (data: JourneyFormData) => Promise<void>;
  onCancel: () => void;
}

const POPULAR_CLASSES = [
  'CC - AC Chair Car',
  'EC - Executive Chair Car',
  '1A - AC First Class',
  '2A - AC 2 Tier',
  '3A - AC 3 Tier',
  '3E - 3 Tier Economy',
  'SL - Sleeper Class',
  '2S - Second Sitting',
  'Suburban / Local EMU',
  'First Class Local (FC)',
  'AC Local / EMU',
  'General / Unreserved (UR)'
];

function findStationIndex(stationList: string[], stationName: string): number {
  if (!stationName || !stationName.trim()) return -1;
  const clean = stationName.trim().toLowerCase();
  // Exact match
  const idx = stationList.findIndex(s => s.toLowerCase() === clean);
  if (idx !== -1) return idx;
  // Match code inside parentheses (e.g. "MS" or "TBM")
  const codeMatch = clean.match(/\(([a-z0-9]+)\)/i);
  if (codeMatch) {
    const code = codeMatch[1].toLowerCase();
    const codeIdx = stationList.findIndex(s => {
      const c = s.match(/\(([a-z0-9]+)\)/i);
      return c && c[1].toLowerCase() === code;
    });
    if (codeIdx !== -1) return codeIdx;
  }
  // Substring match
  return stationList.findIndex(s => s.toLowerCase().includes(clean) || clean.includes(s.toLowerCase()));
}

export const JourneyForm: React.FC<JourneyFormProps> = ({
  initialData,
  isEditing = false,
  onSubmit,
  onCancel
}) => {
  // Journey type: 'intercity' | 'suburban'
  const [journeyType, setJourneyType] = useState<JourneyType>(initialData?.journey_type || 'intercity');

  // Suburban city & line state
  const initialCityMatch = initialData?.suburban_city
    ? SUBURBAN_CITIES.find(c => c.name.toLowerCase() === initialData.suburban_city?.toLowerCase())
    : SUBURBAN_CITIES[0];
  const [selectedCityId, setSelectedCityId] = useState<string>(initialCityMatch ? initialCityMatch.id : 'chennai');

  const currentCity = SUBURBAN_CITIES.find(c => c.id === selectedCityId) || SUBURBAN_CITIES[0];
  const initialLineMatch = initialData?.suburban_line
    ? currentCity.lines.find(l => l.name.toLowerCase() === initialData.suburban_line?.toLowerCase())
    : currentCity.lines[0];
  const [selectedLineId, setSelectedLineId] = useState<string>(initialLineMatch ? initialLineMatch.id : currentCity.lines[0].id);

  const currentLine = currentCity.lines.find(l => l.id === selectedLineId) || currentCity.lines[0];

  // Exact departure / arrival timing known (frequency-based suburban locals often run every 5-15 mins)
  const [exactTimingKnown, setExactTimingKnown] = useState<boolean>(() => {
    if (initialData?.journey_type === 'suburban') {
      return Boolean(initialData.departure_time && initialData.arrival_time);
    }
    return true;
  });

  const [isWaitingList, setIsWaitingList] = useState<boolean>(() => {
    if (!initialData) return false;
    return Boolean(
      initialData.is_waiting_list ||
      (initialData.waiting_list_number && initialData.waiting_list_number.trim()) ||
      (initialData.coach && initialData.coach.toLowerCase().includes('waiting')) ||
      (initialData.seat && /^(wl|rac|gnwl|rlwl|pqwl)/i.test(initialData.seat.trim()))
    );
  });
  const [waitingListNumber, setWaitingListNumber] = useState<string>(() => {
    if (initialData?.waiting_list_number && initialData.waiting_list_number.trim()) {
      return initialData.waiting_list_number.trim();
    }
    if (initialData?.seat && (
      (initialData.coach && initialData.coach.toLowerCase().includes('waiting')) ||
      /^(wl|rac|gnwl|rlwl|pqwl)/i.test(initialData.seat.trim())
    )) {
      return initialData.seat.trim();
    }
    return '';
  });

  const [formData, setFormData] = useState<JourneyFormData>(() => {
    if (initialData) {
      return initialData;
    }
    return {
      journey_type: 'intercity',
      suburban_city: '',
      suburban_line: '',
      train_name: '',
      train_number: '',
      origin: '',
      destination: '',
      journey_date: new Date().toISOString().split('T')[0],
      departure_time: '08:00',
      arrival_time: '14:30',
      arrival_date_offset: 0,
      coach: '',
      seat: '',
      travel_class: 'CC - AC Chair Car',
      pnr: '',
      platform: '',
      notes: '',
      stops: []
    };
  });

  // Calculate stops strictly between origin and destination on the defined corridor
  const enRouteSuburbanStops = React.useMemo(() => {
    if (journeyType !== 'suburban' || !formData.origin || !formData.destination) {
      return [];
    }
    const originIdx = findStationIndex(currentLine.stations, formData.origin);
    const destIdx = findStationIndex(currentLine.stations, formData.destination);

    if (originIdx === -1 || destIdx === -1 || originIdx === destIdx) {
      return [];
    }

    if (originIdx < destIdx) {
      return currentLine.stations.slice(originIdx + 1, destIdx);
    } else {
      return currentLine.stations.slice(destIdx + 1, originIdx).reverse();
    }
  }, [journeyType, formData.origin, formData.destination, currentLine.stations]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // When city changes, default to its first defined corridor line
  const handleCityChange = (cityId: string) => {
    setSelectedCityId(cityId);
    const targetCity = SUBURBAN_CITIES.find(c => c.id === cityId);
    if (targetCity && targetCity.lines.length > 0) {
      setSelectedLineId(targetCity.lines[0].id);
      // Auto update suburban metadata in formData
      setFormData(prev => ({
        ...prev,
        suburban_city: targetCity.name,
        suburban_line: targetCity.lines[0].name,
        train_name: `${targetCity.name} Local EMU`
      }));
    }
  };

  const handleLineChange = (lineId: string) => {
    setSelectedLineId(lineId);
    const targetLine = currentCity.lines.find(l => l.id === lineId);
    if (targetLine) {
      setFormData(prev => ({
        ...prev,
        suburban_line: targetLine.name
      }));
    }
  };

  const handleJourneyTypeToggle = (type: JourneyType) => {
    setJourneyType(type);
    if (type === 'suburban') {
      setExactTimingKnown(false);
      setFormData(prev => ({
        ...prev,
        journey_type: 'suburban',
        suburban_city: currentCity.name,
        suburban_line: currentLine.name,
        train_name: prev.train_name || `${currentCity.name} Local EMU`,
        train_number: 'EMU Local',
        coach: 'General Coach',
        seat: 'Standing / Open Seating',
        travel_class: 'Suburban / Local EMU',
        departure_time: exactTimingKnown ? prev.departure_time : '',
        arrival_time: exactTimingKnown ? prev.arrival_time : ''
      }));
    } else {
      setExactTimingKnown(true);
      setFormData(prev => ({
        ...prev,
        journey_type: 'intercity',
        suburban_city: '',
        suburban_line: '',
        train_name: prev.train_name === `${currentCity.name} Local EMU` ? '' : prev.train_name,
        train_number: prev.train_number === 'EMU Local' ? '' : prev.train_number,
        coach: prev.coach.includes('General Coach') ? '' : prev.coach,
        seat: prev.seat.includes('Standing') ? '' : prev.seat,
        travel_class: 'CC - AC Chair Car',
        departure_time: prev.departure_time || '08:00',
        arrival_time: prev.arrival_time || '14:30'
      }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.origin.trim()) newErrors.origin = 'Starting station is required';
    if (!formData.destination.trim()) newErrors.destination = 'Destination station is required';
    if (formData.origin.trim().toLowerCase() === formData.destination.trim().toLowerCase()) {
      newErrors.destination = 'Destination cannot be the same as origin';
    }
    if (!formData.journey_date) newErrors.journey_date = 'Journey date is required';

    if (journeyType === 'intercity') {
      if (!formData.train_name.trim()) newErrors.train_name = 'Train name is required';
      if (!formData.train_number.trim()) newErrors.train_number = 'Train number is required';
      if (!formData.departure_time) newErrors.departure_time = 'Departure time is required';
      if (!formData.arrival_time) newErrors.arrival_time = 'Arrival time is required';
      if (!formData.travel_class.trim()) newErrors.travel_class = 'Class is required';

      const isWL = isWaitingList || Boolean(waitingListNumber.trim());
      if (isWL) {
        if (!waitingListNumber.trim()) {
          newErrors.waiting_list_number = 'Waiting list number is required (e.g. WL 12, GNWL 45)';
        }
      } else {
        if (!formData.coach.trim()) newErrors.coach = 'Coach is required';
        if (!formData.seat.trim()) newErrors.seat = 'Seat / Berth number is required';
      }
    } else {
      // Suburban mode: coach, seat, train_number are auto-filled, timings are optional
      if (exactTimingKnown) {
        if (!formData.departure_time) newErrors.departure_time = 'Departure time is required';
        if (!formData.arrival_time) newErrors.arrival_time = 'Arrival time is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'arrival_date_offset' ? parseInt(value, 10) : value
    }));
    if (errors[name]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  // Intermediate Stops Management (Intercity Express)
  const handleAddStop = () => {
    setFormData(prev => ({
      ...prev,
      stops: [
        ...prev.stops,
        { station_name: '', arrival_time: '', departure_time: '' }
      ]
    }));
  };

  const handleStopChange = (index: number, field: string, value: string) => {
    setFormData(prev => {
      const updatedStops = [...prev.stops];
      updatedStops[index] = { ...updatedStops[index], [field]: value };
      return { ...prev, stops: updatedStops };
    });
  };

  const handleRemoveStop = (index: number) => {
    setFormData(prev => ({
      ...prev,
      stops: prev.stops.filter((_, i) => i !== index)
    }));
  };

  const handleMoveStop = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === formData.stops.length - 1)) {
      return;
    }
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updatedStops = [...formData.stops];
    const temp = updatedStops[index];
    updatedStops[index] = updatedStops[newIndex];
    updatedStops[newIndex] = temp;

    setFormData(prev => ({ ...prev, stops: updatedStops }));
  };

  const detectedRoute = journeyType === 'intercity'
    ? findKnownRoute(formData.train_number, formData.train_name, formData.origin, formData.destination)
    : null;

  const handleAutoFillKnownStops = () => {
    if (!detectedRoute) return;
    setFormData(prev => ({
      ...prev,
      stops: detectedRoute.stops.map(s => ({
        station_name: s.station_name,
        arrival_time: s.arrival_time || '',
        departure_time: s.departure_time || ''
      }))
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    // For suburban journeys, intermediate stops are pre-fed automatically from the corridor
    const stopsPayload = journeyType === 'suburban'
      ? enRouteSuburbanStops.map(name => ({
          station_name: name,
          arrival_time: '',
          departure_time: ''
        }))
      : formData.stops;

    const isWL = journeyType === 'intercity' && (isWaitingList || Boolean(waitingListNumber.trim()));

    const payload: JourneyFormData = {
      ...formData,
      journey_type: journeyType,
      suburban_city: journeyType === 'suburban' ? currentCity.name : '',
      suburban_line: journeyType === 'suburban' ? currentLine.name : '',
      train_name:
        journeyType === 'suburban'
          ? (formData.train_name.trim() || `${currentCity.name} Local (${formData.origin} ↔ ${formData.destination})`)
          : formData.train_name.trim(),
      train_number: journeyType === 'suburban' ? (formData.train_number.trim() || 'EMU Local') : formData.train_number.trim(),
      coach: journeyType === 'suburban'
        ? (formData.coach.trim() || 'General Coach')
        : (isWL ? 'Waiting List' : formData.coach.trim()),
      seat: journeyType === 'suburban'
        ? (formData.seat.trim() || 'Standing / Open')
        : (isWL ? (waitingListNumber.trim() || 'WL') : formData.seat.trim()),
      travel_class: journeyType === 'suburban' ? (formData.travel_class.trim() || 'Suburban / Local EMU') : formData.travel_class.trim(),
      departure_time: journeyType === 'suburban' && !exactTimingKnown ? '' : (formData.departure_time || '').trim(),
      arrival_time: journeyType === 'suburban' && !exactTimingKnown ? '' : (formData.arrival_time || '').trim(),
      pnr: journeyType === 'suburban' ? '' : (formData.pnr || '').trim(),
      notes: journeyType === 'suburban' ? '' : (formData.notes || '').trim(),
      is_waiting_list: isWL,
      waiting_list_number: isWL ? waitingListNumber.trim() : '',
      stops: stopsPayload
    };

    try {
      setIsSubmitting(true);
      await onSubmit(payload);
    } catch (err: any) {
      setErrors(prev => ({ ...prev, submit: err.message || 'Failed to save journey' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isWL = journeyType === 'intercity' && (isWaitingList || Boolean(waitingListNumber.trim()));

  return (
    <div className="form-card">
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Train size={24} color="var(--color-blue-light)" />
            {isEditing ? 'Edit Journey' : 'Create New Journey'}
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Select journey service type: Intercity Express or Suburban Commuter Local.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary btn-sm"
          title="Cancel"
        >
          <X size={16} />
          Cancel
        </button>
      </div>

      {errors.submit && (
        <div style={{ marginBottom: '20px', padding: '12px 16px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: 'var(--radius-md)', color: '#fca5a5', fontSize: '0.88rem' }}>
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* STEP 1: SERVICE TYPE SELECTOR (Intercity Express vs Suburban Local) */}
        <div style={{ marginBottom: '26px' }}>
          <label className="form-label" style={{ marginBottom: '10px', fontSize: '0.92rem', color: 'var(--color-sandal-light)' }}>
            Choose Service Type <span className="required">*</span>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {/* Intercity Express Option */}
            <div
              id="type-option-intercity"
              onClick={() => handleJourneyTypeToggle('intercity')}
              style={{
                padding: '16px 18px',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                background: journeyType === 'intercity' ? 'rgba(37, 99, 235, 0.18)' : 'rgba(0, 0, 0, 0.35)',
                border: journeyType === 'intercity' ? '2px solid var(--color-blue)' : '1px solid var(--color-brown-border)',
                boxShadow: journeyType === 'intercity' ? '0 0 16px rgba(37, 99, 235, 0.25)' : 'none',
                transition: 'all 0.18s ease',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}
            >
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: journeyType === 'intercity' ? '6px solid var(--color-blue)' : '2px solid var(--color-sandal-muted)',
                  background: 'var(--color-brown-surface)',
                  flexShrink: 0,
                  marginTop: '2px'
                }}
              />
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.02rem', color: journeyType === 'intercity' ? 'var(--color-white)' : 'var(--color-sandal)' }}>
                  🚆 Intercity / Interstate Express
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-sandal-muted)', marginTop: '4px', lineHeight: 1.4 }}>
                  Express, Superfast, Mail, Vande Bharat. Reserved berths/seats, strict timings, train number, and PNR details.
                </div>
              </div>
            </div>

            {/* Suburban Local Option */}
            <div
              id="type-option-suburban"
              onClick={() => handleJourneyTypeToggle('suburban')}
              style={{
                padding: '16px 18px',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                background: journeyType === 'suburban' ? 'rgba(16, 185, 129, 0.18)' : 'rgba(0, 0, 0, 0.35)',
                border: journeyType === 'suburban' ? '2px solid var(--color-green-light)' : '1px solid var(--color-brown-border)',
                boxShadow: journeyType === 'suburban' ? '0 0 16px rgba(16, 185, 129, 0.25)' : 'none',
                transition: 'all 0.18s ease',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}
            >
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: journeyType === 'suburban' ? '6px solid var(--color-green-light)' : '2px solid var(--color-sandal-muted)',
                  background: 'var(--color-brown-surface)',
                  flexShrink: 0,
                  marginTop: '2px'
                }}
              />
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.02rem', color: journeyType === 'suburban' ? 'var(--color-white)' : 'var(--color-sandal)' }}>
                  🚊 Suburban / Local Train (EMU/MEMU)
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-sandal-muted)', marginTop: '4px', lineHeight: 1.4 }}>
                  High-frequency city local network. Unreserved open standing/coach, defined corridor routes. No seat or train number needed.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SUBURBAN-ONLY SECTION: CITY SELECTION & DEFINED ROUTES */}
        {journeyType === 'suburban' && (
          <div
            style={{
              padding: '20px',
              background: 'rgba(245, 231, 211, 0.05)',
              border: '1px solid var(--color-brown-border-light)',
              borderRadius: 'var(--radius-lg)',
              marginBottom: '26px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Compass size={18} color="var(--color-green-light)" />
              <h3 style={{ fontSize: '0.98rem', color: 'var(--color-green-light)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                Suburban Network & Defined Corridor Routes
              </h3>
            </div>

            {/* City Selector: Only cities with suburban railway */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" htmlFor="suburban-city-select">
                Select Suburban City <span className="required">*</span>
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                {SUBURBAN_CITIES.map(city => {
                  const isSelected = city.id === selectedCityId;
                  return (
                    <button
                      key={city.id}
                      type="button"
                      id={`btn-city-${city.id}`}
                      onClick={() => handleCityChange(city.id)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 'var(--radius-sm)',
                        background: isSelected ? 'var(--color-green-dark)' : 'rgba(0, 0, 0, 0.4)',
                        border: isSelected ? '1px solid var(--color-green-light)' : '1px solid var(--color-brown-border)',
                        color: isSelected ? 'var(--color-white)' : 'var(--color-sandal-light)',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {city.name}
                    </button>
                  );
                })}
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--color-sandal-muted)', marginTop: '8px' }}>
                {currentCity.networkName}
              </div>
            </div>

            {/* Defined Line / Corridor Selector */}
            <div className="form-group">
              <label className="form-label" htmlFor="suburban-line-select">
                Defined Route Corridor <span className="required">*</span>
              </label>
              <select
                id="suburban-line-select"
                value={selectedLineId}
                onChange={e => handleLineChange(e.target.value)}
                className="form-select"
                style={{ fontSize: '0.92rem', padding: '10px 14px' }}
              >
                {currentCity.lines.map(line => (
                  <option key={line.id} value={line.id}>
                    {line.name} ({line.stations.length} stops)
                  </option>
                ))}
              </select>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-sandal)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={13} color="var(--color-green-light)" />
                {currentLine.description}
              </div>
            </div>
          </div>
        )}

        {/* Section 1: Train & Route Information */}
        <h3 style={{ fontSize: '1rem', color: 'var(--color-blue-light)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px' }}>
          {journeyType === 'suburban' ? 'Suburban Route & Stations' : 'Train & Route Information'}
        </h3>

        {/* In suburban mode, train name is customizable, but train number is hidden */}
        <div className={journeyType === 'intercity' ? 'form-grid-2' : 'form-group'}>
          <div className="form-group">
            <label className="form-label" htmlFor="field-train-name">
              {journeyType === 'suburban' ? 'Commute / Train Title' : 'Train Name'} <span className="required">*</span>
            </label>
            <input
              id="field-train-name"
              type="text"
              name="train_name"
              value={formData.train_name}
              onChange={handleChange}
              placeholder={journeyType === 'suburban' ? `e.g. ${currentCity.name} Local EMU` : 'e.g. Vande Bharat Express'}
              className="form-input"
            />
            {errors.train_name && <span style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.train_name}</span>}
          </div>

          {journeyType === 'intercity' && (
            <div className="form-group">
              <label className="form-label" htmlFor="field-train-number">
                Train Number <span className="required">*</span>
              </label>
              <input
                id="field-train-number"
                type="text"
                name="train_number"
                value={formData.train_number}
                onChange={handleChange}
                placeholder="e.g. 20644"
                className="form-input"
              />
              {errors.train_number && <span style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.train_number}</span>}
            </div>
          )}
        </div>

        {/* Origin & Destination with corridor station autocompletion */}
        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="field-origin">
              Starting Station (Origin) <span className="required">*</span>
            </label>
            <StationAutocomplete
              id="field-origin"
              name="origin"
              value={formData.origin}
              onChange={val => {
                setFormData(prev => ({ ...prev, origin: val }));
                if (errors.origin) setErrors(prev => ({ ...prev, origin: '' }));
              }}
              placeholder={
                journeyType === 'suburban'
                  ? `Select origin on ${currentLine.name}...`
                  : 'Search station or code (e.g. Coimbatore, MAS, NDLS)...'
              }
              error={errors.origin}
              typeVariant="origin"
              predefinedOptions={journeyType === 'suburban' ? currentLine.stations : undefined}
              routeLabel={journeyType === 'suburban' ? currentLine.name : undefined}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="field-destination">
              Destination Station <span className="required">*</span>
            </label>
            <StationAutocomplete
              id="field-destination"
              name="destination"
              value={formData.destination}
              onChange={val => {
                setFormData(prev => ({ ...prev, destination: val }));
                if (errors.destination) setErrors(prev => ({ ...prev, destination: '' }));
              }}
              placeholder={
                journeyType === 'suburban'
                  ? `Select destination on ${currentLine.name}...`
                  : 'Search destination station (e.g. Chennai, MMCT, SBC)...'
              }
              error={errors.destination}
              typeVariant="destination"
              predefinedOptions={journeyType === 'suburban' ? currentLine.stations : undefined}
              routeLabel={journeyType === 'suburban' ? currentLine.name : undefined}
            />
          </div>
        </div>

        {/* Section 2: Date & Timing */}
        <h3 style={{ fontSize: '1rem', color: 'var(--color-blue-light)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '24px 0 14px' }}>
          Schedule & Timing
        </h3>

        {/* Suburban timing toggle: "I don't know the exact timings (High frequency local)" */}
        {journeyType === 'suburban' && (
          <div
            style={{
              marginBottom: '16px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid var(--color-brown-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Clock size={18} color="var(--color-sandal)" />
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-white)' }}>
                  Exact Departure & Arrival Time Known?
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--color-sandal-muted)' }}>
                  Suburban trains run frequently (every 5–15 mins). Leave off if you are taking the next available local.
                </div>
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                id="toggle-exact-timing"
                type="checkbox"
                checked={exactTimingKnown}
                onChange={e => {
                  const checked = e.target.checked;
                  setExactTimingKnown(checked);
                  if (!checked) {
                    setFormData(prev => ({ ...prev, departure_time: '', arrival_time: '' }));
                  } else {
                    setFormData(prev => ({ ...prev, departure_time: '08:30', arrival_time: '09:15' }));
                  }
                }}
                style={{ width: '18px', height: '18px', accentColor: 'var(--color-green)' }}
              />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: exactTimingKnown ? 'var(--color-green-light)' : 'var(--color-sandal-muted)' }}>
                {exactTimingKnown ? 'Timing Specified' : 'Frequency Commute'}
              </span>
            </label>
          </div>
        )}

        <div className={exactTimingKnown ? 'form-grid-3' : 'form-group'} style={{ maxWidth: exactTimingKnown ? undefined : '360px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="field-journey-date">
              Journey Date <span className="required">*</span>
            </label>
            <input
              id="field-journey-date"
              type="date"
              name="journey_date"
              value={formData.journey_date}
              onChange={handleChange}
              className="form-input"
            />
            {errors.journey_date && <span style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.journey_date}</span>}
          </div>

          {exactTimingKnown && (
            <>
              <div className="form-group">
                <label className="form-label" htmlFor="field-departure-time">
                  Departure Time <span className="required">*</span>
                </label>
                <input
                  id="field-departure-time"
                  type="time"
                  name="departure_time"
                  value={formData.departure_time}
                  onChange={handleChange}
                  className="form-input"
                />
                {errors.departure_time && <span style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.departure_time}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="field-arrival-time">
                  Arrival Time <span className="required">*</span>
                </label>
                <input
                  id="field-arrival-time"
                  type="time"
                  name="arrival_time"
                  value={formData.arrival_time}
                  onChange={handleChange}
                  className="form-input"
                />
                {errors.arrival_time && <span style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.arrival_time}</span>}
              </div>
            </>
          )}
        </div>

        {/* Section 3: Seat, Coach & Booking Details (Hidden for Suburban) */}
        {journeyType === 'intercity' && (
          <>
            <h3 style={{ fontSize: '1rem', color: 'var(--color-blue-light)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '24px 0 14px' }}>
              Seat & Booking Details
            </h3>

            {/* Waiting List Option Toggle & Status Card */}
            <div
              id="box-waiting-list-toggle"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
                background: isWL ? 'rgba(245, 231, 211, 0.12)' : 'rgba(0, 0, 0, 0.3)',
                border: isWL ? '1px solid var(--color-sandal)' : '1px solid var(--color-brown-border)',
                marginBottom: '16px',
                transition: 'all 0.18s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock size={18} color={isWL ? 'var(--color-sandal)' : 'var(--color-sandal-muted)'} />
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: isWL ? 'var(--color-sandal-light)' : 'var(--color-white)' }}>
                    Waiting List / RAC Ticket Option
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--color-sandal-muted)', marginTop: '2px' }}>
                    Select if your booking is on Waiting List. Coach and seat/berth inputs will be locked until chart preparation.
                  </div>
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  id="toggle-waiting-list"
                  type="checkbox"
                  checked={isWL}
                  onChange={e => {
                    const checked = e.target.checked;
                    setIsWaitingList(checked);
                    if (!checked) {
                      setWaitingListNumber('');
                      setFormData(prev => ({
                        ...prev,
                        coach: prev.coach && prev.coach.toLowerCase().includes('waiting') ? '' : prev.coach,
                        seat: (prev.seat && (/^(wl|rac|gnwl|rlwl|pqwl)/i.test(prev.seat.trim()) || prev.seat.toLowerCase().includes('waiting'))) ? '' : prev.seat
                      }));
                      if (errors.waiting_list_number) {
                        setErrors(prev => {
                          const copy = { ...prev };
                          delete copy.waiting_list_number;
                          return copy;
                        });
                      }
                    } else {
                      if (errors.coach || errors.seat) {
                        setErrors(prev => {
                          const copy = { ...prev };
                          delete copy.coach;
                          delete copy.seat;
                          return copy;
                        });
                      }
                    }
                  }}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--color-sandal)' }}
                />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: isWL ? 'var(--color-sandal)' : 'var(--color-sandal-muted)' }}>
                  {isWL ? 'Waiting List' : 'Confirmed'}
                </span>
              </label>
            </div>

            {/* Waiting List Number Input Field (visible when Waiting List option is active) */}
            {isWL && (
              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label className="form-label" htmlFor="field-waiting-list-number" style={{ color: 'var(--color-sandal)' }}>
                  Waiting List Number <span className="required">*</span>
                </label>
                <input
                  id="field-waiting-list-number"
                  type="text"
                  name="waiting_list_number"
                  value={waitingListNumber}
                  onChange={e => {
                    const val = e.target.value;
                    setWaitingListNumber(val);
                    if (val.trim() && !isWaitingList) {
                      setIsWaitingList(true);
                    }
                    if (errors.waiting_list_number) {
                      setErrors(prev => {
                        const copy = { ...prev };
                        delete copy.waiting_list_number;
                        return copy;
                      });
                    }
                  }}
                  placeholder="e.g. WL 12, GNWL 45, RLWL 8, RAC 24"
                  className="form-input"
                  style={{ borderColor: 'var(--color-sandal)', background: 'rgba(245, 231, 211, 0.06)' }}
                />
                {errors.waiting_list_number && (
                  <span style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                    {errors.waiting_list_number}
                  </span>
                )}
                <div style={{ fontSize: '0.76rem', color: 'var(--color-sandal)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🔒</span>
                  <span>
                    Coach number and seat/berth are <strong>inaccessible</strong> while on Waiting List. They will be assigned once chart preparation is done.
                  </span>
                </div>
              </div>
            )}

            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label" htmlFor="field-class">
                  Travel Class <span className="required">*</span>
                </label>
                <select
                  id="field-class"
                  name="travel_class"
                  value={formData.travel_class}
                  onChange={handleChange}
                  className="form-select"
                >
                  {POPULAR_CLASSES
                    .filter(cls =>
                      journeyType === 'intercity'
                        ? !/(Local|EMU|Unreserved)/i.test(cls)
                        : true
                    )
                    .map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                </select>
                {errors.travel_class && <span style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.travel_class}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="field-coach" style={{ color: isWL ? 'var(--color-sandal-muted)' : undefined }}>
                  Coach Number {!isWL && <span className="required">*</span>} {isWL && <span style={{ fontSize: '0.72rem', color: 'var(--color-sandal-muted)', fontWeight: 400 }}>(Inaccessible)</span>}
                </label>
                <input
                  id="field-coach"
                  type="text"
                  name="coach"
                  value={isWL ? '' : formData.coach}
                  onChange={handleChange}
                  disabled={isWL}
                  placeholder={isWL ? 'Inaccessible (Waiting List)' : 'e.g. C3, B4, S5'}
                  className="form-input"
                  style={isWL ? { opacity: 0.42, cursor: 'not-allowed', background: 'rgba(0,0,0,0.5)', borderColor: 'var(--color-brown-border)' } : undefined}
                  title={isWL ? 'Coach number is inaccessible for waiting list tickets' : undefined}
                />
                {errors.coach && <span style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.coach}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="field-seat" style={{ color: isWL ? 'var(--color-sandal-muted)' : undefined }}>
                  Seat / Berth {!isWL && <span className="required">*</span>} {isWL && <span style={{ fontSize: '0.72rem', color: 'var(--color-sandal-muted)', fontWeight: 400 }}>(Inaccessible)</span>}
                </label>
                <input
                  id="field-seat"
                  type="text"
                  name="seat"
                  value={isWL ? '' : formData.seat}
                  onChange={handleChange}
                  disabled={isWL}
                  placeholder={isWL ? 'Inaccessible (Waiting List)' : 'e.g. 42 Window, Lower Berth'}
                  className="form-input"
                  style={isWL ? { opacity: 0.42, cursor: 'not-allowed', background: 'rgba(0,0,0,0.5)', borderColor: 'var(--color-brown-border)' } : undefined}
                  title={isWL ? 'Seat/Berth is inaccessible for waiting list tickets' : undefined}
                />
                {errors.seat && <span style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.seat}</span>}
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="field-pnr">
                  PNR Number (Optional)
                </label>
                <input
                  id="field-pnr"
                  type="text"
                  name="pnr"
                  value={formData.pnr}
                  onChange={handleChange}
                  placeholder="e.g. 4528193021"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="field-platform">
                  Platform (Optional)
                </label>
                <input
                  id="field-platform"
                  type="text"
                  name="platform"
                  value={formData.platform}
                  onChange={handleChange}
                  placeholder="e.g. Platform 1A"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="field-notes">
                Journey Notes & Reminders (Optional)
              </label>
              <textarea
                id="field-notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="e.g. Pack warm hoodie, buy drinking water bottle at intermediate stop, download podcasts..."
                className="form-textarea"
              />
            </div>
          </>
        )}

        {/* Section 4: Intermediate Stations / Corridor Stops */}
        {journeyType === 'suburban' ? (
          /* AUTOMATIC SUBURBAN CORRIDOR STOPS DISPLAY */
          <div
            style={{
              marginTop: '28px',
              padding: '22px',
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid var(--color-brown-border)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-green-light)' }}>
                  <MapPin size={15} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.98rem', color: 'var(--color-white)', fontWeight: 800, margin: 0 }}>
                    Stops Between Origin & Destination
                  </h3>
                  <span style={{ fontSize: '0.76rem', color: 'var(--color-sandal-muted)' }}>
                    Pre-mapped corridor halts along {currentLine.name}
                  </span>
                </div>
              </div>

              {enRouteSuburbanStops.length > 0 && (
                <span
                  style={{
                    background: 'rgba(16, 185, 129, 0.18)',
                    color: 'var(--color-green-light)',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  {enRouteSuburbanStops.length} intermediate stop{enRouteSuburbanStops.length > 1 ? 's' : ''} ({enRouteSuburbanStops.length + 2} total stations)
                </span>
              )}
            </div>

            {/* Visual Stops Corridor */}
            {enRouteSuburbanStops.length > 0 ? (
              <div>
                {/* Origin Station */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 14px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.35)', borderRadius: 'var(--radius-sm)', marginBottom: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-green-light)', display: 'inline-block' }} />
                  <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--color-white)' }}>
                    {formData.origin}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-green-light)', fontWeight: 800, marginLeft: 'auto', background: 'rgba(16, 185, 129, 0.2)', padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.04em' }}>
                    ORIGIN
                  </span>
                </div>

                {/* Sequence of Intermediate Halts */}
                <div style={{ margin: '6px 0 6px 18px', paddingLeft: '16px', borderLeft: '2px dashed var(--color-brown-border-light)', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                  {enRouteSuburbanStops.map((stopName, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7px 12px',
                        background: 'rgba(245, 231, 211, 0.04)',
                        border: '1px solid var(--color-brown-border)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.84rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-sandal-muted)' }} />
                        <span style={{ color: 'var(--color-sandal-light)', fontWeight: 600 }}>
                          {stopName}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-sandal-muted)', fontFamily: 'var(--font-mono)' }}>
                        Halt #{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Destination Station */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 14px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.35)', borderRadius: 'var(--radius-sm)', marginTop: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-red-light)', display: 'inline-block' }} />
                  <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--color-white)' }}>
                    {formData.destination}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-red-light)', fontWeight: 800, marginLeft: 'auto', background: 'rgba(239, 68, 68, 0.2)', padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.04em' }}>
                    DESTINATION
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ padding: '22px 16px', textAlign: 'center', color: 'var(--color-sandal-muted)', fontSize: '0.86rem', background: 'rgba(245, 231, 211, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--color-brown-border)' }}>
                <Train size={24} style={{ margin: '0 auto 8px', color: 'var(--color-sandal-muted)', opacity: 0.6 }} />
                {formData.origin && formData.destination && formData.origin === formData.destination ? (
                  <span style={{ color: 'var(--color-red-light)' }}>
                    Starting station and destination cannot be identical.
                  </span>
                ) : formData.origin && formData.destination ? (
                  <span>
                    <strong>{formData.origin}</strong> and <strong>{formData.destination}</strong> are consecutive adjacent stations on {currentLine.name} with no intermediate stops in between.
                  </span>
                ) : (
                  <span>
                    Select both <strong>Starting Station</strong> and <strong>Destination Station</strong> above to automatically preview all en-route stops on this corridor.
                  </span>
                )}
              </div>
            )}
          </div>
        ) : (
          /* MANUAL INTERCITY STOPS */
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '28px 0 14px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', color: 'var(--color-blue-light)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                  Intermediate Route Stations ({formData.stops.length})
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Add stations along your route and arrange them in order
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {detectedRoute && (
                  <button
                    id="btn-autofill-known-route-stops"
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleAutoFillKnownStops}
                    title={`Auto-fill ${detectedRoute.stops.length} stops from ${detectedRoute.trainName}`}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Sparkles size={14} />
                    <span>Auto-Fill Halts ({detectedRoute.stops.length})</span>
                  </button>
                )}

                <button
                  id="btn-add-intermediate-stop"
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleAddStop}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={15} />
                  <span>Add Station Stop</span>
                </button>
              </div>
            </div>

            {detectedRoute && formData.stops.length === 0 && (
              <div style={{ marginBottom: '16px', padding: '12px 16px', background: 'rgba(37, 99, 235, 0.14)', border: '1px solid rgba(37, 99, 235, 0.4)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: 'var(--color-sandal-light)' }}>
                  <Sparkles size={15} color="var(--color-blue-light)" />
                  <span>Detected Official Route: <strong>{detectedRoute.trainName}</strong> with {detectedRoute.stops.length} pre-mapped halts.</span>
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleAutoFillKnownStops}
                  style={{ padding: '5px 12px', fontSize: '0.78rem' }}
                >
                  Apply {detectedRoute.stops.length} Halts
                </button>
              </div>
            )}

            {formData.stops.length === 0 && !detectedRoute && (
              <div style={{ padding: '20px', textAlign: 'center', background: 'rgba(245, 231, 211, 0.02)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-brown-border)', color: 'var(--color-sandal-muted)', fontSize: '0.84rem', marginBottom: '16px' }}>
                No intermediate stops added yet. Click <strong>"Add Station Stop"</strong> above to log stops between {formData.origin || 'Origin'} and {formData.destination || 'Destination'}.
              </div>
            )}

            {formData.stops.length > 0 && (
              <div className="intermediate-stops-box">
                {formData.stops.map((stop, idx) => (
                  <div key={idx} className="stop-row-input">
                    <div>
                      <label style={{ fontSize: '0.7rem', color: 'var(--color-sandal-muted)', display: 'block', marginBottom: '4px', fontWeight: 700 }}>
                        Station Name #{idx + 1}
                      </label>
                      <StationAutocomplete
                        id={`field-stop-${idx}`}
                        name={`stop_${idx}`}
                        value={stop.station_name}
                        onChange={val => handleStopChange(idx, 'station_name', val)}
                        placeholder="Search intermediate station or junction..."
                        typeVariant="intermediate"
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                        Arrival Time (Opt)
                      </label>
                      <input
                        type="time"
                        value={stop.arrival_time}
                        onChange={e => handleStopChange(idx, 'arrival_time', e.target.value)}
                        className="form-input"
                        style={{ padding: '8px 10px', fontSize: '0.88rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                        Departure Time (Opt)
                      </label>
                      <input
                        type="time"
                        value={stop.departure_time}
                        onChange={e => handleStopChange(idx, 'departure_time', e.target.value)}
                        className="form-input"
                        style={{ padding: '8px 10px', fontSize: '0.88rem' }}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '16px' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        title="Move Up"
                        disabled={idx === 0}
                        onClick={() => handleMoveStop(idx, 'up')}
                        style={{ padding: '6px 8px' }}
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        title="Move Down"
                        disabled={idx === formData.stops.length - 1}
                        onClick={() => handleMoveStop(idx, 'down')}
                        style={{ padding: '6px 8px' }}
                      >
                        <ArrowDown size={14} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        title="Remove Station"
                        onClick={() => handleRemoveStop(idx)}
                        style={{ padding: '6px 8px' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Form Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', marginTop: '32px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            id="btn-save-journey"
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={isSubmitting}
          >
            <Save size={18} />
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Journey' : 'Save Journey'}
          </button>
        </div>
      </form>
    </div>
  );
};
