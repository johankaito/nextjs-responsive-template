import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  UseMutationResult 
} from '@tanstack/react-query';
import { SupabaseClient } from '@supabase/supabase-js';
import { camelizeKeys, decamelizeKeys } from 'humps';
import { useSupabase } from '@/components/SupabaseContext';
import { Database } from '@/types/drizzle';
import { transformError } from '@/lib/error-handling';
import { useCallback, useMemo } from 'react';

interface CrudOptions {
  tableName: string;
  queryKey: string | (() => readonly unknown[]);
  select?: string;
  staleTime?: number;
  gcTime?: number;
}

interface ListOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filters?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  offset?: number;
}

interface CrudHook<T, NewT = Partial<T>> {
  data: T[] | undefined;
  isLoading: boolean;
  isFetching: boolean;
  hasData: boolean;
  error: Error | null;
  createItem: (item: NewT) => void;
  createItemAsync: (item: NewT) => Promise<T[]>;
  createMutation: UseMutationResult<T[], unknown, NewT>;
  updateItem: (params: { id: string } & Partial<T>) => void;
  updateItemAsync: (params: { id: string } & Partial<T>) => Promise<T[]>;
  updateMutation: UseMutationResult<T[], unknown, { id: string } & Partial<T>>;
  deleteItem: (id: string) => void;
  deleteItemAsync: (id: string) => Promise<T[]>;
  deleteMutation: UseMutationResult<T[], unknown, string>;
  refetch: () => void;
}

/**
 * Factory function to create CRUD hooks for any Supabase table
 * 
 * Creates a fully-featured data hook with automatic caching, optimistic updates,
 * and consistent error handling. Supports filtering, ordering, and pagination.
 * 
 * @template T - The entity type (must have an id property)
 * @template NewT - The type for creating new entities (defaults to T without id)
 * 
 * @param options - Configuration for the CRUD hook
 * @param options.tableName - The Supabase table name
 * @param options.queryKey - Query key for React Query caching (string or factory function)
 * @param options.select - SQL select statement (default: '*')
 * @param options.staleTime - Time in ms before data is considered stale (default: 5 minutes)
 * @param options.gcTime - Time in ms before inactive data is garbage collected (default: 10 minutes)
 * 
 * @returns A hook function that provides CRUD operations
 * 
 * @example
 * ```typescript
 * // Create a users hook
 * export const useUsers = createCrudHook<User, NewUser>({
 *   tableName: 'users',
 *   queryKey: userKeys.all,
 *   select: '*',
 *   staleTime: 5 * 60 * 1000,
 * });
 * 
 * // Use the hook
 * const {
 *   data,
 *   isLoading,
 *   createItemAsync,
 *   updateItemAsync,
 *   deleteItemAsync,
 * } = useUsers({
 *   filters: { status: 'active' },
 *   orderBy: { column: 'createdAt', ascending: false },
 *   limit: 10,
 * });
 * ```
 */
export function createCrudHook<T extends { id: string }, NewT = Omit<T, 'id'>>(
  options: CrudOptions
): (listOptions?: ListOptions) => CrudHook<T, NewT> {
  const { 
    tableName, 
    queryKey,
    select = '*',
    staleTime = 5 * 60 * 1000, // 5 minutes
    gcTime = 10 * 60 * 1000, // 10 minutes
  } = options;

  return function useCrud(listOptions?: ListOptions): CrudHook<T, NewT> {
    const { query, mutate } = useSupabase<T[]>();
    const queryClient = useQueryClient();

    // Get base query key - support both strings and functions
    const getBaseKey = useCallback(() => 
      typeof queryKey === 'function' ? queryKey() : [queryKey], 
      []
    );
    
    const baseKey = useMemo(() => getBaseKey(), [getBaseKey]);
    
    // Build query key with filters for cache management
    const fullQueryKey = useMemo(() => 
      listOptions?.filters 
        ? [...baseKey, listOptions.filters]
        : baseKey,
      [baseKey, listOptions?.filters]
    );

    // Memoize query function
    const queryFn = useCallback(async () => {
      const { data, error } = await query(async (supabase: SupabaseClient<Database>) => {
        let queryBuilder = supabase.from(tableName).select(select);
        
        // Apply filters
        if (listOptions?.filters) {
          Object.entries(listOptions.filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              // Convert camelCase to snake_case for database columns
              const snakeKey = decamelizeKeys({ [key]: value });
              const dbKey = Object.keys(snakeKey)[0];
              queryBuilder = queryBuilder.eq(dbKey, value);
            }
          });
        }

        // Apply ordering
        if (listOptions?.orderBy) {
          const { column, ascending = true } = listOptions.orderBy;
          const snakeColumn = decamelizeKeys({ [column]: true });
          const dbColumn = Object.keys(snakeColumn)[0];
          queryBuilder = queryBuilder.order(dbColumn, { ascending });
        }

        // Apply pagination
        if (listOptions?.limit) {
          queryBuilder = queryBuilder.limit(listOptions.limit);
        }
        if (listOptions?.offset) {
          queryBuilder = queryBuilder.range(
            listOptions.offset,
            listOptions.offset + (listOptions.limit || 10) - 1
          );
        }

        const result = await queryBuilder;
        return { 
          data: result.data ? camelizeKeys(result.data) as T[] : [], 
          error: result.error 
        };
      });
      
      if (error) {
        throw transformError(error, `fetching ${tableName}`);
      }
      return data as T[];
    }, [query, listOptions]);

    // Fetch data
    const { data, isLoading, isFetching, error, refetch } = useQuery({
      queryKey: fullQueryKey,
      queryFn,
      staleTime,
      gcTime,
    });

    // Memoize mutation callbacks
    const invalidateQueries = useCallback(() => {
      const invalidateKey = getBaseKey();
      queryClient.invalidateQueries({ queryKey: invalidateKey });
    }, [queryClient, getBaseKey]);

    // Create mutation
    const createMutation = useMutation({
      mutationFn: useCallback(async (newItem: NewT) => {
        const { data, error } = await mutate(async (supabase: SupabaseClient<Database>) => {
          const result = await supabase
            .from(tableName)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .insert(decamelizeKeys(newItem) as any)
            .select(select);
          return { 
            data: result.data ? camelizeKeys(result.data) as T[] : [], 
            error: result.error 
          };
        });
        if (error) {
          throw transformError(error, `creating ${tableName} item`);
        }
        return data as T[];
      }, [mutate]),
      onSuccess: invalidateQueries,
    });

    // Update mutation
    const updateMutation = useMutation({
      mutationFn: useCallback(async ({ id, ...updates }: { id: string } & Partial<T>) => {
        const { data, error } = await mutate(async (supabase: SupabaseClient<Database>) => {
          // Remove any relation properties that shouldn't be updated
          // Remove relation properties that shouldn't be updated
          const relationKeys = [
            'managers',
            'organisation',
            'organization',
            'owner',
            'contractor',
            'location',
            'createdByUser',
            'updatedByUser',
            'deletedByUser',
            'jobHistories',
            'jobFiles'
          ];
          
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const cleanedUpdates = Object.entries(updates as any).reduce((acc, [key, value]) => {
            if (!relationKeys.includes(key)) {
              acc[key] = value;
            }
            return acc;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          }, {} as any);
          
          // Filter out any remaining array properties
          const finalUpdates = Object.entries(cleanedUpdates).reduce((acc, [key, value]) => {
            if (!Array.isArray(value)) {
              acc[key] = value;
            }
            return acc;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          }, {} as any);
          
          const result = await supabase
            .from(tableName)
            // @ts-expect-error - Complex generic typing issue with Supabase client
            .update(decamelizeKeys(finalUpdates))
            .eq('id', id)
            .select(select);
          return { 
            data: result.data ? camelizeKeys(result.data) as T[] : [], 
            error: result.error 
          };
        });
        if (error) {
          throw transformError(error, `updating ${tableName} item`);
        }
        return data as T[];
      }, [mutate]),
      onSuccess: invalidateQueries,
    });

    // Delete mutation
    const deleteMutation = useMutation({
      mutationFn: useCallback(async (id: string) => {
        const { data, error } = await mutate(async (supabase: SupabaseClient<Database>) => {
          const result = await supabase
            .from(tableName)
            .delete()
            .eq('id', id)
            .select(select);
          return { 
            data: result.data ? camelizeKeys(result.data) as T[] : [], 
            error: result.error 
          };
        });
        if (error) {
          throw transformError(error, `deleting ${tableName} item`);
        }
        return data as T[];
      }, [mutate]),
      onSuccess: invalidateQueries,
    });

    return {
      data,
      isLoading,
      isFetching,
      error,
      refetch,
      hasData: !!data && data.length > 0,
      createItem: createMutation.mutate,
      createItemAsync: createMutation.mutateAsync,
      createMutation,
      updateItem: updateMutation.mutate,
      updateItemAsync: updateMutation.mutateAsync,
      updateMutation,
      deleteItem: deleteMutation.mutate,
      deleteItemAsync: deleteMutation.mutateAsync,
      deleteMutation,
    };
  };
}

/**
 * Factory function to create a single item fetch hook
 * 
 * Creates a hook for fetching individual items by ID with automatic caching
 * and error handling. Only fetches when an ID is provided.
 * 
 * @template T - The entity type (must have an id property)
 * 
 * @param options - Configuration for the hook
 * @param options.tableName - The Supabase table name
 * @param options.queryKey - Query key for React Query caching
 * @param options.select - SQL select statement (default: '*')
 * @param options.staleTime - Time before data is considered stale
 * @param options.gcTime - Time before garbage collection
 * 
 * @returns A hook function that fetches a single item by ID
 * 
 * @example
 * ```typescript
 * // Create a single user hook
 * export const useUser = createSingleItemHook<User>({
 *   tableName: 'users',
 *   queryKey: userKeys.all,
 *   select: '*',
 * });
 * 
 * // Use the hook
 * const { data: user, isLoading, error } = useUser(userId);
 * 
 * // Conditional fetching (won't fetch if userId is undefined)
 * const { data } = useUser(shouldFetch ? userId : undefined);
 * ```
 */
export function createSingleItemHook<T extends { id: string }>(
  options: Pick<CrudOptions, 'tableName' | 'queryKey' | 'select' | 'staleTime' | 'gcTime'>
) {
  const {
    tableName,
    queryKey,
    select = '*',
    staleTime = 5 * 60 * 1000,
    gcTime = 10 * 60 * 1000,
  } = options;

  return function useSingleItem(id: string) {
    const { query } = useSupabase<T | null>();
    
    // Build query key for single item
    const buildQueryKey = () => {
      if (typeof queryKey === 'function') {
        const baseKey = queryKey();
        return [...baseKey, 'detail', id];
      }
      return [queryKey, id];
    };
    
    return useQuery({
      queryKey: buildQueryKey(),
      queryFn: async () => {
        const { data, error } = await query(async (supabase: SupabaseClient<Database>) => {
          const result = await supabase
            .from(tableName)
            .select(select)
            .eq('id', id)
            .single();
          return { 
            // @ts-expect-error - Complex generic typing issue with Supabase client
            data: result.data ? camelizeKeys(result.data) as T : null, 
            error: result.error 
          };
        });
        if (error) {
          throw transformError(error, `fetching ${tableName} item`);
        }
        return data as T | null;
      },
      enabled: !!id,
      staleTime,
      gcTime,
    });
  };
}