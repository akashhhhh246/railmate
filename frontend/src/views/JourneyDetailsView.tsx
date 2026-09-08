import React, { useState } from 'react';
import {
  Train, ArrowLeft, Calendar, Clock, Armchair, Hash,
  Edit3, Trash2, Check, Copy, Volume2, Sparkles
} from 'lucide-react';
import type { Journey } from '../types';
import { updateJourney } from '../api';
import { Countdown } from '../components/Countdown';
import { StationTimeline } from '../components/StationTimeline';
import { formatDateReadable, formatTime12h, calculateDuration } from '../utils/dateUtils';
import { playRailwayChime } from '../utils/audio';

interface JourneyDetailsViewProps {
  journey: Journey;
  onBack: () => void;
  onEdit: (id: number) => void;
  onDelete: (id: number, trainName: string) => void;
  onReload?: () => void;
}

export const JourneyDetailsView: React.FC<JourneyDetailsViewProps> = ({
  journey,
  onBack,
  onEdit,
  onDelete,
  onReload
}) => {
  const [copiedSummary, setCopiedSummary] = useState(false);
  const isSuburban = journey.journey_type === 'suburban';
  const isWL = !isSuburban && (Boolean(journey.is_waiting_list) || (journey.coach && journey.coach.toLowerCase().includes('waiting')));
  const hasTimes = Boolean(journey.departure_time && journey.arrival_time);
  const duration = calculateDuration(journey.departure_time, journey.arrival_time, journey.arrival_date_offset);

  const handleCopySummary = () => {
    let summary = '';
    if (isSuburban) {
      summary = `🚊 Suburban Commute: ${journey.train_name}
📍 Corridor: ${journey.suburban_line || 'Suburban Line'} (${journey.origin} ➔ ${journey.destination})
📅 Date: ${formatDateReadable(journey.journey_date)}
⏰ Timing: ${hasTimes ? `${formatTime12h(journey.departure_time)} - ${formatTime12h(journey.arrival_time)}` : 'Frequent Local Service (Every 5-15 mins)'}
🪑 Seating: General Compartment (Standing/Open Seating)
${journey.platform ? `🚉 Platform: ${journey.platform}` : ''}`.trim();
    } else {
      summary = `🚆 Train Journey: ${journey.train_name} (#${journey.train_number})
📍 Route: ${journey.origin} ➔ ${journey.destination}
📅 Date: ${formatDateReadable(journey.journey_date)}
⏰ Departure: ${formatTime12h(journey.departure_time)} | Arrival: ${formatTime12h(journey.arrival_time)}
🪑 Status: ${isWL ? `Waiting List (${journey.waiting_list_number || 'WL'}) • Coach & Berth Unassigned` : `Coach ${journey.coach}, Seat ${journey.seat}`} (${journey.travel_class})
${journey.pnr ? `🎫 PNR: ${journey.pnr}` : ''}
${journey.platform ? `🚉 Platform: ${journey.platform}` : ''}`.trim();
    }

    navigator.clipboard.writeText(summary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  const handleAutoFillStops = async (suggestedStops: { station_name: string; arrival_time?: string; departure_time?: string }[]) => {
    try {
      const stopsPayload = suggestedStops.map((s, idx) => ({
        station_name: s.station_name,
        arrival_time: s.arrival_time || '',
        departure_time: s.departure_time || '',
        stop_order: idx + 1
      }));

      await updateJourney(journey.id, {
        journey_type: journey.journey_type,
        suburban_city: journey.suburban_city,
        suburban_line: journey.suburban_line,
        train_name: journey.train_name,
        train_number: journey.train_number,
        origin: journey.origin,
        destination: journey.destination,
        journey_date: journey.journey_date,
        departure_time: journey.departure_time,
        arrival_time: journey.arrival_time,
        arrival_date_offset: journey.arrival_date_offset,
        coach: journey.coach,
        seat: journey.seat,
        travel_class: journey.travel_class,
        pnr: journey.pnr || '',
        platform: journey.platform || '',
        notes: journey.notes || '',
        is_waiting_list: Boolean(journey.is_waiting_list),
        waiting_list_number: journey.waiting_list_number || '',
        stops: stopsPayload
      });

      if (onReload) {
        onReload();
      }
    } catch (err) {
      console.error('Failed to auto-populate route stops:', err);
    }
  };

  return (
    <div>
      {/* Top Bar with Back Button & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '14px' }}>
        <button
          id="btn-back-to-journeys"
          className="btn btn-secondary btn-sm"
          onClick={onBack}
        >
          <ArrowLeft size={16} />
          Back to Journeys
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            id="btn-details-chime"
            className="btn btn-secondary btn-sm"
            onClick={playRailwayChime}
            style={{ color: 'var(--color-sandal)', padding: '7px 12px' }}
          >
            <Volume2 size={15} />
            <span>Chime</span>
          </button>

          <button
            id="btn-copy-summary"
            className="btn btn-secondary btn-sm"
            onClick={handleCopySummary}
            title="Copy Journey Summary to Clipboard"
          >
            {copiedSummary ? <Check size={15} color="var(--color-green-light)" /> : <Copy size={15} />}
            {copiedSummary ? 'Copied!' : 'Copy Summary'}
          </button>

          <button
            id="btn-details-edit"
            className="btn btn-secondary btn-sm"
            onClick={() => onEdit(journey.id)}
          >
            <Edit3 size={15} />
            <span>Edit</span>
          </button>

          <button
            id="btn-details-delete"
            className="btn btn-danger btn-sm"
            onClick={() => onDelete(journey.id, journey.train_name)}
          >
            <Trash2 size={15} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Main Ticket Passport Card */}
      <div style={{ background: 'var(--color-brown-card)', border: '1px solid var(--color-brown-border)', borderRadius: 'var(--radius-xl)', padding: '36px', marginBottom: '32px', boxShadow: '0 16px 44px rgba(0, 0, 0, 0.6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px dashed var(--color-brown-border)', paddingBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: isSuburban ? 'linear-gradient(135deg, var(--color-green) 0%, var(--color-green-dark) 100%)' : 'linear-gradient(135deg, var(--color-blue) 0%, var(--color-blue-dark) 100%)', padding: '14px', borderRadius: 'var(--radius-md)', color: 'var(--color-white)', boxShadow: isSuburban ? '0 4px 18px rgba(16, 185, 129, 0.35)' : '0 4px 18px var(--color-blue-glow)', flexShrink: 0 }}>
              <Train size={32} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span className={`badge-pill ${isSuburban ? 'badge-green' : isWL ? 'badge-sandal' : 'badge-sandal'}`} style={{ fontSize: '0.72rem', border: isWL ? '1px solid var(--color-sandal)' : undefined }}>
                  {isSuburban ? '🚊 SUBURBAN COMMUTE' : isWL ? `⏳ WAITING LIST (${journey.waiting_list_number || 'WL'})` : <><Sparkles size={11} /> BOARDING PASS</>}
                </span>
                <span className="badge-pill badge-blue" style={{ fontSize: '0.72rem' }}>
                  {journey.travel_class}
                </span>
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-white)' }}>{journey.train_name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <span className="train-badge-num">
                  {isSuburban ? (journey.suburban_line || 'EMU Local') : `#${journey.train_number}`}
                </span>
                {isSuburban && journey.suburban_city && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-sandal-muted)' }}>
                    • {journey.suburban_city} Suburban Network
                  </span>
                )}
              </div>
            </div>
          </div>

          <div>
            <Countdown
              departureTimestamp={journey.departureTimestamp}
              arrivalTimestamp={journey.arrivalTimestamp}
              status={journey.status}
            />
          </div>
        </div>

        {/* Route Details Box */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', background: 'rgba(0, 0, 0, 0.4)', padding: '24px 30px', borderRadius: 'var(--radius-lg)', marginBottom: '24px', border: '1px solid var(--color-brown-border)' }}>
          <div>
            <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-green-light)', fontWeight: 800 }}>
              Boarding Origin
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '2px', color: 'var(--color-white)' }}>
              {journey.origin}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.15rem', color: 'var(--color-green-light)', marginTop: '4px', fontWeight: 700 }}>
              {hasTimes ? formatTime12h(journey.departure_time) : 'Frequent Local'}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 20px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-sandal)', fontFamily: 'var(--font-mono)', marginBottom: '6px', fontWeight: 700 }}>
              {hasTimes && duration ? `${duration} travel` : 'Regular Local Service'}
            </span>
            <div style={{ width: '130px', height: '4px', background: 'linear-gradient(90deg, var(--color-green) 0%, var(--color-blue) 50%, var(--color-red) 100%)', borderRadius: '2px', position: 'relative' }}></div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-red-light)', fontWeight: 800 }}>
              Destination {journey.arrival_date_offset > 0 ? `(+${journey.arrival_date_offset}d)` : ''}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '2px', color: 'var(--color-white)' }}>
              {journey.destination}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.15rem', color: 'var(--color-red-light)', marginTop: '4px', fontWeight: 700 }}>
              {hasTimes ? formatTime12h(journey.arrival_time) : 'Frequent Local'}
            </div>
          </div>
        </div>

        {/* Ticket Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '14px' }}>
          <div className="meta-box">
            <span className="meta-label" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-sandal)' }}>
              <Calendar size={13} /> Date
            </span>
            <span className="meta-value">{formatDateReadable(journey.journey_date)}</span>
          </div>

          <div className="meta-box" style={{ borderColor: isWL ? 'var(--color-sandal)' : undefined }}>
            <span className="meta-label" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: isSuburban ? 'var(--color-green-light)' : isWL ? 'var(--color-sandal)' : 'var(--color-blue-light)' }}>
              <Armchair size={13} /> Coach
            </span>
            <span className="meta-value">{isSuburban ? 'General Coach' : isWL ? 'Not Allocated' : `Coach ${journey.coach}`}</span>
          </div>

          <div className="meta-box" style={{ borderColor: isWL ? 'var(--color-sandal)' : undefined }}>
            <span className="meta-label" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: isSuburban ? 'var(--color-green-light)' : isWL ? 'var(--color-sandal)' : 'var(--color-blue-light)' }}>
              <Armchair size={13} /> {isWL ? 'Waiting Status' : 'Seating'}
            </span>
            <span className="meta-value">{isSuburban ? 'Standing / Open' : isWL ? (journey.waiting_list_number || 'Waiting List') : journey.seat}</span>
          </div>

          <div className="meta-box">
            <span className="meta-label" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-sandal)' }}>
              <Clock size={13} /> Service Type
            </span>
            <span className="meta-value">{isSuburban ? 'High Frequency EMU' : (duration || '--')}</span>
          </div>

          {journey.platform && (
            <div className="meta-box">
              <span className="meta-label" style={{ color: 'var(--color-sandal-muted)' }}>Platform</span>
              <span className="meta-value" style={{ color: 'var(--color-sandal)' }}>{journey.platform}</span>
            </div>
          )}

          {!isSuburban && journey.pnr && (
            <div className="meta-box" style={{ borderColor: 'rgba(37, 99, 235, 0.4)' }}>
              <span className="meta-label" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-blue-light)' }}>
                <Hash size={13} /> PNR
              </span>
              <span className="meta-value" style={{ color: 'var(--color-blue-light)' }}>{journey.pnr}</span>
            </div>
          )}
        </div>

        {isWL && (
          <div style={{ marginTop: '20px', padding: '14px 18px', background: 'rgba(245, 231, 211, 0.08)', border: '1px dashed var(--color-sandal)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Clock size={20} color="var(--color-sandal)" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.94rem', color: 'var(--color-sandal-light)' }}>
                Ticket Status: Waiting List ({journey.waiting_list_number || 'WL'})
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-sandal-muted)', marginTop: '2px', lineHeight: 1.4 }}>
                Coach number and berth/seat allocation are generated by Indian Railways upon chart preparation (~4 hours before departure).
              </div>
            </div>
          </div>
        )}

        {!isSuburban && journey.notes && (
          <div style={{ marginTop: '22px', padding: '16px 20px', background: 'rgba(245, 231, 211, 0.04)', border: '1px solid var(--color-brown-border)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-sandal)', fontWeight: 800, marginBottom: '4px' }}>
              Trip Notes & Reminders
            </div>
            <div style={{ fontSize: '0.92rem', color: 'var(--color-sandal-light)', lineHeight: 1.6 }}>
              {journey.notes}
            </div>
          </div>
        )}
      </div>

      {/* Station Route Timeline */}
      <StationTimeline
        origin={journey.origin}
        destination={journey.destination}
        departureTime={journey.departure_time}
        arrivalTime={journey.arrival_time}
        stops={journey.stops || []}
        arrivalDateOffset={journey.arrival_date_offset}
        journeyType={journey.journey_type}
        trainNumber={journey.train_number}
        trainName={journey.train_name}
        onEditStops={() => onEdit(journey.id)}
        onAutoFillStops={handleAutoFillStops}
      />
    </div>
  );
};
