import React from 'react';
import { Train, PlusCircle } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Upcoming Journeys',
  description = 'You have no active or scheduled train trips. Add your next train journey to track departure countdowns, routes, and station halts.',
  actionLabel = 'Add New Journey',
  onAction
}) => {
  return (
    <div className="empty-state">
      <div className="empty-icon-wrap">
        <Train size={36} />
      </div>
      <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', maxWidth: '420px', margin: '0 auto 24px', lineHeight: 1.5 }}>
        {description}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
        {onAction && (
          <button id="btn-empty-add-journey" className="btn btn-primary" onClick={onAction}>
            <PlusCircle size={18} />
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};
