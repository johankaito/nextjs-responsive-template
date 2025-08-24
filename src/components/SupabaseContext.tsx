"use client";

import React, { createContext, useContext, useCallback, useRef, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useToast } from '@/components/ui/useToast';
import { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/drizzle';
import { useRouter } from 'next/navigation';
import { camelizeKeys } from 'humps';
import { getUserFriendlyError } from '@/lib/error-handling';

// Context
const SupabaseContext = createContext<SupabaseClient<Database> | null>(null);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const client = useRef<SupabaseClient<Database> | null>(null);
  if (!client.current) {
    client.current = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  // Provide the raw client
  return (
    <SupabaseContext.Provider value={client.current}>
      {children}
    </SupabaseContext.Provider>
  );
}

// Hook
export function useSupabase<T = unknown>() {
  const client = useContext(SupabaseContext) as SupabaseClient<Database>;
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  if (!client) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }

  // Generic query function with error handling and loading state
  const query = useCallback(
    async <R extends T>(
      queryFn: (supabase: SupabaseClient<Database>) => Promise<{
        data: R | null;
        error: PostgrestError | null;
      }>
    ): Promise<{ data: R | null; error: PostgrestError | null; loading: boolean }> => {
      setLoading(true);
      try {
        const { data, error } = await queryFn(client);
        if (error) {
          const userFriendlyMessage = getUserFriendlyError(error);
          toast({
            title: 'Error',
            description: userFriendlyMessage,
            variant: 'destructive',
          });
          console.error('Supabase error:', { error, stack: error.stack });
          return { data: null, error, loading: false };
        }
        // Convert data to camelCase while preserving the type
        const camelizedData = data ? (camelizeKeys(data) as R) : null;
        return { data: camelizedData, error: null, loading: false };
      } catch (err) {
        const error = err as Error;
        const userFriendlyMessage = getUserFriendlyError(error);
        toast({
          title: 'Error',
          description: userFriendlyMessage,
          variant: 'destructive',
        });
        console.error('Unexpected error:', error);
        return {
          data: null,
          error: { message: error.message } as PostgrestError,
          loading: false,
        };
      } finally {
        setLoading(false);
      }
    },
    [client, toast]
  );

  // Generic mutation function with error handling and loading state
  const mutate = useCallback(
    async <R extends T>(
      mutationFn: (supabase: SupabaseClient<Database>) => Promise<{
        data: R | null;
        error: PostgrestError | null;
      }>
    ): Promise<{ data: R | null; error: PostgrestError | null; loading: boolean }> => {
      setLoading(true);
      try {
        const { data, error } = await mutationFn(client);
        if (error) {
          const userFriendlyMessage = getUserFriendlyError(error);
          toast({
            title: 'Error',
            description: userFriendlyMessage,
            variant: 'destructive',
          });
          console.error('Supabase error:', error);
          return { data: null, error, loading: false };
        }
        return { data, error: null, loading: false };
      } catch (err) {
        const error = err as Error;
        const userFriendlyMessage = getUserFriendlyError(error);
        toast({
          title: 'Error',
          description: userFriendlyMessage,
          variant: 'destructive',
        });
        console.error('Unexpected error:', error);
        return {
          data: null,
          error: { message: error.message } as PostgrestError,
          loading: false,
        };
      } finally {
        setLoading(false);
      }
    },
    [client, toast]
  );

  // sign out function
  const signOut = async () => {
    try {
      await client.auth.signOut();
      toast({
        title: 'Signed out',
        description: 'You have been signed out',
      });
      router.push('/login');
    } catch (error: unknown) {
      const err = error as Error;
      const userFriendlyMessage = getUserFriendlyError(err) || 'Failed to sign out';
      toast({
        title: 'Error',
        description: userFriendlyMessage,
        variant: 'destructive',
      });
      console.error("DEBUG::error in signOut", { error })
    }
  };

  return {
    client,
    query,
    mutate,
    loading,
    signOut,
  };
} 