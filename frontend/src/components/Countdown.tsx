import React, { useState, useEffect } from 'react';
import { Clock, Navigation, CheckCircle2 } from 'lucide-react';
import { calculateCountdown } from '../utils/dateUtils';
import type { CountdownResult } from '../utils/dateUtils';

interface CountdownProps {
  departureTimestamp?: number;
  arrivalTimestamp?: number;
  status: 'upcoming' | 'in_progress' | 'completed';
  compact?: boolean;
}

export const Countdown: React.FC<CountdownProps> = ({
  departureTimestamp,
  arrivalTimestamp,
  status: initialStatus,
  compact = false
}) => {
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Determine actual dynamic status based on real-time now
  let currentStatus = initialStatus;
  if (departureTimestamp && arrivalTimestamp) {
    if (now < departureTimestamp) {
      currentStatus = 'upcoming';
    } else if (now >= departureTimestamp && now <= arrivalTimestamp) {
      currentStatus = 'in_progress';
    } else {
      currentStatus = 'completed';
    }
  }

  const countdown: CountdownResult = calculateCountdown(departureTimestamp, now);

  if (currentStatus === 'in_progress') {
    if (compact) {
      return (
        <span className="status-pill status-in-progress">
          <span className="pulse-dot"></span>
          In Progress
        </span>
      );
    }
    return (
      <div className="countdown-container" style={{ borderColor: 'var(--color-green)', background: 'linear-gradient(135deg, rgba(22, 163, 74, 0.15) 0%, rgba(18, 13, 9, 0.8) 100%)', boxShadow: '0 4px 20px var(--color-green-glow)' }}>
        <div className="countdown-left">
          <div className="countdown-icon" style={{ color: 'var(--color-green-light)', background: 'var(--color-green-bg)', borderColor: 'rgba(22, 163, 74, 0.4)', boxShadow: '0 0 15px var(--color-green-glow)' }}>
            <Navigation size={24} />
          </div>
          <div>
            <div className="countdown-label" style={{ color: 'var(--color-green-light)' }}>Live Train Status</div>
            <div className="countdown-ticker" style={{ color: 'var(--color-white)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '1.2rem', marginTop: '2px' }}>
              <span>Journey in progress</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-white)', background: 'var(--color-green)', padding: '2px 8px', borderRadius: '4px' }}>On Track</span>
            </div>
          </div>
        </div>
        <span className="status-pill status-in-progress">
          <span className="pulse-dot"></span>
          Live Journey
        </span>
      </div>
    );
  }

  if (currentStatus === 'completed') {
    if (compact) {
      return (
        <span className="status-pill status-completed">
          <CheckCircle2 size={12} />
          Completed
        </span>
      );
    }
    return (
      <div className="countdown-container" style={{ borderColor: 'var(--color-brown-border)', background: 'rgba(0, 0, 0, 0.35)' }}>
        <div className="countdown-left">
          <div className="countdown-icon" style={{ color: 'var(--color-sandal-muted)', background: 'rgba(245, 231, 211, 0.06)', borderColor: 'var(--color-brown-border)' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="countdown-label" style={{ color: 'var(--color-sandal-muted)' }}>Journey Status</div>
            <div className="countdown-ticker" style={{ color: 'var(--color-sandal)', fontWeight: 800, fontSize: '1.15rem', marginTop: '2px' }}>
              Journey completed
            </div>
          </div>
        </div>
        <span className="status-pill status-completed">Arrived</span>
      </div>
    );
  }

  // Status is upcoming
  if (compact) {
    return (
      <span className="status-pill status-upcoming" title={`Departs in ${countdown.formatted}`}>
        <Clock size={12} />
        {countdown.days > 0 ? `${countdown.days}d ${countdown.hours}h` : `${countdown.hours}h ${countdown.minutes}m`}
      </span>
    );
  }

  return (
    <div className="countdown-container">
      <div className="countdown-left">
        <div className="countdown-icon">
          <Clock size={24} />
        </div>
        <div>
          <div className="countdown-label">Time Remaining Until Departure</div>
          <div className="countdown-ticker" style={{ marginTop: '6px' }}>
            <div className="countdown-digits-group">
              {countdown.days > 0 && (
                <div className="countdown-digit-box">
                  <span style={{ color: 'var(--color-blue-light)' }}>{String(countdown.days).padStart(2, '0')}</span>{' '}
                  <span className="countdown-unit">days</span>
                </div>
              )}
              <div className="countdown-digit-box">
                <span style={{ color: 'var(--color-white)' }}>{String(countdown.hours).padStart(2, '0')}</span>{' '}
                <span className="countdown-unit">hrs</span>
              </div>
              <div className="countdown-digit-box">
                <span style={{ color: 'var(--color-white)' }}>{String(countdown.minutes).padStart(2, '0')}</span>{' '}
                <span className="countdown-unit">min</span>
              </div>
              <div className="countdown-digit-box" style={{ borderColor: 'rgba(37, 99, 235, 0.45)', background: 'var(--color-blue-bg)' }}>
                <span style={{ color: 'var(--color-blue-light)' }}>{String(countdown.seconds).padStart(2, '0')}</span>{' '}
                <span className="countdown-unit" style={{ color: 'var(--color-blue-light)' }}>sec</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <span className="status-pill status-upcoming">
        <span className="pulse-dot"></span>
        Upcoming
      </span>
    </div>
  );
};
