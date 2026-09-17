import { type ClassValue, clsx } from 'clsx';

// clsx is not installed — use a simple implementation
export function cn(...inputs: ClassValue[]): string {
  return inputs
    .flatMap((input) => {
      if (!input) return [];
      if (typeof input === 'string') return [input];
      if (Array.isArray(input)) return [cn(...input)];
      if (typeof input === 'object') {
        return Object.entries(input)
          .filter(([, val]) => Boolean(val))
          .map(([key]) => key);
      }
      return [];
    })
    .filter(Boolean)
    .join(' ');
}

// Re-export type
export type { ClassValue };

export function formatDate(dateStr: string | Date | undefined | null): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateStr: string | Date | undefined | null): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(dateStr: string | Date | undefined | null): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '—';
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateStr);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '…';
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getPatientStatusColor(status: string): string {
  switch (status) {
    case 'Active': return 'success';
    case 'Discharged': return 'default';
    default: return 'default';
  }
}

export function getReferralStatusColor(status: string): string {
  switch (status) {
    case 'Pending': return 'warning';
    case 'Accepted': return 'success';
    case 'Declined': return 'error';
    case 'Admitted': return 'primary';
    case 'InfoRequested': return 'warning';
    default: return 'default';
  }
}

export function getMedicationStatusColor(status: string): string {
  switch (status) {
    case 'Ordered': return 'warning';
    case 'Given': return 'success';
    default: return 'default';
  }
}

export function getLabStatusColor(status: string): string {
  switch (status) {
    case 'Ordered': return 'warning';
    case 'Completed': return 'success';
    default: return 'default';
  }
}

export function getVisitOutcomeColor(outcome: string): string {
  switch (outcome) {
    case 'Stable':
    case 'SymptomsImproved': return 'success';
    case 'SymptomsUnchanged': return 'warning';
    case 'SymptomsWorsened':
    case 'Deceased': return 'error';
    case 'ReferredToFacility': return 'primary';
    default: return 'default';
  }
}

export function formatEnumLabel(value: string): string {
  // Convert CamelCase to Title Case with spaces
  return value
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .replace(/^./, (str) => str.toUpperCase());
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Role checking helper
export function hasRole(
  user: { role?: string | null } | null | undefined,
  ...roles: string[]
): boolean {
  if (!user?.role) return false;
  return roles.includes(user.role);
}

// Format response time in human-readable format
export function formatResponseTime(minutes: number | null | undefined): string {
  if (minutes === null || minutes === undefined || isNaN(minutes)) return '—';
  if (minutes === 0) return '0m';
  
  const days = Math.floor(minutes / (24 * 60));
  const hours = Math.floor((minutes % (24 * 60)) / 60);
  const mins = Math.floor(minutes % 60);
  
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (mins > 0 || parts.length === 0) parts.push(`${mins}m`);
  
  return parts.join(' ');
}
