/**
 * Centralized query key factory for React Query
 * Provides consistent, hierarchical query keys with TypeScript support
 */

export const queryKeys = {
  // Users
  users: {
    all: () => ['users'] as const,
    lists: () => [...queryKeys.users.all(), 'list'] as const,
    list: (filters?: Record<string, unknown>) => 
      filters ? [...queryKeys.users.lists(), filters] as const : queryKeys.users.lists(),
    details: () => [...queryKeys.users.all(), 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
    byType: (type: string) => [...queryKeys.users.lists(), { type }] as const,
  },

  // Locations
  locations: {
    all: () => ['locations'] as const,
    lists: () => [...queryKeys.locations.all(), 'list'] as const,
    list: (filters?: Record<string, unknown>) => 
      filters ? [...queryKeys.locations.lists(), filters] as const : queryKeys.locations.lists(),
    details: () => [...queryKeys.locations.all(), 'detail'] as const,
    detail: (id: string) => [...queryKeys.locations.details(), id] as const,
  },

  // Organisations
  organisations: {
    all: () => ['organisations'] as const,
    lists: () => [...queryKeys.organisations.all(), 'list'] as const,
    list: (filters?: Record<string, unknown>) => 
      filters ? [...queryKeys.organisations.lists(), filters] as const : queryKeys.organisations.lists(),
    details: () => [...queryKeys.organisations.all(), 'detail'] as const,
    detail: (id: string) => [...queryKeys.organisations.details(), id] as const,
  },

  // Jobs
  jobs: {
    all: () => ['jobs'] as const,
    lists: () => [...queryKeys.jobs.all(), 'list'] as const,
    list: (filter?: unknown, userType?: string) => {
      const key = [...queryKeys.jobs.lists()];
      // @ts-expect-error - Query key array typing complexity
      if (filter) key.push(filter);
      // @ts-expect-error - Query key array typing complexity
      if (userType) key.push(userType);
      return key;
    },
    details: () => [...queryKeys.jobs.all(), 'detail'] as const,
    detail: (id: string) => [...queryKeys.jobs.details(), id] as const,
    history: (jobId: string, userType?: string) => {
      const key = ['job-history', jobId];
      if (userType) key.push(userType);
      return key;
    },
  },

  // Files
  files: {
    all: () => ['files'] as const,
    lists: () => [...queryKeys.files.all(), 'list'] as const,
    list: (filter?: Record<string, unknown>) => 
      filter ? [...queryKeys.files.lists(), filter] as const : queryKeys.files.lists(),
    details: () => [...queryKeys.files.all(), 'detail'] as const,
    detail: (id: string) => [...queryKeys.files.details(), id] as const,
  },

  // Contractor specific
  contractor: {
    documents: (userId?: string) => 
      userId ? ['contractor-documents', userId] as const : ['contractor-documents'] as const,
    profile: (userId: string) => ['contractor-profile', userId] as const,
  },

  // User invitations
  userInvitations: {
    all: () => ['user-invitations'] as const,
    lists: () => [...queryKeys.userInvitations.all(), 'list'] as const,
    list: (filters?: Record<string, unknown>) => 
      filters ? [...queryKeys.userInvitations.lists(), filters] as const : queryKeys.userInvitations.lists(),
  },

  // Notifications
  notifications: {
    all: (userId?: string) => 
      userId ? ['notifications', userId] as const : ['notifications'] as const,
    unread: (userId?: string) => 
      userId ? ['notifications-unread', userId] as const : ['notifications-unread'] as const,
  },
} as const;

// Type helper to extract query key types
export type QueryKeys = typeof queryKeys;

// Utility functions for cache invalidation
export const invalidateQueries = {
  // Invalidate all queries for an entity
  all: (entity: keyof QueryKeys) => {
    const entityKeys = queryKeys[entity];
    return 'all' in entityKeys ? (entityKeys as { all: () => readonly unknown[] }).all() : [];
  },
  
  // Invalidate all list queries for an entity
  lists: (entity: keyof Omit<QueryKeys, 'contractor' | 'notifications'>) => {
    const entityKeys = queryKeys[entity as keyof Omit<QueryKeys, 'contractor' | 'notifications'>];
    return 'lists' in entityKeys ? (entityKeys as { lists: () => readonly unknown[] }).lists() : [];
  },
  
  // Invalidate a specific detail query
  detail: (entity: keyof Omit<QueryKeys, 'contractor' | 'notifications'>, id: string) => {
    const entityKeys = queryKeys[entity as keyof Omit<QueryKeys, 'contractor' | 'notifications'>];
    return 'detail' in entityKeys ? (entityKeys as { detail: (id: string) => readonly unknown[] }).detail(id) : [];
  },
};

// Export individual entity query keys for convenience
export const userKeys = queryKeys.users;
export const locationKeys = queryKeys.locations;
export const organisationKeys = queryKeys.organisations;
export const jobKeys = queryKeys.jobs;
export const fileKeys = queryKeys.files;
export const contractorKeys = queryKeys.contractor;
export const userInvitationKeys = queryKeys.userInvitations;
export const notificationKeys = queryKeys.notifications;