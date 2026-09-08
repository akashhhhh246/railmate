import type { Journey, JourneyFormData, JourneyStats } from './types';

const API_BASE = '/api';

export async function fetchJourneys(params?: { search?: string; status?: string; sort?: string }): Promise<Journey[]> {
  const query = new URLSearchParams();
  if (params?.search) query.append('search', params.search);
  if (params?.status) query.append('status', params.status);
  if (params?.sort) query.append('sort', params.sort);

  const res = await fetch(`${API_BASE}/journeys?${query.toString()}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to fetch journeys');
  return json.data;
}

export async function fetchNextJourney(): Promise<Journey | null> {
  const res = await fetch(`${API_BASE}/journeys/next`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to fetch next journey');
  return json.data;
}

export async function fetchJourneyById(id: number): Promise<Journey> {
  const res = await fetch(`${API_BASE}/journeys/${id}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to fetch journey');
  return json.data;
}

export async function createJourney(data: JourneyFormData): Promise<{ success: boolean; journeyId: number }> {
  const res = await fetch(`${API_BASE}/journeys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to create journey');
  return json;
}

export async function updateJourney(id: number, data: JourneyFormData): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/journeys/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to update journey');
  return json;
}

export interface StationRecord {
  code: string;
  name: string;
  state?: string;
  zone?: string;
  address?: string;
}

export async function searchStations(query: string = '', limit: number = 40): Promise<StationRecord[]> {
  try {
    const res = await fetch(`${API_BASE}/stations?q=${encodeURIComponent(query)}&limit=${limit}`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data;
    }
    return [];
  } catch (err) {
    console.error('Failed to search stations:', err);
    return [];
  }
}

export async function deleteJourney(id: number): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/journeys/${id}`, {
    method: 'DELETE'
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to delete journey');
  return json;
}

export async function fetchStats(): Promise<JourneyStats> {
  const res = await fetch(`${API_BASE}/stats`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to fetch statistics');
  return json.data;
}

export async function seedSampleData(): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/seed`, { method: 'POST' });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to seed sample data');
  return json;
}

export async function resetAllData(): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/reset`, { method: 'POST' });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to reset database');
  return json;
}

export async function syncJourneys(journeys: Journey[]): Promise<{ success: boolean; count: number }> {
  try {
    const res = await fetch(`${API_BASE}/journeys/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ journeys })
    });
    const json = await res.json();
    return json;
  } catch (err) {
    console.warn('Sync journeys to server failed:', err);
    return { success: false, count: 0 };
  }
}
