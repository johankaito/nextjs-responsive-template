import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSupabase } from '@/components/SupabaseContext';
import { JobFile, Database } from '@/types/drizzle';
import { camelizeKeys, decamelizeKeys } from 'humps';
import { SupabaseClient } from '@supabase/supabase-js';
import { useCallback } from 'react';
import { validateFile } from '@/config/fileRestrictions';

const BUCKET = 'job-files';
export function useJobFiles() {
  const { mutate, client } = useSupabase<JobFile[]>();
  const queryClient = useQueryClient();

  const uploadFile = useCallback(async ({file, name}: {file: globalThis.File, name: string}) => {
    // Validate file before uploading
    const validationError = validateFile(file);
    if (validationError) {
      throw new Error(validationError);
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${name}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error } = await client.storage
      .from(BUCKET)
      .upload(filePath, file);

    if (error) throw error;
    return { storagePath: filePath, fileName, bucket: BUCKET, type: file.type, size: file.size };
  }, [client]);

  const createJobFile = useMutation({
    mutationFn: async (newJobFile: { jobId: string; fileId: string; createdBy: string }) => {
      const { data, error } = await mutate(async (supabase: SupabaseClient<Database>) => {
        const result = await supabase
          .from('job_files')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .insert(decamelizeKeys({ ...newJobFile }) as any)
          .select();
        return { data: (camelizeKeys(result.data) as JobFile[]) ?? [], error: result.error };
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });

  const deleteJobFile = useMutation({
    mutationFn: async ({ jobId, fileId }: { jobId: string; fileId: string }) => {
      const { data, error } = await mutate(async (supabase: SupabaseClient<Database>) => {
        const result = await supabase
          .from('job_files')
          .delete()
          .match(decamelizeKeys({ jobId, fileId }))
          .select();
        return { data: (camelizeKeys(result.data) as JobFile[]) ?? [], error: result.error };
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });

  return {
    createJobFile: createJobFile.mutateAsync,
    deleteJobFile: deleteJobFile.mutateAsync,
    uploadFile,
  };
} 