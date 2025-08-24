// Core hooks - always imported
export { useAuth } from './useAuth';
export { useUser } from '@/components/UserContext';
export { useSupabase } from '@/components/SupabaseContext';
export { useToast } from '@/components/ui/useToast';

// Data hooks - commonly used
export { useJobs } from './useJobs';
export { useUsers } from './useUsers';
export { useLocations } from './useLocations';
export { useOrganisations } from './useOrganisations';
export { useFiles } from './useFiles';

// Factory hooks
export { createCrudHook, createSingleItemHook } from './useCrudFactory';
export { createSmartCrudHook, createSmartSingleItemHook } from './useSmartCrud';

// State management hooks
export { useLocalStorage } from './useLocalStorage';
export { useDebounce } from './useDebounce';
export { useFilterPreferences } from './useFilterPreferences';
export { useSmartLoading, useInitialLoadComplete } from './useSmartLoading';

// Error handling
export { useErrorHandler } from './useErrorHandler';

// RBAC and permissions
export { useRBAC } from './useRbac';

// Lazy-loaded utility hooks - import on demand to reduce bundle size
export const lazyHooks = {
  useMediaQuery: () => import('./useMediaQuery').then(m => m.useMediaQuery),
  usePrevious: () => import('./usePrevious').then(m => m.usePrevious),
  usePreviousWithInitial: () => import('./usePrevious').then(m => m.usePreviousWithInitial),
  usePreviousHistory: () => import('./usePrevious').then(m => m.usePreviousHistory),
  useOnClickOutside: () => import('./useOnClickOutside').then(m => m.useOnClickOutside),
  useOnClickOutsideMultiple: () => import('./useOnClickOutside').then(m => m.useOnClickOutsideMultiple),
  useConditionalOnClickOutside: () => import('./useOnClickOutside').then(m => m.useConditionalOnClickOutside),
  useIntersectionObserver: () => import('./useIntersectionObserver').then(m => m.useIntersectionObserver),
  useMultipleIntersectionObserver: () => import('./useIntersectionObserver').then(m => m.useMultipleIntersectionObserver),
  useWindowSize: () => import('./useWindowSize').then(m => m.useWindowSize),
  useScrollPosition: () => import('./useWindowSize').then(m => m.useScrollPosition),
  useScrollDirection: () => import('./useWindowSize').then(m => m.useScrollDirection),
  useImpersonation: () => import('./useImpersonation').then(m => m.useImpersonation),
  useVersionCheck: () => import('./useVersionCheck').then(m => m.useVersionCheck),
  useKeyboardShortcuts: () => import('./useKeyboardShortcuts').then(m => m.useKeyboardShortcuts),
  useNotifications: () => import('./useNotifications').then(m => m.useNotifications),
  useContractorDocuments: () => import('./useContractorDocuments').then(m => m.useContractorDocuments),
};

// Type exports
export type { AppError, ErrorType, ErrorSeverity } from '@/types/errors';