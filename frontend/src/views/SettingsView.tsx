import { useState } from 'react';
import { Settings, Database, Trash2, BarChart2, Cpu } from 'lucide-react';
import type { JourneyStats } from '../types';
import { resetAllData } from '../api';
import { ConfirmModal } from '../components/ConfirmModal';

interface SettingsViewProps {
  stats: JourneyStats | null;
  onRefreshData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ stats, onRefreshData }) => {
  const [showClearModal, setShowClearModal] = useState(false);

  const handleConfirmReset = async () => {
    try {
      await resetAllData();
      setShowClearModal(false);
      onRefreshData();
    } catch (err) {
      console.error('Error resetting database:', err);
    }
  };

  return (
    <div style={{ maxWidth: '920px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.85rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-white)' }}>
          <span style={{ background: 'linear-gradient(135deg, var(--color-blue) 0%, var(--color-blue-dark) 100%)', padding: '8px', borderRadius: 'var(--radius-md)', color: 'var(--color-white)', display: 'flex', boxShadow: '0 4px 14px var(--color-blue-glow)' }}>
            <Settings size={22} />
          </span>
          Settings & Travel Data
        </h2>
        <p style={{ color: 'var(--color-sandal-muted)', fontSize: '0.92rem', marginTop: '4px' }}>
          Travel companion statistics, SQLite persistence, and test seed data tools.
        </p>
      </div>

      {/* Travel Statistics Card */}
      <div style={{ background: 'var(--color-brown-card)', border: '1px solid var(--color-brown-border)', borderRadius: 'var(--radius-xl)', padding: '28px', marginBottom: '28px', boxShadow: '0 10px 30px rgba(0,0,0,0.45)' }}>
        <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: 'var(--color-white)' }}>
          <BarChart2 size={20} color="var(--color-blue-light)" />
          Rail Companion Metrics
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
          <div className="meta-box">
            <span className="meta-label">Total Logged</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-white)', marginTop: '4px' }}>
              {stats?.total ?? 0}
            </span>
          </div>

          <div className="meta-box" style={{ borderColor: 'rgba(37, 99, 235, 0.4)', background: 'var(--color-blue-bg)' }}>
            <span className="meta-label" style={{ color: 'var(--color-blue-light)' }}>Upcoming Trips</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-white)', marginTop: '4px' }}>
              {stats?.upcoming ?? 0}
            </span>
          </div>

          <div className="meta-box" style={{ borderColor: 'rgba(22, 163, 74, 0.4)', background: 'var(--color-green-bg)' }}>
            <span className="meta-label" style={{ color: 'var(--color-green-light)' }}>Live on Track</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-green-light)', marginTop: '4px' }}>
              {stats?.in_progress ?? 0}
            </span>
          </div>

          <div className="meta-box" style={{ borderColor: 'var(--color-brown-border-light)', background: 'rgba(245, 231, 211, 0.06)' }}>
            <span className="meta-label" style={{ color: 'var(--color-sandal)' }}>Completed Trips</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-white)', marginTop: '4px' }}>
              {stats?.completed ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* Database & Data Management */}
      <div style={{ background: 'var(--color-brown-card)', border: '1px solid var(--color-brown-border)', borderRadius: 'var(--radius-xl)', padding: '28px', marginBottom: '28px', boxShadow: '0 10px 30px rgba(0,0,0,0.45)' }}>
        <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', color: 'var(--color-white)' }}>
          <Database size={20} color="var(--color-sandal)" />
          Local SQLite Persistence
        </h3>
        <p style={{ color: 'var(--color-sandal-muted)', fontSize: '0.9rem', marginBottom: '22px', lineHeight: 1.6 }}>
          All personal journey information is stored in your local SQLite database (<code style={{ color: 'var(--color-sandal)', fontFamily: 'var(--font-mono)' }}>backend/data/railmate.db</code>) via Node.js v24 native sqlite module. The backend runs on port 2264, frontend runs on port 2263.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            id="btn-settings-clear"
            type="button"
            className="btn btn-danger"
            onClick={() => setShowClearModal(true)}
          >
            <Trash2 size={16} />
            <span>Purge All Journeys</span>
          </button>
        </div>
      </div>

      {/* System Architecture Info */}
      <div style={{ background: 'var(--color-brown-card)', border: '1px solid var(--color-brown-border)', borderRadius: 'var(--radius-xl)', padding: '28px', boxShadow: '0 10px 30px rgba(0,0,0,0.45)' }}>
        <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'var(--color-white)' }}>
          <Cpu size={20} color="var(--color-blue-light)" />
          System Information
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          <div className="meta-box">
            <span className="meta-label">Frontend Web App</span>
            <span className="meta-value" style={{ color: 'var(--color-blue-light)' }}>Port 2263 (Strict)</span>
          </div>

          <div className="meta-box">
            <span className="meta-label">Backend REST API</span>
            <span className="meta-value" style={{ color: 'var(--color-green-light)' }}>Port 2264</span>
          </div>

          <div className="meta-box">
            <span className="meta-label">Color Palette</span>
            <span className="meta-value" style={{ fontSize: '0.88rem', color: 'var(--color-sandal)' }}>Red, Green, Blue, Sandal, Brown, White</span>
          </div>
        </div>
      </div>

      {/* Clear Database Modal */}
      <ConfirmModal
        isOpen={showClearModal}
        title="Reset Entire Database?"
        message="This will delete all journeys, packing items, and stations from your local database. You can reload sample journeys at any time."
        confirmLabel="Yes, Reset Everything"
        cancelLabel="Cancel"
        onConfirm={handleConfirmReset}
        onCancel={() => setShowClearModal(false)}
      />
    </div>
  );
};
