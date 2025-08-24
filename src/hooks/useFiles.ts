import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSupabase } from '@/components/SupabaseContext';
import { Database, File, NewFile } from '@/types/drizzle';
import { camelizeKeys, decamelizeKeys } from 'humps';
import { SupabaseClient } from '@supabase/supabase-js';
import { useCallback } from 'react';
import { useAuth } from './useAuth';

type FileFilter = {
  id?: string;
};

export function useFiles(filter?: FileFilter) {
  const { query, mutate, client } = useSupabase<File[]>();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const getFileUrl = useCallback(
    async (file: Pick<File, "bucket" | "storagePath">) => {
      const { data, error } = await client.storage
        .from(file.bucket)
        .createSignedUrl(file.storagePath, 60 * 60); // 1 hour
      if (error) {
        console.error("Error creating signed URL:", error);
        return null;
      }
      return data?.signedUrl ?? null;
    },
    [client]
  );

  const { data, isLoading } = useQuery({
    queryKey: ['files', filter],
    queryFn: async () => {
      const { data, error } = await query(async (supabase: SupabaseClient<Database>) => {
        let query = supabase.from('files').select('*');

        // Apply filters if provided
        if (filter) {
          if (filter.id) query = query.eq('id', filter.id);
        }

        const result = await query;
        return { data: (camelizeKeys(result.data) as File[]) ?? [], error: result.error };
      });
      if (error) throw error;
      return data as File[];
    },
    // Only fetch if we have at least one filter
    enabled: Boolean(filter && Object.keys(filter).length > 0),
  });

  const createFile = useMutation({
    mutationFn: async (newFile: Omit<File, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'createdBy' | 'updatedBy' | 'deletedBy'>) => {
      const { data, error } = await mutate(async (supabase: SupabaseClient<Database>) => {
        const result = await supabase
          .from('files')
          .insert(decamelizeKeys({ 
            ...newFile, 
            uploadedBy: user?.id,
            createdBy: user?.id 
          }) as NewFile)
          .select();
        return { data: (camelizeKeys(result.data) as File[]) ?? [], error: result.error };
      });
      if (error) throw error;
      return data as File[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });

  const updateFile = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<File> & { id: string }) => {
      const { data, error } = await mutate(async (supabase: SupabaseClient<Database>) => {
        const result = await supabase
          .from('files')
          .update(decamelizeKeys(updates))
          .eq('id', id)
          .select();
        return { data: (camelizeKeys(result.data) as File[]) ?? [], error: result.error };
      });
      if (error) throw error;
      return data as File[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });

  const deleteFile = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await mutate(async (supabase: SupabaseClient<Database>) => {
        const result = await supabase.from('files').delete().eq('id', id).select();
        return { data: (camelizeKeys(result.data) as File[]) ?? [], error: result.error };
      });
      if (error) throw error;
      return data as File[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });

  // Function to get files with filters
  const getFiles = useCallback(async (filters: FileFilter) => {
    if (!filters || Object.keys(filters).length === 0) {
      throw new Error('At least one filter must be provided');
    }

    const { data, error } = await query(async (supabase: SupabaseClient<Database>) => {
      let query = supabase.from('files').select('*');

      if (filters.id) query = query.eq('id', filters.id);

      const result = await query;
      return { data: (camelizeKeys(result.data) as File[]) ?? [], error: result.error };
    });
    if (error) throw error;
    return data as File[];
  }, [query]);

  return {
    data,
    isLoading,
    createFile: createFile.mutateAsync,
    updateFile: updateFile.mutateAsync,
    deleteFile: deleteFile.mutateAsync,
    getFiles,
    getFileUrl,
  };
}