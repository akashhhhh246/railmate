import React from 'react';
import {
  PlusCircle, Train, Compass, CheckCircle2, Clock,
  MapPin, ArrowRight, BarChart3, ShieldAlert, Calendar
} from 'lucide-react';
import type { Journey, JourneyStats } from '../types';
import { JourneyHeroCard } from '../components/JourneyHeroCard';
import { formatDateReadable } from '../utils/dateUtils';

interface DashboardViewProps {
  stats: JourneyStats | null;
  onAddJourney: () => void;
  onViewJourneys?: () => void;
  // Optional backward compatible props
  nextJourney?: Journey | null;
  recentJourneys?: Journey[];
  onOpenJourney?: (id: number) => void;
  onViewAllJourneys?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  onAddJourney,
  onViewJourneys,
  nextJourney,
  recentJourneys,
  onOpenJourney,
  onViewAllJourneys
}) => {
  const handleViewAll = onViewJourneys || onViewAllJourneys;

  const total = stats?.total ?? 0;
  const intercityTaken = stats?.intercity_taken ?? 0;
  const suburbanTaken = stats?.suburban_taken ?? 0;
  const upcoming = stats?.upcoming ?? 0;
  const inProgress = stats?.in_progress ?? 0;
  const completed = stats?.completed ?? 0;
  const intercityTotal = stats?.intercity_total ?? 0;
  const intercityUpcoming = stats?.intercity_upcoming ?? 0;
  const suburbanTotal = stats?.suburban_total ?? 0;
  const suburbanUpcoming = stats?.suburban_upcoming ?? 0;
  const waitingListCount = stats?.waiting_list_count ?? 0;
  const uniqueStations = stats?.unique_stations ?? 0;
  const uniqueCities = stats?.unique_cities ?? 0;

  const completedPct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const upcomingPct = total > 0 ? Math.round((upcoming / total) * 100) : 0;

  return (
    <div>
      {/* Top Header with Title and Add New Entry Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '18px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-sandal)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BarChart3 size={14} color="var(--color-sandal)" />
              MY TRAVEL STATISTICS
            </span>
          </div>
          <h2 style={{ fontSize: '2.15rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--color-white)' }}>
            Rail Travel Analytics & Milestones
          </h2>
          <p style={{ color: 'var(--color-sandal-muted)', fontSize: '0.94rem', marginTop: '4px' }}>
            Personal records of interstate express journeys, city suburban commutes, and upcoming departures.
          </p>
        </div>

        {/* Primary Add New Entry Action */}
        <button
          id="btn-dashboard-add-entry"
          type="button"
          className="btn btn-primary"
          onClick={onAddJourney}
          style={{ padding: '12px 22px', fontSize: '0.96rem', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <PlusCircle size={18} />
          <span>Add New Entry</span>
        </button>
      </div>

      {/* Next Upcoming / In-Progress Journey Hero Card */}
      {nextJourney && onOpenJourney && (
        <div style={{ marginBottom: '32px' }}>
          <JourneyHeroCard journey={nextJourney} onOpenDetails={onOpenJourney} />
        </div>
      )}

      {/* Primary 4-Card Statistics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '18px', marginBottom: '32px' }}>
        {/* Metric 1: Interstate / City Trains Taken */}
        <div
          id="card-stat-intercity-taken"
          style={{
            background: 'var(--color-brown-card)',
            border: '1px solid rgba(37, 99, 235, 0.45)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px 22px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '3px', background: 'var(--color-blue)' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-blue-light)', fontWeight: 800 }}>
              Interstate / City Trains Taken
            </span>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'var(--color-blue-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-blue-light)', border: '1px solid rgba(37, 99, 235, 0.3)' }}>
              <Train size={18} />
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.4rem', fontWeight: 800, color: 'var(--color-white)', lineHeight: 1 }}>
            {intercityTaken}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-sandal-muted)', marginTop: '8px' }}>
            Completed express / superfast trips ({intercityTotal} total logged)
          </div>
        </div>

        {/* Metric 2: Local / Suburban Trains Taken */}
        <div
          id="card-stat-suburban-taken"
          style={{
            background: 'var(--color-brown-card)',
            border: '1px solid rgba(22, 163, 74, 0.45)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px 22px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '3px', background: 'var(--color-green)' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-green-light)', fontWeight: 800 }}>
              Local Trains Taken
            </span>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'var(--color-green-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-green-light)', border: '1px solid rgba(22, 163, 74, 0.3)' }}>
              <Compass size={18} />
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.4rem', fontWeight: 800, color: 'var(--color-green-light)', lineHeight: 1 }}>
            {suburbanTaken}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-sandal-muted)', marginTop: '8px' }}>
            Completed commuter EMU rides ({suburbanTotal} total logged)
          </div>
        </div>

        {/* Metric 3: Upcoming Departures */}
        <div
          id="card-stat-upcoming"
          style={{
            background: 'var(--color-brown-card)',
            border: '1px solid rgba(245, 231, 211, 0.35)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px 22px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '3px', background: 'var(--color-sandal)' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-sandal)', fontWeight: 800 }}>
              Upcoming Journeys
            </span>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(245, 231, 211, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-sandal)', border: '1px solid var(--color-brown-border-light)' }}>
              <Clock size={18} />
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.4rem', fontWeight: 800, color: 'var(--color-sandal-light)', lineHeight: 1 }}>
            {upcoming}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-sandal-muted)', marginTop: '8px' }}>
            {intercityUpcoming} Interstate • {suburbanUpcoming} Local scheduled
          </div>
        </div>

        {/* Metric 4: Total Trips Logged */}
        <div
          id="card-stat-total"
          style={{
            background: 'var(--color-brown-card)',
            border: '1px solid var(--color-brown-border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px 22px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '3px', background: 'linear-gradient(90deg, var(--color-blue), var(--color-red))' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-white)', fontWeight: 800 }}>
              Total Journeys Logged
            </span>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(245, 231, 211, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-white)', border: '1px solid var(--color-brown-border-light)' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.4rem', fontWeight: 800, color: 'var(--color-white)', lineHeight: 1 }}>
            {total}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-sandal-muted)', marginTop: '8px' }}>
            {completed} completed • {inProgress} in progress • {upcoming} upcoming
          </div>
        </div>
      </div>

      {/* Two Column In-Depth Statistics Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '22px', marginBottom: '32px' }}>
        {/* Breakdown Card 1: Interstate / City Express Trains */}
        <div
          style={{
            background: 'var(--color-brown-card)',
            border: '1px solid var(--color-brown-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '28px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.45)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--color-brown-border)', paddingBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--color-blue-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-blue-light)' }}>
                <Train size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-white)', margin: 0 }}>
                  Interstate / City Trains
                </h3>
                <span style={{ fontSize: '0.76rem', color: 'var(--color-sandal-muted)' }}>
                  Express, Superfast, Mail & Vande Bharat Services
                </span>
              </div>
            </div>
            <span style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', color: 'var(--color-blue-light)', fontWeight: 800, background: 'var(--color-blue-bg)', padding: '4px 10px', borderRadius: 'var(--radius-pill)', border: '1px solid rgba(37, 99, 235, 0.3)' }}>
              {intercityTotal} Total
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(0, 0, 0, 0.25)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-brown-border)' }}>
              <span style={{ fontSize: '0.86rem', color: 'var(--color-sandal-light)' }}>Trains Taken (Completed)</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--color-white)', fontSize: '1.1rem' }}>{intercityTaken}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(0, 0, 0, 0.25)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-brown-border)' }}>
              <span style={{ fontSize: '0.86rem', color: 'var(--color-sandal-light)' }}>Upcoming Scheduled</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--color-blue-light)', fontSize: '1.1rem' }}>{intercityUpcoming}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(245, 231, 211, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-brown-border-light)' }}>
              <span style={{ fontSize: '0.86rem', color: 'var(--color-sandal)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldAlert size={15} />
                Waiting List Tickets
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--color-sandal-light)', fontSize: '1.1rem' }}>
                {waitingListCount}
              </span>
            </div>
          </div>
        </div>

        {/* Breakdown Card 2: Local & Suburban Commute Trains */}
        <div
          style={{
            background: 'var(--color-brown-card)',
            border: '1px solid var(--color-brown-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '28px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.45)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--color-brown-border)', paddingBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--color-green-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-green-light)' }}>
                <Compass size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-white)', margin: 0 }}>
                  Local / Suburban Trains
                </h3>
                <span style={{ fontSize: '0.76rem', color: 'var(--color-sandal-muted)' }}>
                  Corridor EMU Locals & Metro Network Rides
                </span>
              </div>
            </div>
            <span style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', color: 'var(--color-green-light)', fontWeight: 800, background: 'var(--color-green-bg)', padding: '4px 10px', borderRadius: 'var(--radius-pill)', border: '1px solid rgba(22, 163, 74, 0.3)' }}>
              {suburbanTotal} Total
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(0, 0, 0, 0.25)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-brown-border)' }}>
              <span style={{ fontSize: '0.86rem', color: 'var(--color-sandal-light)' }}>Local Trains Taken (Completed)</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--color-green-light)', fontSize: '1.1rem' }}>{suburbanTaken}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(0, 0, 0, 0.25)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-brown-border)' }}>
              <span style={{ fontSize: '0.86rem', color: 'var(--color-sandal-light)' }}>Upcoming Commutes</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--color-white)', fontSize: '1.1rem' }}>{suburbanUpcoming}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(16, 185, 129, 0.06)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <span style={{ fontSize: '0.86rem', color: 'var(--color-green-light)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={15} />
                Suburban Networks Covered
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--color-green-light)', fontSize: '1.1rem' }}>
                {uniqueCities > 0 ? `${uniqueCities} Cities` : 'None yet'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Network & Stations Milestone Bar */}
      <div
        style={{
          background: 'var(--color-brown-card)',
          border: '1px solid var(--color-brown-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px 28px',
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(245, 231, 211, 0.08)', border: '1px solid var(--color-brown-border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-sandal)' }}>
            <MapPin size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-white)' }}>
              {uniqueStations} Unique Stations Visited or Scheduled
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-sandal-muted)', marginTop: '2px' }}>
              Origin and destination stations across your logged rail journeys.
            </div>
          </div>
        </div>

        {/* Travel Status Bar */}
        <div style={{ minWidth: '220px', flex: '1', maxWidth: '380px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--color-sandal-muted)', marginBottom: '6px' }}>
            <span>Completed: {completedPct}%</span>
            <span>Upcoming: {upcomingPct}%</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'rgba(0, 0, 0, 0.4)', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: `${completedPct}%`, background: 'var(--color-green)', transition: 'width 0.3s ease' }} />
            <div style={{ width: `${upcomingPct}%`, background: 'var(--color-blue)', transition: 'width 0.3s ease' }} />
          </div>
        </div>

        {handleViewAll && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleViewAll}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>View All Journeys</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>

      {/* Recent Logged Journeys Quick View */}
      {recentJourneys && recentJourneys.length > 0 && onOpenJourney && (
        <div style={{ marginTop: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-white)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Train size={20} color="var(--color-sandal)" />
              Recent Logged Journeys ({recentJourneys.length})
            </h3>
            {handleViewAll && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleViewAll}
                style={{ fontSize: '0.82rem' }}
              >
                Open Full List →
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {recentJourneys.slice(0, 4).map(j => {
              const isSuburban = j.journey_type === 'suburban';
              return (
                <div
                  key={j.id}
                  onClick={() => onOpenJourney(j.id)}
                  style={{
                    background: 'var(--color-brown-card)',
                    border: '1px solid var(--color-brown-border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, border-color 0.2s',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-sandal)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-brown-border)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: isSuburban ? 'var(--color-green-light)' : 'var(--color-blue-light)', fontWeight: 800 }}>
                      {isSuburban ? 'EMU Suburban' : `#${j.train_number}`}
                    </span>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-pill)',
                      background: j.status === 'upcoming' ? 'rgba(37, 99, 235, 0.15)' : j.status === 'in_progress' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(22, 163, 74, 0.15)',
                      color: j.status === 'upcoming' ? 'var(--color-blue-light)' : j.status === 'in_progress' ? '#fde047' : 'var(--color-green-light)',
                      border: '1px solid currentColor'
                    }}>
                      {j.status ? j.status.toUpperCase() : 'LOGGED'}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1.08rem', fontWeight: 800, color: 'var(--color-white)', margin: '0 0 8px 0' }}>
                    {j.train_name}
                  </h4>

                  <div style={{ fontSize: '0.86rem', color: 'var(--color-sandal)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                    <span>{j.origin}</span>
                    <ArrowRight size={13} />
                    <span>{j.destination}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--color-sandal-muted)', borderTop: '1px solid var(--color-brown-border-light)', paddingTop: '10px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Calendar size={13} />
                      {formatDateReadable(j.journey_date)}
                    </span>
                    <span style={{ color: 'var(--color-sandal)', fontWeight: 700 }}>
                      View Details →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
