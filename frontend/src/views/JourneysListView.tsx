import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import type { Journey } from '../types';
import { JourneyCard } from '../components/JourneyCard';
import { EmptyState } from '../components/EmptyState';

interface JourneysListViewProps {
  journeys: Journey[];
  onOpenJourney: (id: number) => void;
  onEditJourney: (id: number) => void;
  onDeleteJourney: (id: number, trainName: string) => void;
}

export const JourneysListView: React.FC<JourneysListViewProps> = ({
  journeys,
  onOpenJourney,
  onEditJourney,
  onDeleteJourney
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'in_progress' | 'completed'>('all');

  const filteredJourneys = journeys.filter(journey => {
    if (statusFilter !== 'all' && journey.status !== statusFilter) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = journey.train_name.toLowerCase().includes(q);
      const matchNum = journey.train_number.toLowerCase().includes(q);
      const matchOrigin = journey.origin.toLowerCase().includes(q);
      const matchDest = journey.destination.toLowerCase().includes(q);
      const matchPnr = journey.pnr ? journey.pnr.toLowerCase().includes(q) : false;

      return matchName || matchNum || matchOrigin || matchDest || matchPnr;
    }

    return true;
  });

  return (
    <div>
      {/* View Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-white)' }}>My Train Journeys</h2>
          <p style={{ color: 'var(--color-sandal-muted)', fontSize: '0.92rem', marginTop: '4px' }}>
            Comprehensive directory of your rail itineraries and booked berths.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px', background: 'var(--color-brown-card)', padding: '20px 24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-brown-border)' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-sandal)' }} />
          <input
            id="input-search-journeys"
            type="text"
            placeholder="Search by train name, train number, origin or destination station..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '48px' }}
          />
        </div>

        {/* Status Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-sandal-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginRight: '6px', fontWeight: 700 }}>
            <Filter size={14} color="var(--color-sandal)" /> Filter:
          </span>

          <button
            id="filter-all"
            type="button"
            className={`btn btn-sm ${statusFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setStatusFilter('all')}
          >
            All Journeys ({journeys.length})
          </button>

          <button
            id="filter-upcoming"
            type="button"
            className={`badge-pill ${statusFilter === 'upcoming' ? 'badge-blue' : 'badge-sandal'}`}
            style={{ cursor: 'pointer', padding: '6px 14px', border: statusFilter === 'upcoming' ? '1px solid var(--color-blue)' : undefined }}
            onClick={() => setStatusFilter('upcoming')}
          >
            ● Upcoming ({journeys.filter(j => j.status === 'upcoming').length})
          </button>

          <button
            id="filter-in_progress"
            type="button"
            className={`badge-pill ${statusFilter === 'in_progress' ? 'badge-green' : 'badge-sandal'}`}
            style={{ cursor: 'pointer', padding: '6px 14px', border: statusFilter === 'in_progress' ? '1px solid var(--color-green)' : undefined }}
            onClick={() => setStatusFilter('in_progress')}
          >
            ⚡ In Progress ({journeys.filter(j => j.status === 'in_progress').length})
          </button>

          <button
            id="filter-completed"
            type="button"
            className={`badge-pill ${statusFilter === 'completed' ? 'badge-sandal' : 'badge-sandal'}`}
            style={{ cursor: 'pointer', padding: '6px 14px', opacity: statusFilter === 'completed' ? 1 : 0.7 }}
            onClick={() => setStatusFilter('completed')}
          >
            ✓ Completed ({journeys.filter(j => j.status === 'completed').length})
          </button>
        </div>
      </div>

      {/* Journeys List / Grid */}
      {filteredJourneys.length > 0 ? (
        <div className="journey-grid">
          {filteredJourneys.map(journey => (
            <JourneyCard
              key={journey.id}
              journey={journey}
              onOpen={onOpenJourney}
              onEdit={onEditJourney}
              onDelete={onDeleteJourney}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title={searchQuery ? 'No Journeys Matched Search' : 'No Journeys Found'}
          description={searchQuery ? `No rail trips matching "${searchQuery}". Try clearing search filters.` : 'You do not have any train journeys logged in this status category.'}
        />
      )}
    </div>
  );
};
