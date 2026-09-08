import React, { useState, useMemo } from 'react';
import {
  Sparkles, Clock, Award,
  ArrowRightLeft, CheckCircle2, Calendar,
  GitCommit, PieChart, Repeat
} from 'lucide-react';
import type { Journey, JourneyStats } from '../types';

interface AnalyticsViewProps {
  journeys: Journey[];
  stats?: JourneyStats | null;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ journeys }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'cadence' | 'corridors' | 'badges'>('all');

  // Completely dynamic telemetry derived purely from actual journey records
  const telemetry = useMemo(() => {
    const totalJourneys = journeys.length;
    if (totalJourneys === 0) {
      return null;
    }

    // 1. Station Stops Traversal
    let totalStopsTraversed = 0;
    journeys.forEach(j => {
      if (j.stops && j.stops.length > 0) {
        totalStopsTraversed += j.stops.length;
      } else if (j.totalStops) {
        totalStopsTraversed += j.totalStops;
      }
    });
    const avgStopsPerTrip = (totalStopsTraversed / totalJourneys).toFixed(1);

    // 2. Temporal Cadence & Abstinence Intervals (Gaps between consecutive journeys)
    const sortedDates = journeys
      .map(j => j.journey_date)
      .filter(Boolean)
      .sort();

    const gaps: number[] = [];
    for (let i = 1; i < sortedDates.length; i++) {
      const prevTime = new Date(sortedDates[i - 1] + 'T00:00:00').getTime();
      const currTime = new Date(sortedDates[i] + 'T00:00:00').getTime();
      const diffDays = Math.round((currTime - prevTime) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0) gaps.push(diffDays);
    }

    const minGapDays = gaps.length > 0 ? Math.min(...gaps) : 0;
    const maxGapDays = gaps.length > 0 ? Math.max(...gaps) : 0;
    const avgGapDays = gaps.length > 0 ? (gaps.reduce((a, b) => a + b, 0) / gaps.length).toFixed(1) : '0';

    // 3. Day of Week Distribution
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];
    journeys.forEach(j => {
      if (j.journey_date) {
        const d = new Date(j.journey_date + 'T00:00:00');
        dayCounts[d.getDay()]++;
      }
    });
    const peakDayIndex = dayCounts.indexOf(Math.max(...dayCounts));
    const peakDayName = dayNames[peakDayIndex];
    const peakDayPct = Math.round((dayCounts[peakDayIndex] / totalJourneys) * 100);

    const weekdayCount = dayCounts[1] + dayCounts[2] + dayCounts[3] + dayCounts[4] + dayCounts[5];
    const weekdayPct = Math.round((weekdayCount / totalJourneys) * 100);

    // 4. Bidirectional Corridor Symmetry & Pendulum Loop Index
    const corridorMap = new Map<string, { stationA: string; stationB: string; aToB: number; bToA: number }>();

    journeys.forEach(j => {
      const o = (j.origin || '').trim();
      const d = (j.destination || '').trim();
      if (!o || !d) return;

      const isOrder = o.localeCompare(d) <= 0;
      const key = isOrder ? `${o} ⇄ ${d}` : `${d} ⇄ ${o}`;

      if (!corridorMap.has(key)) {
        corridorMap.set(key, {
          stationA: isOrder ? o : d,
          stationB: isOrder ? d : o,
          aToB: 0,
          bToA: 0
        });
      }

      const item = corridorMap.get(key)!;
      if (o === item.stationA) {
        item.aToB++;
      } else {
        item.bToA++;
      }
    });

    const corridors = Array.from(corridorMap.values()).map(c => {
      const closedPairs = Math.min(c.aToB, c.bToA);
      const totalCorridorTrips = c.aToB + c.bToA;
      const symmetryPct = totalCorridorTrips > 0 ? Math.round(((closedPairs * 2) / totalCorridorTrips) * 100) : 0;
      return {
        ...c,
        totalTrips: totalCorridorTrips,
        closedPairs,
        symmetryPct,
        netImbalance: Math.abs(c.aToB - c.bToA)
      };
    }).sort((a, b) => b.totalTrips - a.totalTrips);

    const totalClosedPairs = corridors.reduce((acc, curr) => acc + curr.closedPairs, 0);
    const overallSymmetryPct = Math.round(((totalClosedPairs * 2) / totalJourneys) * 100);

    // 5. Station Monogamy & Entropy
    const stationVisits: Record<string, number> = {};
    journeys.forEach(j => {
      if (j.origin) stationVisits[j.origin] = (stationVisits[j.origin] || 0) + 1;
      if (j.destination) stationVisits[j.destination] = (stationVisits[j.destination] || 0) + 1;
    });

    const sortedStations = Object.entries(stationVisits).sort((a, b) => b[1] - a[1]);
    const totalStationTouchpoints = Object.values(stationVisits).reduce((a, b) => a + b, 0);
    const topStationName = sortedStations[0] ? sortedStations[0][0] : 'None';
    const topStationVisits = sortedStations[0] ? sortedStations[0][1] : 0;
    const topStationSharePct = totalStationTouchpoints > 0 ? Math.round((topStationVisits / totalStationTouchpoints) * 100) : 0;

    // Shannon's Spatial Entropy: H = -sum(p * log2(p))
    let spatialEntropy = 0;
    if (totalStationTouchpoints > 0) {
      Object.values(stationVisits).forEach(cnt => {
        const p = cnt / totalStationTouchpoints;
        if (p > 0) spatialEntropy -= p * Math.log2(p);
      });
    }
    const maxPossibleEntropy = Math.log2(Math.max(1, sortedStations.length));
    const entropyRatioPct = maxPossibleEntropy > 0 ? Math.round((spatialEntropy / maxPossibleEntropy) * 100) : 0;

    // 6. Network Distribution: Suburban vs Intercity & PNR Telemetry
    const suburbanCount = journeys.filter(j => j.journey_type === 'suburban').length;
    const intercityCount = journeys.filter(j => j.journey_type !== 'suburban').length;
    const pnrLoggedCount = journeys.filter(j => j.pnr && j.pnr.trim().length > 0).length;

    const suburbanPct = Math.round((suburbanCount / totalJourneys) * 100);
    const intercityPct = Math.round((intercityCount / totalJourneys) * 100);
    const pnrPct = Math.round((pnrLoggedCount / totalJourneys) * 100);

    // 7. Scheduled Timed Duration
    let totalScheduledMins = 0;
    let scheduledTripsCount = 0;
    journeys.forEach(j => {
      if (j.departure_time && j.arrival_time) {
        const [dh, dm] = j.departure_time.split(':').map(Number);
        const [ah, am] = j.arrival_time.split(':').map(Number);
        if (!isNaN(dh) && !isNaN(dm) && !isNaN(ah) && !isNaN(am)) {
          const startMins = dh * 60 + dm;
          const endMins = (ah + (j.arrival_date_offset || (ah < dh ? 24 : 0))) * 60 + am;
          const diff = endMins - startMins;
          if (diff > 0) {
            totalScheduledMins += diff;
            scheduledTripsCount++;
          }
        }
      }
    });

    const scheduledHours = Math.floor(totalScheduledMins / 60);
    const scheduledMinsRemainder = totalScheduledMins % 60;

    return {
      totalJourneys,
      totalStopsTraversed,
      avgStopsPerTrip,
      minGapDays,
      maxGapDays,
      avgGapDays,
      dayCounts,
      dayNames,
      peakDayName,
      peakDayPct,
      weekdayPct,
      corridors,
      totalClosedPairs,
      overallSymmetryPct,
      topStationName,
      topStationVisits,
      topStationSharePct,
      spatialEntropy: spatialEntropy.toFixed(2),
      maxPossibleEntropy: maxPossibleEntropy.toFixed(2),
      entropyRatioPct,
      suburbanCount,
      intercityCount,
      suburbanPct,
      intercityPct,
      pnrLoggedCount,
      pnrPct,
      scheduledHours,
      scheduledMinsRemainder,
      scheduledTripsCount,
      uniqueStationsCount: sortedStations.length
    };
  }, [journeys]);

  if (!telemetry) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', background: 'var(--color-brown-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-brown-border)' }}>
        <Sparkles size={40} color="var(--color-sandal)" style={{ margin: '0 auto 16px auto', opacity: 0.8 }} />
        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-white)', margin: 0 }}>
          No Journeys Logged Yet
        </h3>
        <p style={{ color: 'var(--color-sandal-muted)', fontSize: '0.94rem', marginTop: '8px' }}>
          Add your journeys to unlock mathematically derived, hyper-detailed rail telemetry.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span
            style={{
              fontSize: '0.74rem',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--color-sandal)',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Sparkles size={14} color="var(--color-sandal)" />
            DYNAMIC PASSENGER TELEMETRY & SYSTEM VECTORS
          </span>
        </div>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--color-white)', margin: 0 }}>
          Deep Rail Telemetry
        </h2>

        {/* Tab Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '22px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'Complete Telemetry' },
            { id: 'cadence', label: 'Temporal Cadence & Abstinence' },
            { id: 'corridors', label: 'Corridor Symmetry & Entropy' },
            { id: 'badges', label: 'Verified Milestone Badges' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '8px 18px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: activeTab === tab.id ? '1px solid var(--color-blue)' : '1px solid var(--color-brown-border)',
                background: activeTab === tab.id ? 'rgba(37, 99, 235, 0.25)' : 'rgba(0, 0, 0, 0.25)',
                color: activeTab === tab.id ? 'var(--color-white)' : 'var(--color-sandal-muted)'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Primary 4-Card Derived Telemetry Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px', marginBottom: '32px' }}>
        {/* Metric 1: Intermediate Halts Traversed */}
        <div
          style={{
            background: 'var(--color-brown-card)',
            border: '1px solid rgba(37, 99, 235, 0.45)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)'
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '3px', background: 'var(--color-blue)' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-blue-light)', fontWeight: 800 }}>
              Intermediate Halts Traversed
            </span>
            <GitCommit size={18} color="var(--color-blue-light)" />
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.3rem', fontWeight: 800, color: 'var(--color-white)', lineHeight: 1 }}>
            {telemetry.totalStopsTraversed} <span style={{ fontSize: '1rem', color: 'var(--color-blue-light)' }}>halts</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-sandal-muted)', marginTop: '8px', lineHeight: 1.4 }}>
            Aggregated across all scheduled station stops ({telemetry.avgStopsPerTrip} stops / journey).
          </div>
        </div>

        {/* Metric 2: Mean Station Return Cadence */}
        <div
          style={{
            background: 'var(--color-brown-card)',
            border: '1px solid rgba(22, 163, 74, 0.45)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)'
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '3px', background: 'var(--color-green)' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-green-light)', fontWeight: 800 }}>
              Mean Station Return Cadence
            </span>
            <Clock size={18} color="var(--color-green-light)" />
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.3rem', fontWeight: 800, color: 'var(--color-green-light)', lineHeight: 1 }}>
            {telemetry.avgGapDays} <span style={{ fontSize: '1rem', color: 'var(--color-green-light)' }}>days</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-sandal-muted)', marginTop: '8px', lineHeight: 1.4 }}>
            Average interval between consecutive departures. Peak gap: {telemetry.maxGapDays} days.
          </div>
        </div>

        {/* Metric 3: Closed-Loop Pendulum Index */}
        <div
          style={{
            background: 'var(--color-brown-card)',
            border: '1px solid rgba(245, 158, 11, 0.45)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)'
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '3px', background: '#f59e0b' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#fcd34d', fontWeight: 800 }}>
              Closed-Loop Pendulum Index
            </span>
            <Repeat size={18} color="#f59e0b" />
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.3rem', fontWeight: 800, color: '#fcd34d', lineHeight: 1 }}>
            {telemetry.overallSymmetryPct}%
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-sandal-muted)', marginTop: '8px', lineHeight: 1.4 }}>
            {telemetry.totalClosedPairs * 2} of {telemetry.totalJourneys} trips matched a bidirectional return path.
          </div>
        </div>

        {/* Metric 4: Terminal Monogamy */}
        <div
          style={{
            background: 'var(--color-brown-card)',
            border: '1px solid rgba(245, 231, 211, 0.35)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)'
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '3px', background: 'var(--color-sandal)' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-sandal)', fontWeight: 800 }}>
              Primary Terminal Anchor
            </span>
            <PieChart size={18} color="var(--color-sandal)" />
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.3rem', fontWeight: 800, color: 'var(--color-sandal-light)', lineHeight: 1 }}>
            {telemetry.topStationSharePct}%
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-sandal-muted)', marginTop: '8px', lineHeight: 1.4 }}>
            Share of all touchpoints anchored to {telemetry.topStationName}.
          </div>
        </div>
      </div>

      {/* Module 1: Temporal Cadence & Weekly Oscillations */}
      {(activeTab === 'all' || activeTab === 'cadence') && (
        <div
          style={{
            background: 'var(--color-brown-card)',
            border: '1px solid var(--color-brown-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '28px',
            marginBottom: '32px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.45)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', borderBottom: '1px solid var(--color-brown-border)', paddingBottom: '16px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(22, 163, 74, 0.15)', border: '1px solid rgba(22, 163, 74, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-green-light)' }}>
              <Calendar size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-white)', margin: 0 }}>
                Chrono-Biological Transit Distribution
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-sandal-muted)' }}>
                Mathematical breakdown of your movements across the 7-day cycle
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '22px' }}>
            {/* Day of Week Visual Bars */}
            <div style={{ background: 'rgba(0, 0, 0, 0.28)', borderRadius: 'var(--radius-lg)', padding: '22px', border: '1px solid var(--color-brown-border)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-sandal-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800, marginBottom: '14px' }}>
                Weekly Transit Density
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {telemetry.dayNames.map((name, idx) => {
                  const cnt = telemetry.dayCounts[idx];
                  const pct = telemetry.totalJourneys > 0 ? Math.round((cnt / telemetry.totalJourneys) * 100) : 0;
                  const isPeak = idx === telemetry.dayNames.indexOf(telemetry.peakDayName);

                  return (
                    <div key={name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                        <span style={{ color: isPeak ? 'var(--color-white)' : 'var(--color-sandal-light)', fontWeight: isPeak ? 800 : 600 }}>
                          {name} {isPeak && '🔥'}
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', color: isPeak ? '#fcd34d' : 'var(--color-sandal-muted)', fontWeight: 700 }}>
                          {cnt} {cnt === 1 ? 'trip' : 'trips'} ({pct}%)
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: 'rgba(0, 0, 0, 0.4)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${pct}%`,
                            height: '100%',
                            background: isPeak ? '#f59e0b' : 'var(--color-blue)',
                            borderRadius: '3px',
                            transition: 'width 0.3s ease'
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* In-Transit Duration & PNR Telemetry */}
            <div style={{ background: 'rgba(0, 0, 0, 0.28)', borderRadius: 'var(--radius-lg)', padding: '22px', border: '1px solid var(--color-brown-border)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-sandal-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800, marginBottom: '14px' }}>
                Service Telemetry & Turnaround
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(0, 0, 0, 0.3)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.84rem', color: 'var(--color-sandal-light)' }}>Minimum Turnaround (Fastest Return)</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--color-green-light)' }}>{telemetry.minGapDays} days</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(0, 0, 0, 0.3)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.84rem', color: 'var(--color-sandal-light)' }}>Maximum Platform Hiatus (Longest Gap)</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--color-sandal)' }}>{telemetry.maxGapDays} days</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(0, 0, 0, 0.3)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.84rem', color: 'var(--color-sandal-light)' }}>Scheduled Express Rolling Hours</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--color-white)' }}>
                    {telemetry.scheduledHours}h {telemetry.scheduledMinsRemainder}m
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(0, 0, 0, 0.3)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.84rem', color: 'var(--color-sandal-light)' }}>Verified 10-Digit PNR Coverage</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--color-blue-light)' }}>
                    {telemetry.pnrLoggedCount} logged ({telemetry.pnrPct}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Module 2: Corridor Symmetry & Spatial Entropy */}
      {(activeTab === 'all' || activeTab === 'corridors') && (
        <div
          style={{
            background: 'var(--color-brown-card)',
            border: '1px solid var(--color-brown-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '28px',
            marginBottom: '32px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.45)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', borderBottom: '1px solid var(--color-brown-border)', paddingBottom: '16px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(37, 99, 235, 0.15)', border: '1px solid rgba(37, 99, 235, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-blue-light)' }}>
              <ArrowRightLeft size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-white)', margin: 0 }}>
                Corridor Symmetry & Shannon's Spatial Entropy
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-sandal-muted)' }}>
                Mathematical equilibrium of departures vs returns and geographical concentration
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '22px' }}>
            {/* Corridor List */}
            <div style={{ background: 'rgba(0, 0, 0, 0.28)', borderRadius: 'var(--radius-lg)', padding: '22px', border: '1px solid var(--color-brown-border)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-sandal-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800, marginBottom: '14px' }}>
                Bidirectional Corridor Symmetry
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {telemetry.corridors.map((c, i) => (
                  <div key={i} style={{ padding: '12px 14px', background: 'rgba(0, 0, 0, 0.3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-brown-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-white)' }}>
                        {c.stationA} ⇄ {c.stationB}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 800, color: c.symmetryPct === 100 ? 'var(--color-green-light)' : 'var(--color-sandal)' }}>
                        {c.symmetryPct}% balanced
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--color-sandal-muted)' }}>
                      <span>{c.aToB} departures • {c.bToA} returns</span>
                      <span>Net offset: {c.netImbalance === 0 ? 'Perfect Zero' : `+${c.netImbalance}`}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Spatial Entropy Deep-Dive */}
            <div style={{ background: 'rgba(0, 0, 0, 0.28)', borderRadius: 'var(--radius-lg)', padding: '22px', border: '1px solid var(--color-brown-border)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-sandal-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800, marginBottom: '14px' }}>
                Spatial Entropy Rating
              </div>

              <div style={{ background: 'rgba(0, 0, 0, 0.35)', padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245, 231, 211, 0.1)', marginBottom: '14px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-sandal-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>
                  Shannon's Terminal Entropy (H)
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 800, color: 'var(--color-white)', marginTop: '4px' }}>
                  {telemetry.spatialEntropy} <span style={{ fontSize: '0.9rem', color: 'var(--color-sandal-muted)' }}>/ {telemetry.maxPossibleEntropy} bits</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-sandal-muted)', marginTop: '4px' }}>
                  Dispersion capacity utilized: {telemetry.entropyRatioPct}%
                </div>
              </div>

              <p style={{ fontSize: '0.84rem', color: 'var(--color-sandal-muted)', lineHeight: 1.5, margin: 0 }}>
                Calculated strictly via <code style={{ color: 'var(--color-sandal)', fontFamily: 'var(--font-mono)' }}>H = -Σ(p·log₂(p))</code> across all terminal visits. A lower score represents high route predictability, while higher values signify chaotic rail wandering.
              </p>

              <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(37, 99, 235, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(37, 99, 235, 0.25)', fontSize: '0.8rem', color: 'var(--color-blue-light)' }}>
                📍 <strong>Observation:</strong> {telemetry.topStationSharePct}% of all station check-ins cluster at {telemetry.topStationName}, establishing it as your definitive rail gravitational core.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Module 3: Dynamically Verified Rail Milestone Badges */}
      {(activeTab === 'all' || activeTab === 'badges') && (
        <div
          style={{
            background: 'var(--color-brown-card)',
            border: '1px solid var(--color-brown-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '28px',
            marginBottom: '32px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.45)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', borderBottom: '1px solid var(--color-brown-border)', paddingBottom: '16px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fcd34d' }}>
              <Award size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-white)', margin: 0 }}>
                Mathematically Verified Achievement Badges
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-sandal-muted)' }}>
                Unlocked dynamically from your database records — no placeholders
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {[
              {
                title: 'Pendulum Loop Master',
                desc: `Completed ${telemetry.totalClosedPairs} bidirectional roundtrips with symmetric return paths.`,
                unlocked: telemetry.totalClosedPairs >= 3,
                icon: '🔄',
                accent: 'rgba(245, 158, 11, 0.2)',
                border: 'rgba(245, 158, 11, 0.4)'
              },
              {
                title: 'Century Halt Collector',
                desc: `Traversed past ${telemetry.totalStopsTraversed} intermediate scheduled station stops.`,
                unlocked: telemetry.totalStopsTraversed >= 50,
                icon: '🛑',
                accent: 'rgba(37, 99, 235, 0.25)',
                border: 'rgba(37, 99, 235, 0.4)'
              },
              {
                title: 'Suburban Commuter Veteran',
                desc: `Logged ${telemetry.suburbanCount} city suburban EMU rail commutes.`,
                unlocked: telemetry.suburbanCount >= 5,
                icon: '⚡',
                accent: 'rgba(22, 163, 74, 0.2)',
                border: 'rgba(22, 163, 74, 0.4)'
              },
              {
                title: 'Weekday Rail Specialist',
                desc: `${telemetry.weekdayPct}% of recorded trips occurred strictly on Monday through Friday.`,
                unlocked: telemetry.weekdayPct >= 60,
                icon: '📅',
                accent: 'rgba(245, 231, 211, 0.15)',
                border: 'rgba(245, 231, 211, 0.3)'
              },
              {
                title: 'Verified PNR Bearer',
                desc: `Logged ${telemetry.pnrLoggedCount} journeys with 10-digit Indian Railways reservation PNRs.`,
                unlocked: telemetry.pnrLoggedCount >= 1,
                icon: '🎫',
                accent: 'rgba(168, 85, 247, 0.2)',
                border: 'rgba(168, 85, 247, 0.4)'
              },
              {
                title: 'Multi-Terminal Explorer',
                desc: `Logged check-ins across ${telemetry.uniqueStationsCount} unique railway stations.`,
                unlocked: telemetry.uniqueStationsCount >= 5,
                icon: '🗺️',
                accent: 'rgba(239, 68, 68, 0.2)',
                border: 'rgba(239, 68, 68, 0.4)'
              }
            ].map((badge, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(0, 0, 0, 0.28)',
                  border: `1px solid ${badge.unlocked ? badge.border : 'var(--color-brown-border)'}`,
                  borderRadius: 'var(--radius-lg)',
                  padding: '18px 20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  opacity: badge.unlocked ? 1 : 0.5,
                  boxShadow: badge.unlocked ? '0 4px 14px rgba(0, 0, 0, 0.3)' : 'none'
                }}
              >
                <div style={{ fontSize: '1.8rem', lineHeight: 1, padding: '6px', background: badge.unlocked ? badge.accent : 'rgba(0, 0, 0, 0.2)', borderRadius: '10px' }}>
                  {badge.icon}
                </div>
                <div>
                  <div style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--color-white)' }}>
                    {badge.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-sandal-muted)', marginTop: '4px', lineHeight: 1.4 }}>
                    {badge.desc}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', fontSize: '0.72rem', color: badge.unlocked ? 'var(--color-green-light)' : 'var(--color-sandal-muted)', fontWeight: 800 }}>
                    {badge.unlocked ? (
                      <>
                        <CheckCircle2 size={12} />
                        <span>VERIFIED UNLOCKED</span>
                      </>
                    ) : (
                      <span>LOCKED (CRITERIA NOT MET)</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
