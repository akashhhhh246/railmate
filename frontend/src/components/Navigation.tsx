import React from 'react';
import { Train, LayoutDashboard, Compass, PlusCircle, History, Sparkles } from 'lucide-react';
import type { ViewMode, JourneyStats } from '../types';

interface NavigationProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  stats?: JourneyStats | null;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, onNavigate, stats }) => {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">
            <Train size={24} />
          </div>
          <div className="brand-info">
            <h1>RailMate</h1>
            <span>Train Companion</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            id="nav-btn-dashboard"
            className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => onNavigate('dashboard')}
          >
            <div className="nav-item-left">
              <LayoutDashboard size={19} />
              <span>Dashboard</span>
            </div>
            {stats && stats.in_progress > 0 && (
              <span className="nav-badge active-badge" title="Journeys in progress">
                {stats.in_progress} live
              </span>
            )}
          </button>

          <button
            id="nav-btn-my-journeys"
            className={`nav-item ${currentView === 'journeys' ? 'active' : ''}`}
            onClick={() => onNavigate('journeys')}
          >
            <div className="nav-item-left">
              <Compass size={19} />
              <span>My Journeys</span>
            </div>
            {stats && stats.total > 0 && (
              <span className="nav-badge">{stats.total}</span>
            )}
          </button>

          <button
            id="nav-btn-add-journey"
            className={`nav-item ${currentView === 'create-journey' ? 'active' : ''}`}
            onClick={() => onNavigate('create-journey')}
          >
            <div className="nav-item-left">
              <PlusCircle size={19} />
              <span>Add Journey</span>
            </div>
          </button>

          <button
            id="nav-btn-past-journeys"
            className={`nav-item ${currentView === 'past-journeys' ? 'active' : ''}`}
            onClick={() => onNavigate('past-journeys')}
          >
            <div className="nav-item-left">
              <History size={19} />
              <span>Past Journeys</span>
            </div>
            {stats && stats.completed > 0 && (
              <span className="nav-badge">{stats.completed}</span>
            )}
          </button>

          <button
            id="nav-btn-analytics"
            className={`nav-item ${currentView === 'analytics' ? 'active' : ''}`}
            onClick={() => onNavigate('analytics')}
          >
            <div className="nav-item-left">
              <Sparkles size={19} />
              <span>Deep Telemetry</span>
            </div>
          </button>
        </nav>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav">
        <button
          className={`mobile-nav-btn ${currentView === 'dashboard' ? 'active' : ''}`}
          onClick={() => onNavigate('dashboard')}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </button>

        <button
          className={`mobile-nav-btn ${currentView === 'journeys' ? 'active' : ''}`}
          onClick={() => onNavigate('journeys')}
        >
          <Compass size={20} />
          <span>Journeys</span>
        </button>

        <button
          className={`mobile-nav-btn ${currentView === 'create-journey' ? 'active' : ''}`}
          onClick={() => onNavigate('create-journey')}
        >
          <PlusCircle size={20} />
          <span>Add</span>
        </button>

        <button
          className={`mobile-nav-btn ${currentView === 'past-journeys' ? 'active' : ''}`}
          onClick={() => onNavigate('past-journeys')}
        >
          <History size={20} />
          <span>Past</span>
        </button>

        <button
          className={`mobile-nav-btn ${currentView === 'analytics' ? 'active' : ''}`}
          onClick={() => onNavigate('analytics')}
        >
          <Sparkles size={20} />
          <span>Telemetry</span>
        </button>
      </nav>
    </>
  );
};
