// src/lib/utils.ts

/**
 * Format a date string to a human-readable format.
 * e.g. "2026-08-29T10:00:00Z" → "Aug 29, 2026"
 */
export function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
}

/**
 * Format a date string to include time.
 * e.g. "2026-08-29T10:00:00Z" → "Aug 29, 2026, 10:00 AM"
 */
export function formatDateTime(dateStr: string | undefined | null): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

/**
 * Format a date string for display as a relative time.
 * e.g. "2 minutes ago", "3 days ago"
 */
export function formatRelativeTime(dateStr: string | undefined | null): string {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60_000);
    const diffHours = Math.floor(diffMs / 3_600_000);
    const diffDays = Math.floor(diffMs / 86_400_000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    return formatDate(dateStr);
  } catch {
    return '—';
  }
}

/**
 * Get today's date as a string in YYYY-MM-DD format.
 */
export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Capitalise the first letter of a string.
 */
export function capitalise(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Join an array of strings with commas, returning '—' for empty arrays.
 */
export function joinList(items: string[] | undefined | null, separator = ', '): string {
  if (!items || items.length === 0) return '—';
  return items.join(separator);
}

/**
 * Extract a readable error message from an Axios-style error or unknown.
 */
export function getErrorMessage(error: unknown): string {
  if (!error) return 'An unknown error occurred.';
  if (typeof error === 'string') return error;
  if (
    typeof error === 'object' &&
    'response' in error &&
    error.response !== null &&
    typeof error.response === 'object' &&
    'data' in error.response &&
    error.response.data !== null &&
    typeof error.response.data === 'object' &&
    'message' in error.response.data &&
    typeof (error.response.data as { message?: unknown }).message === 'string'
  ) {
    return (error.response.data as { message: string }).message;
  }
  if (
    typeof error === 'object' &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message;
  }
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Clamp a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Returns total number of pages given total items and page size.
 */
export function totalPages(total: number, pageSize: number): number {
  if (pageSize <= 0) return 0;
  return Math.ceil(total / pageSize);
}

/**
 * Build initials from a full name. e.g. "John Doe" → "JD"
 */
export function getInitials(name: string): string {
  if (!name) return '?';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

/**
 * Combine class names (simple utility, no external dep).
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
