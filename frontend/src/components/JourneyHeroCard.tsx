import React from 'react';
import { Train, Calendar, Armchair, ArrowUpRight, Hash, Compass, Volume2, Sparkles } from 'lucide-react';
import type { Journey } from '../types';
import { Countdown } from './Countdown';
import { formatDateReadable, formatTime12h, calculateDuration } from '../utils/dateUtils';
import { playRailwayChime } from '../utils/audio';

interface JourneyHeroCardProps {
  journey: Journey;
  onOpenDetails: (id: number) => void;
}

export const JourneyHeroCard: React.FC<JourneyHeroCardProps> = ({ journey, onOpenDetails }) => {
  const isSuburban = journey.journey_type === 'suburban';
  const isWL = !isSuburban && (Boolean(journey.is_waiting_list) || (journey.coach && journey.coach.toLowerCase().includes('waiting')));
  const duration = calculateDuration(journey.departure_time, journey.arrival_time, journey.arrival_date_offset);
  const hasTimes = Boolean(journey.departure_time && journey.arrival_time);

  return (
    <div className="hero-journey-card">
      <div className="hero-header">
        <div className="hero-train-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: isSuburban ? 'linear-gradient(135deg, var(--color-green) 0%, var(--color-green-dark) 100%)' : isWL ? 'linear-gradient(135deg, var(--color-sandal) 0%, var(--color-brown-dark) 100%)' : 'linear-gradient(135deg, var(--color-blue) 0%, var(--color-blue-dark) 100%)', padding: '14px', borderRadius: 'var(--radius-md)', color: 'var(--color-white)', boxShadow: isSuburban ? '0 4px 18px rgba(16, 185, 129, 0.35)' : isWL ? '0 4px 18px rgba(245, 231, 211, 0.3)' : '0 4px 18px var(--color-blue-glow)', flexShrink: 0 }}>
              <Train size={30} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: isSuburban ? 'var(--color-green-light)' : isWL ? 'var(--color-sandal-light)' : 'var(--color-sandal)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {isSuburban ? (
                    <>🚊 Suburban Commute • {journey.suburban_city || 'City'} Network</>
                  ) : isWL ? (
                    <>⏳ Waiting List ({journey.waiting_list_number || 'WL'})</>
                  ) : (
                    <><Sparkles size={12} /> Confirmed Reservation</>
                  )}
                </span>
              </div>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-white)', marginTop: '2px', letterSpacing: '-0.02em' }}>
                {journey.train_name}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                <span className="train-badge-num">
                  {isSuburban ? (journey.suburban_line || 'EMU Local') : `#${journey.train_number}`}
                </span>
                <span className={`category-pill ${isSuburban ? 'pill-green' : 'pill-blue'}`}>
                  {journey.travel_class}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            id="btn-play-chime"
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={playRailwayChime}
            title="Play Station Departure Chime"
            style={{ color: 'var(--color-sandal)', padding: '8px 14px' }}
          >
            <Volume2 size={16} />
            <span>Station Chime</span>
          </button>

          <button
            id="btn-hero-view-details"
            className="btn btn-primary"
            onClick={() => onOpenDetails(journey.id)}
          >
            <span>{isSuburban ? 'View Commute Details & Stops' : 'View Details & Route Stops'}</span>
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>

      {/* Live Countdown */}
      <Countdown
        departureTimestamp={journey.departureTimestamp}
        arrivalTimestamp={journey.arrivalTimestamp}
        status={journey.status}
      />

      {/* Origin -> Destination Route Strip */}
      <div className="hero-route-strip">
        <div className="route-node">
          <span className="node-label" style={{ color: 'var(--color-green-light)' }}>● Origin Boarding</span>
          <span className="node-station">{journey.origin}</span>
          <span className="node-time" style={{ color: 'var(--color-green-light)' }}>
            {hasTimes ? formatTime12h(journey.departure_time) : 'Frequent Local'}
          </span>
        </div>

        <div className="route-track-visual">
          <div className="track-line">
            <Train size={18} className="track-train-icon" />
          </div>
          <span className="duration-tag">
            {hasTimes && duration ? `${duration} travel` : 'Every 5–15 min frequency'}
          </span>
        </div>

        <div className="route-node destination">
          <span className="node-label" style={{ color: 'var(--color-red-light)' }}>
            Destination Station {journey.arrival_date_offset > 0 ? `(+${journey.arrival_date_offset}d)` : ''} ●
          </span>
          <span className="node-station">{journey.destination}</span>
          <span className="node-time" style={{ color: 'var(--color-red-light)' }}>
            {hasTimes ? formatTime12h(journey.arrival_time) : 'Frequent Local'}
          </span>
        </div>
      </div>

      {/* Metadata Grid */}
      <div className="hero-meta-grid">
        <div className="meta-box" style={{ borderColor: 'var(--color-brown-border-light)' }}>
          <span className="meta-label" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-sandal)' }}>
            <Calendar size={13} /> Journey Date
          </span>
          <span className="meta-value" style={{ color: 'var(--color-white)' }}>{formatDateReadable(journey.journey_date)}</span>
        </div>

        <div className="meta-box" style={{ borderColor: isWL ? 'rgba(245, 231, 211, 0.35)' : 'var(--color-brown-border-light)' }}>
          <span className="meta-label" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: isSuburban ? 'var(--color-green-light)' : isWL ? 'var(--color-sandal)' : 'var(--color-blue-light)' }}>
            <Armchair size={13} /> {isWL ? 'Waiting Status' : 'Coach & Seating'}
          </span>
          <span className="meta-value" style={{ color: 'var(--color-white)' }}>
            {isSuburban ? 'General Coach • Standing / Open' : isWL ? `Waiting List • ${journey.waiting_list_number || 'WL'}` : `Coach ${journey.coach} • ${journey.seat}`}
          </span>
        </div>

        {journey.platform && (
          <div className="meta-box" style={{ borderColor: 'var(--color-brown-border-light)' }}>
            <span className="meta-label" style={{ color: 'var(--color-sandal-muted)' }}>Platform</span>
            <span className="meta-value" style={{ color: 'var(--color-sandal)' }}>{journey.platform}</span>
          </div>
        )}

        {!isSuburban && journey.pnr && (
          <div className="meta-box" style={{ borderColor: 'rgba(37, 99, 235, 0.4)' }}>
            <span className="meta-label" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-blue-light)' }}>
              <Hash size={13} /> PNR Number
            </span>
            <span className="meta-value" style={{ color: 'var(--color-blue-light)', letterSpacing: '0.04em' }}>{journey.pnr}</span>
          </div>
        )}

        {journey.totalStops !== undefined && journey.totalStops > 0 && (
          <div className="meta-box" style={{ borderColor: 'var(--color-brown-border-light)' }}>
            <span className="meta-label" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-sandal-muted)' }}>
              <Compass size={13} /> Route Halts
            </span>
            <span className="meta-value" style={{ color: 'var(--color-sandal)' }}>{journey.totalStops} intermediate stops</span>
          </div>
        )}
      </div>

      {!isSuburban && journey.notes && (
        <div style={{ marginTop: '20px', padding: '14px 18px', background: 'rgba(245, 231, 211, 0.04)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-brown-border)', fontSize: '0.9rem', color: 'var(--color-sandal-light)' }}>
          <strong style={{ color: 'var(--color-sandal)' }}>Trip Notes: </strong>{journey.notes}
        </div>
      )}
    </div>
  );
};
