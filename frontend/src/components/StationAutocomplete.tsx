import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, MapPin, Search, X, PlusCircle, Loader2 } from 'lucide-react';
import { searchStations } from '../api';
import type { StationRecord } from '../api';

interface StationAutocompleteProps {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  typeVariant?: 'origin' | 'destination' | 'intermediate';
  predefinedOptions?: string[];
  routeLabel?: string;
}

function formatStationName(s: StationRecord): string {
  // Convert all-caps names from raw railway data into clean Title Case for display
  const titleCaseName = s.name
    .toLowerCase()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  return `${titleCaseName} (${s.code})`;
}

export const StationAutocomplete: React.FC<StationAutocompleteProps> = ({
  id,
  value,
  onChange,
  placeholder = 'Search station, suburban stop, or code...',
  error,
  typeVariant = 'origin',
  predefinedOptions,
  routeLabel
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const [stations, setStations] = useState<StationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const debounceTimerRef = useRef<any>(null);

  // Compute filtered predefined options if provided
  const hasPredefined = Array.isArray(predefinedOptions) && predefinedOptions.length > 0;
  const filteredPredefined = hasPredefined
    ? (searchTerm.trim()
        ? predefinedOptions.filter(opt => opt.toLowerCase().includes(searchTerm.toLowerCase().trim()))
        : predefinedOptions)
    : [];

  // Sync internal search term when outer value changes
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch stations dynamically from backend SQLite database (8,989+ stations)
  const fetchStationResults = useCallback(async (query: string) => {
    try {
      setIsLoading(true);
      const results = await searchStations(query, 50);
      setStations(results);
      setHighlightedIndex(-1);
    } catch (err) {
      console.error('Station search error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search on user input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    onChange(val);
    setIsOpen(true);

    if (!hasPredefined) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        fetchStationResults(val);
      }, 150);
    }
  };

  // When dropdown opens and list is empty, load initial stations
  const handleFocus = () => {
    setIsOpen(true);
    if (!hasPredefined && stations.length === 0) {
      fetchStationResults(searchTerm);
    }
  };

  const handleSelectStation = (station: StationRecord) => {
    const formatted = formatStationName(station);
    setSearchTerm(formatted);
    onChange(formatted);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleSelectPredefined = (stationName: string) => {
    setSearchTerm(stationName);
    onChange(stationName);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleUseCustomName = (customName: string) => {
    const trimmed = customName.trim();
    if (!trimmed) return;
    setSearchTerm(trimmed);
    onChange(trimmed);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const currentListLength = hasPredefined ? filteredPredefined.length : stations.length;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true);
      if (!hasPredefined && stations.length === 0) fetchStationResults(searchTerm);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < currentListLength - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : currentListLength - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isOpen && highlightedIndex >= 0) {
        if (hasPredefined && filteredPredefined[highlightedIndex]) {
          handleSelectPredefined(filteredPredefined[highlightedIndex]);
          return;
        } else if (stations[highlightedIndex]) {
          handleSelectStation(stations[highlightedIndex]);
          return;
        }
      }
      if (searchTerm.trim()) {
        handleUseCustomName(searchTerm);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const clearInput = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchTerm('');
    onChange('');
    setIsOpen(true);
    if (!hasPredefined) {
      fetchStationResults('');
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightedIndex] as HTMLElement;
      if (item) {
        item.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  const markerColor =
    typeVariant === 'origin'
      ? 'var(--color-green-light)'
      : typeVariant === 'destination'
      ? 'var(--color-red-light)'
      : 'var(--color-blue-light)';

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {/* Leading Pin Icon */}
        <div style={{ position: 'absolute', left: '14px', color: markerColor, pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
          <MapPin size={17} />
        </div>

        {/* Input */}
        <input
          id={id}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className="form-input"
          style={{
            paddingLeft: '42px',
            paddingRight: '68px',
            borderColor: error ? 'var(--color-red)' : isOpen ? 'var(--color-blue)' : undefined
          }}
        />

        {/* Trailing Controls (Loader / Clear + Dropdown Chevron) */}
        <div style={{ position: 'absolute', right: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" style={{ color: 'var(--color-blue-light)', marginRight: '2px' }} />
          ) : searchTerm ? (
            <button
              type="button"
              onClick={clearInput}
              title="Clear selection"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-sandal-muted)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '4px'
              }}
            >
              <X size={15} />
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => {
              setIsOpen(prev => {
                const next = !prev;
                if (next && stations.length === 0) fetchStationResults(searchTerm);
                return next;
              });
            }}
            title="Browse all 8,900+ Indian stations and suburban stops"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-sandal)',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '4px'
            }}
          >
            <ChevronDown
              size={17}
              style={{
                transform: isOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s ease'
              }}
            />
          </button>
        </div>
      </div>

      {/* Floating Dropdown List (Searches across SQLite database) */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            zIndex: 100,
            background: 'var(--color-brown-surface)',
            border: '1px solid var(--color-brown-border-light)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 18px 48px rgba(0, 0, 0, 0.85)',
            maxHeight: '340px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header Info */}
          <div
            style={{
              padding: '9px 16px',
              borderBottom: '1px solid var(--color-brown-border)',
              background: 'rgba(0, 0, 0, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.74rem',
              color: 'var(--color-sandal-muted)',
              fontFamily: 'var(--font-mono)'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Search size={12} color="var(--color-blue-light)" />
              {hasPredefined
                ? (routeLabel ? `${routeLabel}` : 'Defined Route Stations')
                : (searchTerm ? `Results for "${searchTerm}"` : 'All Indian Railway Stations & Suburban Halts')}
            </span>
            <span style={{ color: 'var(--color-sandal)', fontWeight: 700 }}>
              {hasPredefined ? `${filteredPredefined.length} Line Stops` : '8,989 Stations in DB'}
            </span>
          </div>

          {/* List of stations */}
          <ul
            ref={listRef}
            style={{
              listStyle: 'none',
              margin: 0,
              padding: '4px 0',
              overflowY: 'auto',
              flex: 1
            }}
          >
            {hasPredefined ? (
              filteredPredefined.length > 0 ? (
                filteredPredefined.map((stationName, index) => {
                  const isSelected = highlightedIndex === index;
                  return (
                    <li
                      key={`${stationName}_${index}`}
                      onClick={() => handleSelectPredefined(stationName)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      style={{
                        padding: '10px 16px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: isSelected ? 'var(--color-blue-bg)' : 'transparent',
                        borderLeft: isSelected ? '3px solid var(--color-blue)' : '3px solid transparent',
                        transition: 'background 0.12s ease'
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1, paddingRight: '12px' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.94rem', color: isSelected ? 'var(--color-white)' : 'var(--color-sandal-light)' }}>
                          {stationName}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--color-sandal-muted)', marginTop: '2px' }}>
                          Suburban Corridor Station
                        </div>
                      </div>

                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-sm)',
                          background: isSelected ? 'var(--color-blue)' : 'rgba(245, 231, 211, 0.12)',
                          color: isSelected ? 'var(--color-white)' : 'var(--color-sandal)',
                          border: '1px solid rgba(245, 231, 211, 0.2)',
                          flexShrink: 0
                        }}
                      >
                        Stop #{index + 1}
                      </span>
                    </li>
                  );
                })
              ) : (
                <li style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--color-sandal-muted)' }}>
                  <Search size={20} style={{ margin: '0 auto 6px', color: 'var(--color-sandal-muted)', display: 'block' }} />
                  <div style={{ fontSize: '0.88rem', color: 'var(--color-white)', fontWeight: 600 }}>
                    No station on this route matched "{searchTerm}"
                  </div>
                </li>
              )
            ) : stations.length > 0 ? (
              stations.map((station, index) => {
                const isSelected = highlightedIndex === index;
                const isJunction =
                  station.name.toLowerCase().includes('jn') ||
                  station.name.toLowerCase().includes('junction');

                return (
                  <li
                    key={`${station.code}_${index}`}
                    onClick={() => handleSelectStation(station)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    style={{
                      padding: '10px 16px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: isSelected ? 'var(--color-blue-bg)' : 'transparent',
                      borderLeft: isSelected ? '3px solid var(--color-blue)' : '3px solid transparent',
                      transition: 'background 0.12s ease'
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1, paddingRight: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.94rem', color: isSelected ? 'var(--color-white)' : 'var(--color-sandal-light)' }}>
                          {station.name}
                        </span>
                        {isJunction && (
                          <span
                            style={{
                              fontSize: '0.66rem',
                              fontWeight: 800,
                              background: 'rgba(245, 231, 211, 0.12)',
                              color: 'var(--color-sandal)',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              fontFamily: 'var(--font-mono)'
                            }}
                          >
                            JN
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--color-sandal-muted)', marginTop: '2px' }}>
                        {[station.zone, station.state || station.address].filter(Boolean).join(' • ') || 'Indian Railways'}
                      </div>
                    </div>

                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-sm)',
                        background: isSelected ? 'var(--color-blue)' : 'rgba(37, 99, 235, 0.15)',
                        color: isSelected ? 'var(--color-white)' : 'var(--color-blue-light)',
                        border: '1px solid rgba(37, 99, 235, 0.35)',
                        flexShrink: 0
                      }}
                    >
                      {station.code}
                    </span>
                  </li>
                );
              })
            ) : !isLoading ? (
              <li style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--color-sandal-muted)' }}>
                <Search size={20} style={{ margin: '0 auto 6px', color: 'var(--color-sandal-muted)', display: 'block' }} />
                <div style={{ fontSize: '0.88rem', color: 'var(--color-white)', fontWeight: 600 }}>
                  No station code or name matched "{searchTerm}"
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-sandal-muted)', marginTop: '2px' }}>
                  Press Enter or click below to save as custom station.
                </div>
              </li>
            ) : null}

            {/* Custom Entry Option: Always allow using custom entered station */}
            {searchTerm.trim() && (
              <li
                onClick={() => handleUseCustomName(searchTerm)}
                style={{
                  padding: '11px 16px',
                  borderTop: '1px dashed var(--color-brown-border)',
                  background: 'rgba(245, 231, 211, 0.04)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  color: 'var(--color-sandal)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem' }}>
                  <PlusCircle size={16} color="var(--color-blue-light)" />
                  <span>
                    Use <strong style={{ color: 'var(--color-white)' }}>"{searchTerm}"</strong> as custom station
                  </span>
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-sandal-muted)', fontFamily: 'var(--font-mono)' }}>
                  Press Enter ↵
                </span>
              </li>
            )}
          </ul>
        </div>
      )}

      {error && (
        <span style={{ color: 'var(--color-red-light)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
          {error}
        </span>
      )}
    </div>
  );
};
