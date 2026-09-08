import { useState } from 'react';
import { ArrowUpDown, Archive } from 'lucide-react';
import type { Journey } from '../types';
import { JourneyCard } from '../components/JourneyCard';
import { EmptyState } from '../components/EmptyState';

interface PastJourneysViewProps {
  journeys: Journey[];
  onOpenJourney: (id: number) => void;
  onEditJourney: (id: number) => void;
  onDeleteJourney: (id: number, trainName: string) => void;
}

export const PastJourneysView: React.FC<PastJourneysViewProps> = ({
  journeys,
  onOpenJourney,
  onEditJourney,
  onDeleteJourney
}) => {
  const [sortOption, setSortOption] = useState<'recent' | 'oldest' | 'name'>('recent');

  const completedJourneys = journeys.filter(j => j.status === 'completed');

  const sortedJourneys = [...completedJourneys].sort((a, b) => {
    if (sortOption === 'recent') {
      const dateA = new Date(`${a.journey_date}T${a.departure_time}`).getTime();
      const dateB = new Date(`${b.journey_date}T${b.departure_time}`).getTime();
      return dateB - dateA;
    }
    if (sortOption === 'oldest') {
      const dateA = new Date(`${a.journey_date}T${a.departure_time}`).getTime();
      const dateB = new Date(`${b.journey_date}T${b.departure_time}`).getTime();
      return dateA - dateB;
    }
    if (sortOption === 'name') {
      return a.train_name.localeCompare(b.train_name);
    }
    return 0;
  });

  return (
    <div>
      {/* Header & Sorter */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-white)' }}>
            <span style={{ background: 'linear-gradient(135deg, var(--color-blue) 0%, var(--color-blue-dark) 100%)', padding: '8px', borderRadius: 'var(--radius-md)', color: 'var(--color-white)', display: 'flex', boxShadow: '0 4px 14px var(--color-blue-glow)' }}>
              <Archive size={22} />
            </span>
            Completed Journeys
          </h2>
          <p style={{ color: 'var(--color-sandal-muted)', fontSize: '0.92rem', marginTop: '4px' }}>
            Archived travel log of your completed rail trips, visited stations, and past routes.
          </p>
        </div>

        {/* Sorting Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.84rem', color: 'var(--color-sandal)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
            <ArrowUpDown size={15} /> Sort By:
          </span>
          <select
            id="select-sort-past-journeys"
            value={sortOption}
            onChange={e => setSortOption(e.target.value as any)}
            className="form-select"
            style={{ width: 'auto', padding: '8px 16px', fontSize: '0.86rem', borderRadius: 'var(--radius-pill)', borderColor: 'var(--color-brown-border-light)', background: 'var(--color-brown-card)', color: 'var(--color-white)' }}
          >
            <option value="recent">Most Recent First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Train Name (A - Z)</option>
          </select>
        </div>
      </div>

      {sortedJourneys.length > 0 ? (
        <div className="journey-grid">
          {sortedJourneys.map(journey => (
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
          title="No Completed Journeys Yet"
          description="Once your train journeys reach their scheduled arrival time, they will automatically appear here in your travel archive."
        />
      )}
    </div>
  );
};
