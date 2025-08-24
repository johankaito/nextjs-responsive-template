import { QueryClient } from '@tanstack/react-query';

/**
 * Create a configured QueryClient with smart defaults
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 2 minutes
        staleTime: 2 * 60 * 1000,
        // Keep data in cache for 10 minutes
        gcTime: 10 * 60 * 1000,
        // Refetch on window focus only if data is stale
        refetchOnWindowFocus: 'always',
        // Keep previous data while fetching
        placeholderData: (previousData: unknown) => previousData,
        // Retry failed requests with exponential backoff
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors
          const errorWithStatus = error as unknown as {status?: number};
          if (errorWithStatus?.status && errorWithStatus.status >= 400 && errorWithStatus.status < 500) {
            return false;
          }
          // Retry up to 3 times for other errors
          return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Enable request deduplication - identical queries will share the same promise
        networkMode: 'online',
      },
      mutations: {
        // Retry mutations once on failure
        retry: 1,
        retryDelay: 1000,
        // Keep mutations optimistic
        networkMode: 'online',
      },
    },
  });
}

// Singleton instance for the app
let queryClient: QueryClient;

export function getQueryClient(): QueryClient {
  if (!queryClient) {
    queryClient = createQueryClient();
  }
  return queryClient;
}