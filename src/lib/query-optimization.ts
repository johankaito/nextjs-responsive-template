import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/drizzle';

// Query optimization options
export interface QueryOptions {
  includeRelations?: boolean;
  fields?: string[];
  limit?: number;
  offset?: number;
  orderBy?: {
    column: string;
    ascending?: boolean;
  };
}

// Field selection helpers
export const jobFields = {
  minimal: ['id', 'title', 'status', 'createdAt'],
  list: ['id', 'title', 'description', 'status', 'category', 'priority', 'locationId', 'contractorId', 'createdAt'],
  detail: ['*'],
} as const;

export const userFields = {
  minimal: ['id', 'name', 'email', 'type'],
  list: ['id', 'name', 'email', 'type', 'status', 'createdAt'],
  detail: ['*'],
} as const;

export const locationFields = {
  minimal: ['id', 'name'],
  list: ['id', 'name', 'address', 'status'],
  detail: ['*'],
} as const;

// Build optimized select query
export function buildSelectQuery<T extends keyof Database['public']['Tables']>(
  table: T,
  options?: QueryOptions
): string {
  const { fields, includeRelations } = options || {};
  
  if (fields && fields.length > 0) {
    return fields.join(', ');
  }
  
  if (includeRelations) {
    return '*'; // Return all fields when including relations
  }
  
  // Default minimal fields for common tables
  switch (table) {
    case 'jobs':
      return jobFields.list.join(', ');
    case 'users':
      return userFields.list.join(', ');
    case 'locations':
      return locationFields.list.join(', ');
    default:
      return '*';
  }
}

// Batch query helper for reducing N+1 queries
export async function batchQuery<T>(
  supabase: SupabaseClient<Database>,
  table: keyof Database['public']['Tables'],
  ids: string[],
  options?: QueryOptions
): Promise<T[]> {
  if (ids.length === 0) return [];
  
  // Split into chunks to avoid query size limits
  const chunkSize = 100;
  const chunks = [];
  
  for (let i = 0; i < ids.length; i += chunkSize) {
    chunks.push(ids.slice(i, i + chunkSize));
  }
  
  const results = await Promise.all(
    chunks.map(async (chunk) => {
      const { data } = await supabase
        .from(table)
        .select(buildSelectQuery(table, options))
        .in('id', chunk);
      
      return data || [];
    })
  );
  
  return results.flat() as T[];
}

// Optimized count query without fetching data
export async function getCount(
  supabase: SupabaseClient<Database>,
  table: keyof Database['public']['Tables'],
  filter?: Record<string, unknown>
): Promise<number> {
  let query = supabase.from(table).select('*', { count: 'exact', head: true });
  
  if (filter) {
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });
  }
  
  const { count } = await query;
  return count || 0;
}

// Paginated query helper
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export async function paginatedQuery<T>(
  supabase: SupabaseClient<Database>,
  table: keyof Database['public']['Tables'],
  options: {
    page?: number;
    pageSize?: number;
    filter?: Record<string, unknown>;
    queryOptions?: QueryOptions;
  }
): Promise<PaginatedResult<T>> {
  const page = options.page || 1;
  const pageSize = options.pageSize || 20;
  const offset = (page - 1) * pageSize;
  
  // Get total count
  const total = await getCount(supabase, table, options.filter);
  
  // Get paginated data
  let query = supabase
    .from(table)
    .select(buildSelectQuery(table, options.queryOptions))
    .range(offset, offset + pageSize - 1);
  
  if (options.filter) {
    Object.entries(options.filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });
  }
  
  if (options.queryOptions?.orderBy) {
    query = query.order(
      options.queryOptions.orderBy.column,
      { ascending: options.queryOptions.orderBy.ascending ?? true }
    );
  }
  
  const { data } = await query;
  
  return {
    data: (data || []) as T[],
    total,
    page,
    pageSize,
    hasMore: offset + pageSize < total,
  };
}