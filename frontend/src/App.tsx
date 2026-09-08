import { useState, useEffect, useCallback } from 'react';
import { Clock, Volume2 } from 'lucide-react';
import type { Journey, JourneyFormData, JourneyStats, ViewMode } from './types';
import {
  fetchJourneys, fetchNextJourney, fetchJourneyById,
  createJourney, updateJourney, deleteJourney, fetchStats, syncJourneys
} from './api';
import { Navigation } from './components/Navigation';
import { DashboardView } from './views/DashboardView';
import { JourneysListView } from './views/JourneysListView';
import { JourneyDetailsView } from './views/JourneyDetailsView';
import { JourneyForm } from './components/JourneyForm';
import { PastJourneysView } from './views/PastJourneysView';
import { AnalyticsView } from './views/AnalyticsView';
import { ConfirmModal } from './components/ConfirmModal';
import { playRailwayChime } from './utils/audio';

export function App() {
  const [currentView, setCurrentView] = useState<ViewMode>(() => {
    try {
      const saved = localStorage.getItem('railmate_active_view');
      if (saved && ['dashboard', 'journeys', 'past-journeys', 'analytics'].includes(saved)) {
        return saved as ViewMode;
      }
    } catch {}
    return 'dashboard';
  });

  const [journeys, setJourneys] = useState<Journey[]>(() => {
    try {
      const saved = localStorage.getItem('railmate_journeys_backup');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [nextJourney, setNextJourney] = useState<Journey | null>(null);
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null);
  const [stats, setStats] = useState<JourneyStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Edit State
  const [journeyToEdit, setJourneyToEdit] = useState<Journey | null>(null);

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number; name: string }>({
    isOpen: false,
    id: 0,
    name: ''
  });

  // Current Local Time Display in Topbar
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch all core app data
  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [allJourneys, next, statsData] = await Promise.all([
        fetchJourneys(),
        fetchNextJourney(),
        fetchStats()
      ]);

      let localJourneys: Journey[] = [];
      try {
        const savedRaw = localStorage.getItem('railmate_journeys_backup');
        if (savedRaw) localJourneys = JSON.parse(savedRaw);
      } catch {}

      // If backend was reset (e.g. Render free tier container restart) but browser has saved journeys:
      if (allJourneys.length === 0 && localJourneys.length > 0) {
        console.log('Detected reset backend database on free tier. Restoring from client backup...');
        await syncJourneys(localJourneys);
        const [restoredJourneys, restoredNext, restoredStats] = await Promise.all([
          fetchJourneys(),
          fetchNextJourney(),
          fetchStats()
        ]);
        setJourneys(restoredJourneys);
        setNextJourney(restoredNext);
        setStats(restoredStats);
        try {
          localStorage.setItem('railmate_journeys_backup', JSON.stringify(restoredJourneys));
        } catch {}
        return;
      }

      setJourneys(allJourneys);
      setNextJourney(next);
      setStats(statsData);

      try {
        if (allJourneys.length > 0) {
          localStorage.setItem('railmate_journeys_backup', JSON.stringify(allJourneys));
        }
      } catch {}

      if (selectedJourney) {
        try {
          const freshSelected = await fetchJourneyById(selectedJourney.id);
          setSelectedJourney(freshSelected);
        } catch {
          // Journey might have been deleted
        }
      }
    } catch (err: any) {
      console.error('Failed to load RailMate data from server:', err);
      // Fallback to local storage backup if server is cold-starting or offline
      try {
        const savedRaw = localStorage.getItem('railmate_journeys_backup');
        if (savedRaw) {
          const localJourneys = JSON.parse(savedRaw);
          if (localJourneys.length > 0) {
            setJourneys(localJourneys);
          }
        }
      } catch {}
      setError(err.message || 'Connecting to server...');
    }
  }, [selectedJourney?.id]);

  useEffect(() => {
    loadData();
  }, []);

  // View Navigation
  const handleNavigate = (view: ViewMode) => {
    setCurrentView(view);
    try {
      if (['dashboard', 'journeys', 'past-journeys', 'analytics'].includes(view)) {
        localStorage.setItem('railmate_active_view', view);
      }
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Refresh stats whenever landing on dashboard
    if (view === 'dashboard') {
      loadData();
    }
  };


  // Open Journey Details
  const handleOpenJourney = async (id: number) => {
    try {
      const journey = await fetchJourneyById(id);
      setSelectedJourney(journey);
      setCurrentView('journey-details');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Failed to open journey details:', err);
    }
  };

  // Start Edit Journey
  const handleStartEdit = async (id: number) => {
    try {
      const journey = await fetchJourneyById(id);
      setJourneyToEdit(journey);
      setCurrentView('edit-journey');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Failed to prepare journey for editing:', err);
    }
  };

  // Handle Create Journey Submit
  const handleCreateSubmit = async (data: JourneyFormData) => {
    const result = await createJourney(data);
    await loadData();
    if (result.journeyId) {
      await handleOpenJourney(result.journeyId);
    } else {
      setCurrentView('dashboard');
    }
  };

  // Handle Edit Journey Submit
  const handleEditSubmit = async (data: JourneyFormData) => {
    if (!journeyToEdit) return;
    await updateJourney(journeyToEdit.id, data);
    await loadData();
    await handleOpenJourney(journeyToEdit.id);
  };

  // Trigger Delete Modal
  const handleRequestDelete = (id: number, name: string) => {
    setDeleteModal({ isOpen: true, id, name });
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    try {
      await deleteJourney(deleteModal.id);
      setDeleteModal({ isOpen: false, id: 0, name: '' });
      try {
        const remaining = journeys.filter(j => j.id !== deleteModal.id);
        localStorage.setItem('railmate_journeys_backup', JSON.stringify(remaining));
      } catch {}
      await loadData();
      if (currentView === 'journey-details') {
        setCurrentView('journeys');
      }
    } catch (err: any) {
      console.error('Failed to delete journey:', err);
    }
  };

  return (
    <div className="app-container">
      {/* Navigation */}
      <Navigation
        currentView={currentView}
        onNavigate={handleNavigate}
        stats={stats}
      />

      {/* Main Content Area */}
      <main className="app-main">
        {/* Railway Station LED Marquee Announcement Ticker */}
        <div className="station-marquee-banner">
          <div className="marquee-led-dot"></div>
          <span style={{ fontWeight: 800, color: 'var(--color-sandal)' }}>RAILWAY DISPLAY:</span>
          {nextJourney ? (
            <span>
              {nextJourney.train_name} (#{nextJourney.train_number}) scheduled from {nextJourney.origin} to {nextJourney.destination} • Status: <strong style={{ color: nextJourney.status === 'in_progress' ? 'var(--color-green-light)' : 'var(--color-blue-light)' }}>{nextJourney.status.toUpperCase()}</strong> • Coach {nextJourney.coach}, Seat {nextJourney.seat} • Departure at {nextJourney.departure_time}
            </span>
          ) : (
            <span>
              Welcome aboard RailMate • Personal Train Journey Companion • Ready to log your next railway journey
            </span>
          )}
        </div>

        {/* Top Header Bar */}
        <header className="app-topbar">
          <div className="topbar-left">
            <h1 className="topbar-title">
              {currentView === 'dashboard' && 'Dashboard'}
              {currentView === 'journeys' && 'My Journeys'}
              {currentView === 'journey-details' && 'Journey Details'}
              {currentView === 'create-journey' && 'Add Journey'}
              {currentView === 'edit-journey' && 'Edit Journey'}
              {currentView === 'past-journeys' && 'Past Journeys'}
              {currentView === 'analytics' && 'Deep Telemetry & System Vectors'}
            </h1>
          </div>

          <div className="topbar-right">
            {/* Departure Chime Button */}
            <button
              id="btn-topbar-chime"
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={playRailwayChime}
              title="Play Railway Departure Chime"
              style={{ color: 'var(--color-sandal)', padding: '7px 12px' }}
            >
              <Volume2 size={15} />
              <span>Chime</span>
            </button>

            {/* Local Clock */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 14px', background: 'rgba(245, 231, 211, 0.05)', borderRadius: 'var(--radius-pill)', border: '1px solid var(--color-brown-border)', fontFamily: 'var(--font-mono)', fontSize: '0.86rem', color: 'var(--color-blue-light)' }}>
              <Clock size={15} />
              <span style={{ color: 'var(--color-white)', fontWeight: 600 }}>{currentTimeStr || '00:00:00'}</span>
            </div>


          </div>
        </header>

        {/* Dynamic View Body */}
        <div className="content-wrapper">
          {error && (
            <div style={{ marginBottom: '24px', padding: '16px 20px', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid #f43f5e', borderRadius: 'var(--radius-md)', color: '#fca5a5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>{error}</span>
              <button className="btn btn-secondary btn-sm" onClick={loadData}>Retry</button>
            </div>
          )}

          {currentView === 'dashboard' && (
            <DashboardView
              nextJourney={nextJourney}
              recentJourneys={journeys}
              stats={stats}
              onOpenJourney={handleOpenJourney}
              onAddJourney={() => handleNavigate('create-journey')}
              onViewAllJourneys={() => handleNavigate('journeys')}
            />
          )}

          {currentView === 'journeys' && (
            <JourneysListView
              journeys={journeys}
              onOpenJourney={handleOpenJourney}
              onEditJourney={handleStartEdit}
              onDeleteJourney={handleRequestDelete}
            />

          )}

          {currentView === 'journey-details' && selectedJourney && (
            <JourneyDetailsView
              journey={selectedJourney}
              onBack={() => handleNavigate('journeys')}
              onEdit={handleStartEdit}
              onDelete={handleRequestDelete}
              onReload={loadData}
            />
          )}

          {currentView === 'create-journey' && (
            <JourneyForm
              isEditing={false}
              onSubmit={handleCreateSubmit}
              onCancel={() => handleNavigate(journeys.length > 0 ? 'journeys' : 'dashboard')}
            />
          )}

          {currentView === 'edit-journey' && journeyToEdit && (
            <JourneyForm
              key={journeyToEdit.id}
              isEditing={true}
              initialData={{
                journey_type: journeyToEdit.journey_type,
                suburban_city: journeyToEdit.suburban_city,
                suburban_line: journeyToEdit.suburban_line,
                train_name: journeyToEdit.train_name,
                train_number: journeyToEdit.train_number,
                origin: journeyToEdit.origin,
                destination: journeyToEdit.destination,
                journey_date: journeyToEdit.journey_date,
                departure_time: journeyToEdit.departure_time,
                arrival_time: journeyToEdit.arrival_time,
                arrival_date_offset: journeyToEdit.arrival_date_offset || 0,
                coach: journeyToEdit.coach,
                seat: journeyToEdit.seat,
                travel_class: journeyToEdit.travel_class,
                pnr: journeyToEdit.pnr || '',
                platform: journeyToEdit.platform || '',
                notes: journeyToEdit.notes || '',
                is_waiting_list: Boolean(journeyToEdit.is_waiting_list) || (journeyToEdit.coach ? journeyToEdit.coach.toLowerCase().includes('waiting') : false),
                waiting_list_number: journeyToEdit.waiting_list_number || (journeyToEdit.coach?.toLowerCase().includes('waiting') ? journeyToEdit.seat : ''),
                stops: (journeyToEdit.stops || []).map(s => ({
                  station_name: s.station_name,
                  arrival_time: s.arrival_time,
                  departure_time: s.departure_time
                }))
              }}
              onSubmit={handleEditSubmit}
              onCancel={() => handleOpenJourney(journeyToEdit.id)}
            />
          )}

          {currentView === 'past-journeys' && (
            <PastJourneysView
              journeys={journeys}
              onOpenJourney={handleOpenJourney}
              onEditJourney={handleStartEdit}
              onDeleteJourney={handleRequestDelete}
            />
          )}

          {currentView === 'analytics' && (
            <AnalyticsView
              journeys={journeys}
              stats={stats}
            />
          )}
        </div>
      </main>

      {/* Global Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Journey?"
        message={`Are you sure you want to delete "${deleteModal.name}"? This will remove the journey, all intermediate stops, and its packing checklist permanently.`}
        confirmLabel="Yes, Delete Journey"
        cancelLabel="Keep Journey"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, id: 0, name: '' })}
      />
    </div>
  );
}

export default App;
