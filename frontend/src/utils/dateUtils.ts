export interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
  isPast: boolean;
}

export function calculateCountdown(targetTimestamp?: number, nowTimestamp: number = Date.now()): CountdownResult {
  if (!targetTimestamp) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, formatted: '--', isPast: true };
  }

  const diffMs = targetTimestamp - nowTimestamp;

  if (diffMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, formatted: 'Now', isPast: true };
  }

  const totalSecs = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSecs / (3600 * 24));
  const hours = Math.floor((totalSecs % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSecs % 3600) / 60);
  const seconds = totalSecs % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
  if (hours > 0 || days > 0) parts.push(`${hours} hr${hours > 1 ? 's' : ''}`);
  parts.push(`${minutes} min${minutes > 1 ? 's' : ''}`);
  if (days === 0) {
    parts.push(`${seconds}s`);
  }

  return {
    days,
    hours,
    minutes,
    seconds,
    formatted: parts.join(' '),
    isPast: false
  };
}

export function formatDateReadable(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export function formatTime12h(time24: string): string {
  if (!time24) return '';
  try {
    const [h, m] = time24.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${String(hour12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
  } catch {
    return time24;
  }
}

export function calculateDuration(depTime: string, arrTime: string, offsetDays: number = 0): string {
  if (!depTime || !arrTime) return '';
  try {
    const [depH, depM] = depTime.split(':').map(Number);
    const [arrH, arrM] = arrTime.split(':').map(Number);

    let depTotal = depH * 60 + depM;
    let arrTotal = arrH * 60 + arrM;

    let effectiveOffset = offsetDays;
    if (effectiveOffset === 0 && arrTotal < depTotal) {
      effectiveOffset = 1;
    }

    arrTotal += effectiveOffset * 24 * 60;

    const diffMins = arrTotal - depTotal;
    if (diffMins < 0) return '';

    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;

    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  } catch {
    return '';
  }
}
