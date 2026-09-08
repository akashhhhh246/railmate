import React from 'react';
import { Train, ArrowRight, Calendar, Armchair, Edit3, Trash2, MapPin } from 'lucide-react';
import type { Journey } from '../types';
import { formatDateReadable, formatTime12h, calculateDuration } from '../utils/dateUtils';
import { Countdown } from './Countdown';

interface JourneyCardProps {
  journey: Journey;
  onOpen: (id: number) => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number, trainName: string) => void;
}

function getClassBadgeStyle(cls: string): { label: string; className: string } {
  const lower = cls.toLowerCase();
  if (lower.includes('1a')) return { label: cls, className: 'pill-sandal' };
  if (lower.includes('2a')) return { label: cls, className: 'pill-blue' };
  if (lower.includes('3a')) return { label: cls, className: 'pill-green' };
  if (lower.includes('cc') || lower.includes('chair')) return { label: cls, className: 'pill-blue' };
  if (lower.includes('sl') || lower.includes('sleeper')) return { label: cls, className: 'pill-sandal' };
  return { label: cls, className: 'pill-red' };
}

export const JourneyCard: React.FC<JourneyCardProps> = ({
  journey,
  onOpen,
  onEdit,
  onDelete
}) => {
  const isSuburban = journey.journey_type === 'suburban';
  const isWL = !isSuburban && (Boolean(journey.is_waiting_list) || (journey.coach && journey.coach.toLowerCase().includes('waiting')));
  const duration = calculateDuration(journey.departure_time, journey.arrival_time, journey.arrival_date_offset);
  const classBadge = isSuburban
    ? { label: '🚊 Suburban EMU', className: 'pill-green' }
    : getClassBadgeStyle(journey.travel_class);

  const hasTimes = Boolean(journey.departure_time && journey.arrival_time);

  return (
    <div
      className="journey-card-compact"
      onClick={() => onOpen(journey.id)}
    >
      <div>
        {/* Top Header with Class Badge, Number & Countdown */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={`category-pill ${classBadge.className}`}>
              {classBadge.label}
            </span>
            {isWL && (
              <span className="category-pill pill-sandal" style={{ fontWeight: 800 }}>
                ⏳ WL {journey.waiting_list_number || ''}
              </span>
            )}
            <span className="train-badge-num">
              {isSuburban ? (journey.suburban_city || 'Suburban') : `#${journey.train_number}`}
            </span>
          </div>

          <Countdown
            departureTimestamp={journey.departureTimestamp}
            arrivalTimestamp={journey.arrivalTimestamp}
            status={journey.status}
            compact={true}
          />
        </div>

        {/* Train Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', background: isSuburban ? 'rgba(16, 185, 129, 0.15)' : 'var(--color-blue-bg)', border: isSuburban ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(37, 99, 235, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isSuburban ? 'var(--color-green-light)' : 'var(--color-blue-light)' }}>
            <Train size={18} />
          </div>
          <div>
            <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--color-white)', letterSpacing: '-0.01em', display: 'block' }}>
              {journey.train_name}
            </span>
            {isSuburban && journey.suburban_line && (
              <span style={{ fontSize: '0.74rem', color: 'var(--color-sandal-muted)' }}>
                {journey.suburban_line}
              </span>
            )}
          </div>
        </div>

        {/* Origin -> Destination Route Box */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', background: 'rgba(0, 0, 0, 0.4)', borderRadius: 'var(--radius-md)', marginBottom: '16px', border: '1px solid var(--color-brown-border)' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--color-white)' }}>{journey.origin}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--color-green-light)', marginTop: '2px', fontWeight: 700 }}>
              {hasTimes ? formatTime12h(journey.departure_time) : 'Frequent Local'}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 10px' }}>
            <ArrowRight size={18} color="var(--color-blue-light)" />
            <span style={{ fontSize: '0.72rem', color: 'var(--color-sandal-muted)', fontFamily: 'var(--font-mono)', marginTop: '2px', fontWeight: 600 }}>
              {hasTimes && duration ? duration : 'Every 5–15 min'}
            </span>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--color-white)' }}>{journey.destination}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--color-red-light)', marginTop: '2px', fontWeight: 700 }}>
              {hasTimes ? formatTime12h(journey.arrival_time) : 'Frequent Local'}
            </div>
          </div>
        </div>

        {/* Coach / Seat / Class / Date Details */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.84rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-sandal-muted)' }}>
            <Calendar size={14} color="var(--color-sandal)" />
            <span>{formatDateReadable(journey.journey_date)}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-sandal-muted)' }}>
            <Armchair size={14} color={isSuburban ? 'var(--color-green-light)' : isWL ? 'var(--color-sandal)' : 'var(--color-blue-light)'} />
            <span style={{ color: isWL ? 'var(--color-sandal-light)' : 'var(--color-white)', fontWeight: 700 }}>
              {isSuburban ? 'General Coach • Standing/Open' : isWL ? `Waiting List: ${journey.waiting_list_number || 'WL'}` : `Coach ${journey.coach} • ${journey.seat}`}
            </span>
          </div>
        </div>

        {/* Route Halts Indicator */}
        <div style={{ marginTop: '12px', padding: '6px 10px', background: 'rgba(245, 231, 211, 0.04)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-brown-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.76rem' }}>
          <span style={{ color: 'var(--color-sandal-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <MapPin size={12} color="var(--color-blue-light)" />
            <span>Route Stations:</span>
          </span>
          <span style={{ color: 'var(--color-sandal-light)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
            {journey.stops && journey.stops.length > 0
              ? `${journey.stops.length} intermediate stops (${journey.stops.length + 2} total)`
              : 'Direct / 2 Stations'}
          </span>
        </div>
      </div>

      {/* Footer Info & Actions */}
      <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--color-brown-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <span style={{ fontSize: '0.78rem', color: journey.status === 'in_progress' ? 'var(--color-green-light)' : 'var(--color-sandal-muted)', fontWeight: 600 }}>
            {journey.status === 'in_progress' ? '● Live on Track' : journey.status === 'completed' ? '✓ Completed Trip' : 'Scheduled Rail Trip'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={e => e.stopPropagation()}>
          <button
            id={`btn-view-journey-${journey.id}`}
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => onOpen(journey.id)}
            style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '5px' }}
            title="View Journey Details and Stops"
          >
            <span>View Details</span>
            <ArrowRight size={13} />
          </button>
          {onEdit && (
            <button
              className="btn btn-secondary btn-sm"
              title="Edit Journey"
              onClick={() => onEdit(journey.id)}
              style={{ padding: '6px 10px' }}
            >
              <Edit3 size={13} />
            </button>
          )}
          {onDelete && (
            <button
              className="btn btn-danger btn-sm"
              title="Delete Journey"
              onClick={() => onDelete(journey.id, journey.train_name)}
              style={{ padding: '6px 10px' }}
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
