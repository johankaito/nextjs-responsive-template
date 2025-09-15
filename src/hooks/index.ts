// Core hooks - always imported
export { useAuth } from './useAuth';
export { useUser } from '@/components/UserContext';
export { useSupabase } from '@/components/SupabaseContext';
export { useToast } from '@/components/ui/useToast';

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

// Lazy-loaded utility hooks - import on demand to reduce bundle size
export const lazyHooks = {
  useMediaQuery: () => import('./useMediaQuery').then(m => m.useMediaQuery),
  useMobileViewport: () => import('./useMobileViewport').then(m => m.useMobileViewport),
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
  useVersionCheck: () => import('./useVersionCheck').then(m => m.useVersionCheck),
  useKeyboardShortcuts: () => import('./useKeyboardShortcuts').then(m => m.useKeyboardShortcuts),
};

// Type exports
export type { AppError, ErrorType, ErrorSeverity } from '@/types/errors';