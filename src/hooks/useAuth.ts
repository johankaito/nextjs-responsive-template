import { useUser } from '@/components/UserContext';
import { useRouter } from 'next/navigation';
import { useEffect, useCallback, useState } from 'react';
import { useSupabase } from '@/components/SupabaseContext';
import { AuthError } from '@supabase/supabase-js';
import { transformError } from '@/lib/error-handling';
import { getBaseUrl } from '@/lib/utils';


type UserRole = 'ADMIN' | 'OWNER' | 'MANAGER' | 'CONTRACTOR';

interface UseAuthOptions {
  requiredRole?: UserRole;
  redirectTo?: string;
}

interface AuthState {
  isLoading: boolean;
  error: AuthError | null;
}

export function useAuth(options: UseAuthOptions = {}) {
  const { requiredRole, redirectTo = '/login' } = options;
  const { tofilUser, isLoading: userLoading, signOut, supabaseUser } = useUser();
  const { client: supabase } = useSupabase();
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    isLoading: false,
    error: null,
  });

  // Optional: role-based redirect
  useEffect(() => {
    if (!userLoading && requiredRole && tofilUser && tofilUser.type !== requiredRole) {
      router.push('/not-authorized');
    }
    if (!userLoading && requiredRole && !tofilUser) {
      router.push(redirectTo);
    }
  }, [userLoading, requiredRole, tofilUser, redirectTo, router]);

  // Sign in with email and password
  const signInWithPassword = useCallback(async (email: string, password: string) => {
    setAuthState({ isLoading: true, error: null });
    try {
      const result = await supabase.auth.signInWithPassword({ email, password });
      if (result.error) {
        setAuthState({ isLoading: false, error: result.error });
      } else {
        setAuthState({ isLoading: false, error: null });
      }
      return result;
    } catch (error) {
      const appError = transformError(error, 'signInWithPassword');
      const authError = appError.originalError as AuthError || error as AuthError;
      setAuthState({ isLoading: false, error: authError });
      return { data: { user: null, session: null }, error: authError };
    }
  }, [supabase]);

  // Sign in with OTP (One-Time Password)
  const signInWithOtp = useCallback(async (email: string) => {
    setAuthState({ isLoading: true, error: null });
    try {
      const result = await supabase.auth.signInWithOtp({ 
        email,
        options: {
          emailRedirectTo: `${getBaseUrl()}/login`,
        }
      });
      if (result.error) {
        setAuthState({ isLoading: false, error: result.error });
      } else {
        setAuthState({ isLoading: false, error: null });
      }
      return result;
    } catch (error) {
      const appError = transformError(error, 'signInWithOtp');
      const authError = appError.originalError as AuthError || error as AuthError;
      setAuthState({ isLoading: false, error: authError });
      return { data: null, error: authError };
    }
  }, [supabase]);

  // Verify OTP
  const verifyOtp = useCallback(async (email: string, token: string) => {
    setAuthState({ isLoading: true, error: null });
    try {
      const result = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
      });
      if (result.error) {
        setAuthState({ isLoading: false, error: result.error });
      } else {
        setAuthState({ isLoading: false, error: null });
      }
      return result;
    } catch (error) {
      const appError = transformError(error, 'verifyOtp');
      const authError = appError.originalError as AuthError || error as AuthError;
      setAuthState({ isLoading: false, error: authError });
      return { data: { user: null, session: null }, error: authError };
    }
  }, [supabase]);

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    setAuthState({ isLoading: true, error: null });
    try {
      const result = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${getBaseUrl()}/reset-password`,
        // Add captchaToken if CAPTCHA is enabled (will be undefined if not needed)
        captchaToken: undefined,
      });
      if (result.error) {
        setAuthState({ isLoading: false, error: result.error });
      } else {
        setAuthState({ isLoading: false, error: null });
      }
      return result;
    } catch (error) {
      const appError = transformError(error, 'resetPassword');
      const authError = appError.originalError as AuthError || error as AuthError;
      setAuthState({ isLoading: false, error: authError });
      return { data: null, error: authError };
    }
  }, [supabase]);

  // Update password
  const updatePassword = useCallback(async (newPassword: string) => {
    setAuthState({ isLoading: true, error: null });
    try {
      const result = await supabase.auth.updateUser({ password: newPassword });
      if (result.error) {
        setAuthState({ isLoading: false, error: result.error });
      } else {
        setAuthState({ isLoading: false, error: null });
      }
      return result;
    } catch (error) {
      const appError = transformError(error, 'updatePassword');
      const authError = appError.originalError as AuthError || error as AuthError;
      setAuthState({ isLoading: false, error: authError });
      return { data: { user: null }, error: authError };
    }
  }, [supabase]);

  // Refresh session
  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        const appError = transformError(error, 'refreshSession');
        console.error('Session refresh failed:', appError);
        return { data: null, error };
      }
      return { data, error: null };
    } catch (error) {
      const appError = transformError(error, 'refreshSession');
      console.error('Session refresh failed:', appError);
      return { data: null, error: error as AuthError };
    }
  }, [supabase]);

  // Get current session
  const getSession = useCallback(async () => {
    const { data, error } = await supabase.auth.getSession();
    return { data: data.session, error };
  }, [supabase]);

  // Clear any auth errors
  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    // User state
    user: tofilUser,
    supabaseUser,
    isLoading: userLoading || authState.isLoading,
    error: authState.error,
    
    // Auth methods
    signInWithPassword,
    signInWithOtp,
    verifyOtp,
    signOut,
    resetPassword,
    updatePassword,
    
    // Session management
    refreshSession,
    getSession,
    
    // Utility
    clearError,
  };
} 