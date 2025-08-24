import { useSmartLoading } from './useSmartLoading';
import { createCrudHook, createSingleItemHook } from './useCrudFactory';

interface SmartCrudOptions {
  tableName: string;
  queryKey: string | (() => readonly unknown[]);
  select?: string;
  staleTime?: number;
  gcTime?: number;
  showBackgroundRefetch?: boolean;
}

/**
 * Create a CRUD hook with smart loading to prevent flicker
 */
export function createSmartCrudHook<T extends { id: string }, NewT = Omit<T, 'id'>>(
  options: SmartCrudOptions
) {
  const baseCrudHook = createCrudHook<T, NewT>(options);
  
  // @ts-expect-error - Complex generic typing constraint issue
  return function useSmartCrud(listOptions?: Parameters<ReturnType<typeof baseCrudHook>>[0]) {
    const crud = baseCrudHook(listOptions);
    const smartLoading = useSmartLoading(
      crud.isLoading,
      crud.isFetching,
      crud.hasData,
      {
        showBackgroundRefetch: options.showBackgroundRefetch,
      }
    );

    return {
      ...crud,
      shouldShowLoading: smartLoading.shouldShowLoading,
      isInitialLoad: smartLoading.isInitialLoad,
      isBackgroundRefetch: smartLoading.isBackgroundRefetch,
    };
  };
}

/**
 * Create a single item hook with smart loading to prevent flicker
 */
export function createSmartSingleItemHook<T extends { id: string }>(
  options: Pick<SmartCrudOptions, 'tableName' | 'queryKey' | 'select' | 'staleTime' | 'gcTime' | 'showBackgroundRefetch'>
) {
  const baseSingleHook = createSingleItemHook<T>(options);
  
  return function useSmartSingleItem(id?: string) {
    const { data, isLoading, isFetching, error, refetch } = baseSingleHook(id || '');
    const smartLoading = useSmartLoading(
      isLoading,
      isFetching,
      !!data,
      {
        showBackgroundRefetch: options.showBackgroundRefetch,
      }
    );

    return {
      data,
      isLoading,
      isFetching,
      error,
      refetch,
      shouldShowLoading: smartLoading.shouldShowLoading,
      isInitialLoad: smartLoading.isInitialLoad,
      isBackgroundRefetch: smartLoading.isBackgroundRefetch,
    };
  };
}