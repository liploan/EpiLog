import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateRange(start: Date | string, end: Date | string): string {
  const s = typeof start === 'string' ? new Date(start) : start;
  const e = typeof end === 'string' ? new Date(end) : end;
  
  if (s.toDateString() === e.toDateString()) {
    return formatDate(s);
  }
  return `${formatDate(s)} – ${formatDate(e)}`;
}

export function getAssetUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  // Handle GitHub Pages prefix in static export
  const prefix = typeof window !== 'undefined' && window.location.pathname.startsWith('/EpiLog') ? '/EpiLog' : '';
  return `${prefix}${cleanPath}`;
}

export function getMapUrl(lat: number, lng: number, label?: string): string {
  // Universal map URL that opens in native map app on mobile (Apple Maps/Google Maps) or browser
  if (label) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(label)}+${lat},${lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

