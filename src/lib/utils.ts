import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { JOB_CATEGORIES } from "@/types/drizzle"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getJobCategoryOptions() {
  return JOB_CATEGORIES.map(category => ({
    label: formatJobCategory(category),
    value: category,
  }));
}

export function formatJobCategory(category: string): string {
  const categoryMap: Record<string, string> = {
    'GENERAL_MAINTENANCE': 'General Maintenance',
    'ELECTRICAL': 'Electrical',
    'PLUMBING': 'Plumbing',
    'OFF_PLATFORM': 'Off Platform'
  };
  
  return categoryMap[category] || category;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export function formatRelativeDate(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffInMs = now.getTime() - then.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  
  const weeks = Math.floor(diffInDays / 7);
  if (diffInDays < 30) return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
  
  const months = Math.floor(diffInDays / 30);
  if (diffInDays < 365) return `${months} month${months === 1 ? '' : 's'} ago`;
  
  const years = Math.floor(diffInDays / 365);
  return `${years} year${years === 1 ? '' : 's'} ago`;
}

/**
 * Get the base URL for the current environment
 * Handles localhost with port for development and production domains
 * @returns Base URL (e.g., "http://localhost:3000" or "https://example.com")
 */
export function getBaseUrl(): string {
  if (typeof window === 'undefined') {
    // Server-side fallback - should not be used for client-side redirects
    return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  }

  const { protocol, hostname, port } = window.location;
  
  // Check if we need to include the port
  const isDefaultPort = 
    (protocol === 'http:' && port === '80') || 
    (protocol === 'https:' && port === '443') ||
    !port; // No port specified means default port
  
  if (isDefaultPort) {
    return `${protocol}//${hostname}`;
  } else {
    return `${protocol}//${hostname}:${port}`;
  }
}
