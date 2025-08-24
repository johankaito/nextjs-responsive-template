import { JobStatus, UserType } from '@/types/drizzle';

// Local type for priorities
type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

// Enhanced status color system
export const statusColors = {
  // Job status colors
  job: {
    DRAFT: {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-700 dark:text-gray-300',
      border: 'border-gray-400',
      badge: 'bg-gray-500',
    },
    PENDING_REVIEW: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      text: 'text-yellow-700 dark:text-yellow-300',
      border: 'border-yellow-500',
      badge: 'bg-yellow-500',
    },
    AVAILABLE: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-700 dark:text-green-300',
      border: 'border-green-500',
      badge: 'bg-green-500',
    },
    CLAIMED: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-500',
      badge: 'bg-blue-500',
    },
    SUBMITTED: {
      bg: 'bg-cyan-50 dark:bg-cyan-900/20',
      text: 'text-cyan-700 dark:text-cyan-300',
      border: 'border-cyan-500',
      badge: 'bg-cyan-500',
    },
    IN_PROGRESS: {
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
      text: 'text-indigo-700 dark:text-indigo-300',
      border: 'border-indigo-500',
      badge: 'bg-indigo-500',
    },
    COMPLETED: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-500',
      badge: 'bg-emerald-500',
    },
    PAID: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      text: 'text-purple-700 dark:text-purple-300',
      border: 'border-purple-500',
      badge: 'bg-purple-500',
    },
    ARCHIVED: {
      bg: 'bg-gray-50 dark:bg-gray-900/20',
      text: 'text-gray-700 dark:text-gray-300',
      border: 'border-gray-500',
      badge: 'bg-gray-500',
    },
  },
  // User type colors
  user: {
    ADMIN: {
      bg: 'bg-red-500',
      text: 'text-white',
      hover: 'hover:bg-red-600',
    },
    OWNER: {
      bg: 'bg-purple-500',
      text: 'text-white',
      hover: 'hover:bg-purple-600',
    },
    MANAGER: {
      bg: 'bg-blue-500',
      text: 'text-white',
      hover: 'hover:bg-blue-600',
    },
    CONTRACTOR: {
      bg: 'bg-orange-500',
      text: 'text-white',
      hover: 'hover:bg-orange-600',
    },
  },
  // Priority colors
  priority: {
    LOW: {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-700 dark:text-gray-300',
      border: 'border-gray-300',
    },
    MEDIUM: {
      bg: 'bg-yellow-100 dark:bg-yellow-900/20',
      text: 'text-yellow-700 dark:text-yellow-300',
      border: 'border-yellow-300',
    },
    HIGH: {
      bg: 'bg-red-100 dark:bg-red-900/20',
      text: 'text-red-700 dark:text-red-300',
      border: 'border-red-300',
    },
    URGENT: {
      bg: 'bg-red-500',
      text: 'text-white',
      border: 'border-red-600',
    },
  },
} as const;

// Typography scale
export const typography = {
  // Headings
  h1: 'text-4xl font-bold tracking-tight',
  h2: 'text-3xl font-semibold tracking-tight',
  h3: 'text-2xl font-semibold',
  h4: 'text-xl font-semibold',
  h5: 'text-lg font-medium',
  h6: 'text-base font-medium',
  
  // Body text
  body: {
    large: 'text-lg leading-relaxed',
    base: 'text-base leading-normal',
    small: 'text-sm leading-normal',
    xs: 'text-xs leading-normal',
  },
  
  // Special text
  label: 'text-sm font-medium',
  caption: 'text-xs text-muted-foreground',
  code: 'font-mono text-sm',
  
  // Responsive headings
  responsive: {
    h1: 'text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight',
    h2: 'text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight',
    h3: 'text-lg sm:text-xl md:text-2xl font-semibold',
  },
} as const;

// Spacing system
export const spacing = {
  section: 'py-8 md:py-12',
  card: 'p-4 md:p-6',
  compact: 'p-2 md:p-3',
  stack: {
    xs: 'space-y-1',
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6',
    xl: 'space-y-8',
  },
  inline: {
    xs: 'space-x-1',
    sm: 'space-x-2',
    md: 'space-x-4',
    lg: 'space-x-6',
    xl: 'space-x-8',
  },
} as const;

// Shadow system
export const shadows = {
  sm: 'shadow-sm',
  base: 'shadow',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  inner: 'shadow-inner',
  none: 'shadow-none',
  // Colored shadows
  primary: 'shadow-lg shadow-primary/25',
  success: 'shadow-lg shadow-green-500/25',
  warning: 'shadow-lg shadow-yellow-500/25',
  danger: 'shadow-lg shadow-red-500/25',
} as const;

// Animation durations
export const animation = {
  fast: 'duration-150',
  base: 'duration-200',
  slow: 'duration-300',
  slower: 'duration-500',
  // Easing
  ease: {
    in: 'ease-in',
    out: 'ease-out',
    inOut: 'ease-in-out',
  },
} as const;

// Helper functions
export function getJobStatusColor(status: JobStatus) {
  return statusColors.job[status] || statusColors.job.DRAFT;
}

export function getUserTypeColor(type: UserType) {
  return statusColors.user[type] || statusColors.user.CONTRACTOR;
}

export function getPriorityColor(priority: Priority | string) {
  return statusColors.priority[priority as Priority] || statusColors.priority.MEDIUM;
}