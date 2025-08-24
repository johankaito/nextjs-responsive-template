import { useEffect, useRef, useState } from 'react';

interface UseSmartLoadingOptions {
  /**
   * Whether this is a data query that should show loading on initial load
   */
  isDataQuery?: boolean;
  /**
   * Custom loading delay before showing spinner (ms)
   */
  loadingDelay?: number;
  /**
   * Whether to show loading indicator for background refetches
   */
  showBackgroundRefetch?: boolean;
}

interface SmartLoadingState {
  /**
   * Whether to show a loading indicator
   */
  shouldShowLoading: boolean;
  /**
   * Whether this is the initial load
   */
  isInitialLoad: boolean;
  /**
   * Whether data is being refetched in the background
   */
  isBackgroundRefetch: boolean;
}

/**
 * Hook for intelligent loading state management that prevents
 * loading flicker on app focus while maintaining good UX
 * 
 * Differentiates between initial loads (show spinner) and background
 * refetches (no spinner) to prevent jarring loading states when React Query
 * refetches data on window focus.
 * 
 * @param isLoading - Whether the query is in initial loading state
 * @param isFetching - Whether the query is fetching (initial or refetch)
 * @param hasData - Whether the query has any data
 * @param options - Configuration options
 * @param options.isDataQuery - Whether this is a data query (default: true)
 * @param options.loadingDelay - Delay before showing spinner in ms (default: 200ms)
 * @param options.showBackgroundRefetch - Show loading for refetches (default: false)
 * 
 * @returns Loading state indicators
 * 
 * @example
 * ```typescript
 * // In a data hook
 * const { data, isLoading, isFetching } = useQuery({...});
 * const smartLoading = useSmartLoading(
 *   isLoading,
 *   isFetching,
 *   !!data && data.length > 0
 * );
 * 
 * // In a component
 * if (smartLoading.shouldShowLoading) {
 *   return <Spinner />;
 * }
 * 
 * // Show subtle refetch indicator
 * if (smartLoading.isBackgroundRefetch) {
 *   return <RefreshingIndicator />;
 * }
 * ```
 */
export function useSmartLoading(
  isLoading: boolean,
  isFetching: boolean,
  hasData: boolean,
  options: UseSmartLoadingOptions = {}
): SmartLoadingState {
  const {
    isDataQuery = true,
    loadingDelay = 200,
    showBackgroundRefetch = false,
  } = options;

  const [shouldShowLoading, setShouldShowLoading] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const isInitialLoad = isLoading && !hasLoadedOnce && isDataQuery;
  const isBackgroundRefetch = isFetching && hasData && hasLoadedOnce;

  useEffect(() => {
    // Mark as loaded once we have data
    if (hasData && !hasLoadedOnce) {
      setHasLoadedOnce(true);
    }
  }, [hasData, hasLoadedOnce]);

  useEffect(() => {
    // Clear any existing timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }

    // Determine if we should show loading
    const shouldShow = isInitialLoad || (showBackgroundRefetch && isBackgroundRefetch);

    if (shouldShow) {
      // Add a small delay before showing loading to prevent flicker
      loadingTimeoutRef.current = setTimeout(() => {
        setShouldShowLoading(true);
      }, loadingDelay);
    } else {
      // Hide loading immediately when done
      setShouldShowLoading(false);
    }

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [isInitialLoad, isBackgroundRefetch, showBackgroundRefetch, loadingDelay]);

  return {
    shouldShowLoading,
    isInitialLoad,
    isBackgroundRefetch,
  };
}

/**
 * Hook to track if the initial app load is complete
 */
export function useInitialLoadComplete() {
  const [isComplete, setIsComplete] = useState(() => {
    // Check if we've already loaded once (persisted in sessionStorage)
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('initial-load-complete') === 'true';
    }
    return false;
  });

  const markAsComplete = () => {
    setIsComplete(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('initial-load-complete', 'true');
    }
  };

  const reset = () => {
    setIsComplete(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('initial-load-complete');
    }
  };

  return { isComplete, markAsComplete, reset };
}