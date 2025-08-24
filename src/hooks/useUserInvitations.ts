import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSupabase } from '@/components/SupabaseContext';
import { Database, UserInvitation, NewUserInvitation, UserType, InvitationStatus } from '@/types/drizzle';
import { camelizeKeys, decamelizeKeys } from 'humps';
import { SupabaseClient } from '@supabase/supabase-js';
import { useUser } from '@/components/UserContext';

export function useUserInvitations() {
  const { query, mutate } = useSupabase();
  const { tofilUser } = useUser();
  const queryClient = useQueryClient();

  // Fetch all invitations (admin/owner only)
  const { data: invitations, isLoading } = useQuery({
    queryKey: ['user-invitations'],
    queryFn: async () => {
      const { data, error } = await query(async (supabase: SupabaseClient<Database>) => {
        const result = await supabase
          .from('user_invitations')
          .select(`
            *,
            invitedByUser:users!user_invitations_invited_by_users_id_fk(id, name, email)
          `)
          .order('created_at', { ascending: false });
        
        return { 
          data: result.data ? camelizeKeys(result.data) as UserInvitation[] : [], 
          error: result.error 
        };
      });
      
      if (error) throw error;
      return data;
    },
    enabled: !!tofilUser && ['ADMIN', 'OWNER'].includes(tofilUser.type),
  });

  // Create new invitation
  const createInvitation = useMutation({
    mutationFn: async ({ email, name, userType }: { email: string; name: string; userType: UserType }) => {
      if (!tofilUser) throw new Error('User not authenticated');

      // Generate secure token
      const token = crypto.randomUUID() + '-' + Date.now().toString(36);
      
      // Set expiration to 48 hours from now
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 48);

      const invitationData: NewUserInvitation = {
        email,
        name,
        userType,
        invitedBy: tofilUser.id,
        token,
        expiresAt,
        status: 'pending',
      };

      const { data, error } = await mutate(async (supabase: SupabaseClient<Database>) => {
        const result = await supabase
          .from('user_invitations')
          .insert(decamelizeKeys(invitationData) as NewUserInvitation)
          .select()
          .single();
        
        return { 
          data: result.data ? camelizeKeys(result.data) as UserInvitation : null, 
          error: result.error 
        };
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-invitations'] });
    },
  });

  // Update invitation status
  const updateInvitationStatus = useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      completedAt 
    }: { 
      id: string; 
      status: InvitationStatus; 
      completedAt?: string 
    }) => {
      const updates = {
        status,
        updatedAt: new Date(),
        ...(completedAt && { completedAt: new Date(completedAt) }),
      };

      const { data, error } = await mutate(async (supabase: SupabaseClient<Database>) => {
        const result = await supabase
          .from('user_invitations')
          .update(decamelizeKeys(updates))
          .eq('id', id)
          .select()
          .single();
        
        return { 
          data: result.data ? camelizeKeys(result.data) as UserInvitation : null, 
          error: result.error 
        };
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-invitations'] });
    },
  });

  // Resend invitation
  const resendInvitation = useMutation({
    mutationFn: async (invitationId: string) => {
      if (!tofilUser) throw new Error('User not authenticated');

      // Generate new token and extend expiration
      const token = crypto.randomUUID() + '-' + Date.now().toString(36);
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 48);

      const updates = {
        token,
        expiresAt,
        status: 'pending' as InvitationStatus,
        updatedAt: new Date(),
      };

      const { data, error } = await mutate(async (supabase: SupabaseClient<Database>) => {
        const result = await supabase
          .from('user_invitations')
          .update(decamelizeKeys(updates))
          .eq('id', invitationId)
          .select()
          .single();
        
        return { 
          data: result.data ? camelizeKeys(result.data) as UserInvitation : null, 
          error: result.error 
        };
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-invitations'] });
    },
  });

  // Revoke invitation
  const revokeInvitation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { data, error } = await mutate(async (supabase: SupabaseClient<Database>) => {
        const result = await supabase
          .from('user_invitations')
          .update(decamelizeKeys({
            status: 'revoked',
            updatedAt: new Date(),
          }))
          .eq('id', invitationId)
          .select()
          .single();
        
        return { 
          data: result.data ? camelizeKeys(result.data) as UserInvitation : null, 
          error: result.error 
        };
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-invitations'] });
    },
  });

  // Get invitation by token (for password setup)
  const getInvitationByToken = async (token: string): Promise<UserInvitation | null> => {
    const { data, error } = await query(async (supabase: SupabaseClient<Database>) => {
      const result = await supabase
        .from('user_invitations')
        .select('*')
        .eq('token', token)
        .eq('status', 'pending')
        .gt('expires_at', new Date())
        .single();
      
      return { 
        data: result.data ? camelizeKeys(result.data) as UserInvitation : null, 
        error: result.error 
      };
    });
    
    if (error) return null;
    return data;
  };

  return {
    invitations,
    isLoading,
    createInvitation,
    updateInvitationStatus,
    resendInvitation,
    revokeInvitation,
    getInvitationByToken,
    isCreating: createInvitation.isPending,
    isUpdating: updateInvitationStatus.isPending,
    isResending: resendInvitation.isPending,
    isRevoking: revokeInvitation.isPending,
  };
}