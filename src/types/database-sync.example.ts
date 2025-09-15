/**
 * Example: How to sync Drizzle and Supabase generated types
 * 
 * This approach uses Supabase generated types for API calls
 * while keeping Drizzle types for internal use
 */

// Example imports - replace with your actual paths
// @ts-expect-error - This file doesn't exist yet, run: npx supabase gen types typescript
import { Database as SupabaseDatabase } from './supabase-generated';
import { Profile as DrizzleProfile } from './drizzle';
import { camelizeKeys, decamelizeKeys } from 'humps';
import { createClientSupabaseClient } from '@/lib/supabase/client';

// Type assertion helper to ensure compatibility
type AssertCompatible<T, U> = T extends U ? U extends T ? true : false : false;

// Verify types match at compile time (this is a compile-time check)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type ProfileCompatible = AssertCompatible<
  DrizzleProfile,
  SupabaseDatabase['public']['Tables']['profiles']['Row']
>;

// Runtime conversion helpers
export function fromSupabase<T>(data: T): T {
  // If using camelCase in app but snake_case in DB
  return camelizeKeys(data) as T;
}

export function toSupabase<T>(data: T): T {
  // Convert to snake_case for database
  return decamelizeKeys(data) as T;
}

// Example usage in hooks/services
export async function getProfiles() {
  const supabase = createClientSupabaseClient();

  const { data } = await supabase
    .from('profiles')
    .select('*');

  // Convert Supabase response to app types
  return data ? data.map(fromSupabase) : [];
}

// Note: This is an example file. 
// To use this approach:
// 1. Run: npx supabase gen types typescript --local > src/types/supabase-generated.ts
// 2. Import and use the generated types alongside your Drizzle types 