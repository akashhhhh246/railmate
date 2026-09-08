import React, { useState } from 'react';
import {
  ArrowDown, Flag, Clock, Navigation, Search,
  GitCommit, Sparkles, Plus, Edit3
} from 'lucide-react';
import type { StationStop } from '../types';
import { formatTime12h } from '../utils/dateUtils';
import { findKnownRoute } from '../data/trainRoutes';

interface StationTimelineProps {
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  stops?: StationStop[];
  arrivalDateOffset?: number;
  journeyType?: 'intercity' | 'suburban';
  trainNumber?: string;
  trainName?: string;
  onEditStops?: () => void;
  onAutoFillStops?: (stops: { station_name: string; arrival_time?: string; departure_time?: string }[]) => void;
}

function calculateHalt(arrTime?: string, depTime?: string): string | null {
  if (!arrTime || !depTime) return null;
  try {
    const [ah, am] = arrTime.split(':').map(Number);
    const [dh, dm] = depTime.split(':').map(Number);
    let diff = (dh * 60 + dm) - (ah * 60 + am);
    if (diff < 0) diff += 24 * 60;
    if (diff === 0) return '1 min halt';
    return `${diff} min halt`;
  } catch {
    return null;
  }
}

export const StationTimeline: React.FC<StationTimelineProps> = ({
  origin,
  destination,
  departureTime,
  arrivalTime,
  stops = [],
  arrivalDateOffset = 0,
  journeyType,
  trainNumber,
  trainName,
  onEditStops,
  onAutoFillStops
}) => {
  const [searchFilter, setSearchFilter] = useState('');

  const sortedStops = [...stops].sort((a, b) => a.stop_order - b.stop_order);

  // Check if known route suggestions exist in catalogue
  const suggestedRoute = findKnownRoute(trainNumber, trainName, origin, destination);

  // Filter stops by query if user types in search box
  const filteredStops = sortedStops.filter(stop => {
    if (!searchFilter.trim()) return true;
    return stop.station_name.toLowerCase().includes(searchFilter.toLowerCase());
  });

  const totalStationCount = sortedStops.length + 2;

  // Edit stops allowed only for intercity journeys; suburban stops are preloaded
  const canEditStops = journeyType !== 'suburban' && !!onEditStops;

  return (
    <div style={{ background: 'var(--color-brown-card)', border: '1px solid var(--color-brown-border)', borderRadius: 'var(--radius-xl)', padding: '32px', marginBottom: '28px', boxShadow: '0 12px 36px rgba(0, 0, 0, 0.5)' }}>
      {/* Header and Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-white)', margin: 0 }}>
            <span style={{ background: 'linear-gradient(135deg, var(--color-blue) 0%, var(--color-blue-dark) 100%)', padding: '6px', borderRadius: '8px', color: 'var(--color-white)', display: 'flex', boxShadow: '0 2px 10px var(--color-blue-glow)' }}>
              <Navigation size={18} />
            </span>
            <span>Station Route &amp; Stops</span>
          </h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--color-sandal-muted)', marginTop: '4px' }}>
            En-route station halts, arrival/departure timings, and halt durations.
          </p>
        </div>

        {/* Header Right: Stops Badge & Edit Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--color-blue-light)', background: 'var(--color-blue-bg)', padding: '6px 14px', borderRadius: 'var(--radius-pill)', fontFamily: 'var(--font-mono)', border: '1px solid rgba(37, 99, 235, 0.4)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <GitCommit size={13} />
            {totalStationCount} Stations ({sortedStops.length} En-Route)
          </span>

          {canEditStops && (
            <button
              id="btn-edit-route-stops"
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onEditStops}
              style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <Edit3 size={13} />
              <span>Edit Stops</span>
            </button>
          )}
        </div>
      </div>

      {/* Auto-Fill Banner if route is recognized and stops are currently empty */}
      {sortedStops.length === 0 && suggestedRoute && onAutoFillStops && (
        <div
          id="banner-autofill-stops"
          style={{
            marginBottom: '20px',
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(37, 99, 235, 0.14)',
            border: '1px solid rgba(37, 99, 235, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={18} color="var(--color-blue-light)" />
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-white)' }}>
                Matched Route: {suggestedRoute.trainName} ({suggestedRoute.stops.length} en-route stops available)
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-sandal-muted)', marginTop: '2px' }}>
                We found official Indian Railways halt stops for this route ({origin} ➔ {destination}).
              </div>
            </div>
          </div>

          <button
            id="btn-autofill-stops-now"
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => onAutoFillStops(suggestedRoute.stops)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Sparkles size={14} />
            <span>Auto-Populate Route Stops</span>
          </button>
        </div>
      )}

      {/* Optional Search Filter when there are multiple stops */}
      {sortedStops.length > 3 && (
        <div style={{ marginBottom: '20px', position: 'relative', maxWidth: '340px' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-sandal-muted)' }} />
          <input
            id="input-filter-stations"
            type="text"
            placeholder="Search station in route..."
            value={searchFilter}
            onChange={e => setSearchFilter(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '34px', fontSize: '0.84rem', padding: '6px 12px 6px 34px' }}
          />
        </div>
      )}

      {/* EMPTY STOPS NOTICE */}
      {sortedStops.length === 0 && (
        <div style={{ padding: '20px', textAlign: 'center', background: 'rgba(245, 231, 211, 0.03)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-brown-border)', marginBottom: '24px' }}>
          <div style={{ color: 'var(--color-sandal)', fontWeight: 700, fontSize: '0.94rem' }}>
            Direct Corridor Service / No Intermediate Halts Logged
          </div>
          <p style={{ color: 'var(--color-sandal-muted)', fontSize: '0.82rem', marginTop: '4px', maxWidth: '500px', margin: '4px auto 14px' }}>
            Only starting station ({origin}) and destination station ({destination}) are recorded.
          </p>
          {canEditStops && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onEditStops}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={14} />
              <span>Add Station Halts to this Journey</span>
            </button>
          )}
        </div>
      )}

      {/* TIMELINE VIEW (always shown) */}
      <div className="station-timeline">
        {/* Origin Station */}
        <div className="timeline-node">
          <div className="timeline-marker start">
            <ArrowDown size={15} />
          </div>
          <div className="timeline-content" style={{ borderColor: 'rgba(22, 163, 74, 0.4)', background: 'linear-gradient(90deg, rgba(22, 163, 74, 0.08) 0%, rgba(0, 0, 0, 0.35) 100%)' }}>
            <div>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--color-green-light)', fontWeight: 800, letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-green-light)' }}></span>
                Origin Boarding Station
              </div>
              <div className="timeline-station-name" style={{ marginTop: '2px' }}>{origin}</div>
            </div>
            <div className="timeline-times">
              <div className="time-item">
                <span className="time-label">Departure</span>
                <span className="time-val" style={{ color: 'var(--color-green-light)', fontSize: '1rem' }}>
                  {departureTime ? formatTime12h(departureTime) : 'Frequent Local'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Intermediate Stations */}
        {filteredStops.map((stop, index) => {
          const halt = calculateHalt(stop.arrival_time, stop.departure_time);
          return (
            <div className="timeline-node" key={stop.id || index}>
              <div className="timeline-marker intermediate"></div>
              <div className="timeline-content">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-blue-light)', fontWeight: 700, background: 'var(--color-blue-bg)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(37, 99, 235, 0.3)' }}>
                      Halt #{stop.stop_order || index + 1}
                    </span>
                    {halt && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-sandal)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                        <Clock size={11} />
                        {halt}
                      </span>
                    )}
                  </div>
                  <div className="timeline-station-name" style={{ fontSize: '1.05rem', marginTop: '4px' }}>
                    {stop.station_name}
                  </div>
                </div>

                <div className="timeline-times">
                  {stop.arrival_time && (
                    <div className="time-item">
                      <span className="time-label">Arrival</span>
                      <span className="time-val" style={{ color: 'var(--color-sandal)' }}>{formatTime12h(stop.arrival_time)}</span>
                    </div>
                  )}
                  {stop.departure_time && (
                    <div className="time-item">
                      <span className="time-label">Departure</span>
                      <span className="time-val" style={{ color: 'var(--color-blue-light)' }}>{formatTime12h(stop.departure_time)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Destination Station */}
        <div className="timeline-node">
          <div className="timeline-marker end">
            <Flag size={14} />
          </div>
          <div className="timeline-content" style={{ borderColor: 'rgba(220, 38, 38, 0.45)', background: 'linear-gradient(90deg, rgba(220, 38, 38, 0.08) 0%, rgba(0, 0, 0, 0.35) 100%)' }}>
            <div>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--color-red-light)', fontWeight: 800, letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-red-light)' }}></span>
                Final Destination {arrivalDateOffset > 0 ? `(+${arrivalDateOffset} Day)` : ''}
              </div>
              <div className="timeline-station-name" style={{ marginTop: '2px' }}>{destination}</div>
            </div>
            <div className="timeline-times">
              <div className="time-item">
                <span className="time-label">Arrival</span>
                <span className="time-val" style={{ color: 'var(--color-red-light)', fontSize: '1rem' }}>
                  {arrivalTime ? formatTime12h(arrivalTime) : 'Frequent Local'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
