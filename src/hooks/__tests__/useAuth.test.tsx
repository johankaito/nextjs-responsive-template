import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from '../useAuth';
import { useRouter } from 'next/navigation';

// Mock dependencies
vi.mock('@/components/UserContext', () => ({
  useUser: vi.fn(),
}));

vi.mock('@/components/SupabaseContext', () => ({
  useSupabase: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

describe('useAuth', () => {
  let mockRouter: { push: Mock };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockSupabaseClient: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockUserContext: any;

  beforeEach(async () => {
    mockRouter = { push: vi.fn() };
    (useRouter as Mock).mockReturnValue(mockRouter);

    mockSupabaseClient = {
      auth: {
        signInWithPassword: vi.fn(),
        signInWithOtp: vi.fn(),
        verifyOtp: vi.fn(),
        resetPasswordForEmail: vi.fn(),
        updateUser: vi.fn(),
        refreshSession: vi.fn(),
        getSession: vi.fn(),
      },
    };

    mockUserContext = {
      tofilUser: null,
      supabaseUser: null,
      isLoading: false,
      signOut: vi.fn(),
      setUser: vi.fn(),
    };

    const { useSupabase } = await import('@/components/SupabaseContext');
    (useSupabase as Mock).mockReturnValue({ client: mockSupabaseClient });

    const { useUser } = await import('@/components/UserContext');
    (useUser as Mock).mockReturnValue(mockUserContext);
  });

  describe('Authentication State', () => {
    it('should return initial state correctly', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.user).toBe(null);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should reflect loading state from user context', () => {
      mockUserContext.isLoading = true;
      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(true);
    });

    it('should return user when available', () => {
      const mockUser = { id: '1', name: 'Test User', type: 'OWNER' };
      mockUserContext.tofilUser = mockUser;
      const { result } = renderHook(() => useAuth());

      expect(result.current.user).toEqual(mockUser);
    });
  });

  describe('Role-based Redirects', () => {
    it('should redirect to not-authorized if user role does not match', () => {
      mockUserContext.tofilUser = { id: '1', type: 'CONTRACTOR' };
      renderHook(() => useAuth({ requiredRole: 'OWNER' }));

      expect(mockRouter.push).toHaveBeenCalledWith('/not-authorized');
    });

    it('should redirect to login if no user and role is required', () => {
      mockUserContext.tofilUser = null;
      renderHook(() => useAuth({ requiredRole: 'OWNER' }));

      expect(mockRouter.push).toHaveBeenCalledWith('/login');
    });

    it('should allow custom redirect path', () => {
      mockUserContext.tofilUser = null;
      renderHook(() => useAuth({ requiredRole: 'OWNER', redirectTo: '/custom-login' }));

      expect(mockRouter.push).toHaveBeenCalledWith('/custom-login');
    });

    it('should not redirect if user has correct role', () => {
      mockUserContext.tofilUser = { id: '1', type: 'OWNER' };
      renderHook(() => useAuth({ requiredRole: 'OWNER' }));

      expect(mockRouter.push).not.toHaveBeenCalled();
    });
  });

  describe('Sign In Methods', () => {
    it('should handle successful password sign in', async () => {
      const mockResponse = {
        data: { user: { id: '1' }, session: { access_token: 'token' } },
        error: null,
      };
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuth());

      let response;
      await act(async () => {
        response = await result.current.signInWithPassword('test@example.com', 'password');
      });

      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      });
      expect(response).toEqual(mockResponse);
      expect(result.current.error).toBe(null);
    });

    it('should handle failed password sign in', async () => {
      const mockError = { message: 'Invalid credentials', status: 401 };
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signInWithPassword('test@example.com', 'wrong');
      });

      expect(result.current.error).toEqual(mockError);
    });

    it('should handle OTP sign in', async () => {
      const mockResponse = { data: {}, error: null };
      mockSupabaseClient.auth.signInWithOtp.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signInWithOtp('test@example.com');
      });

      expect(mockSupabaseClient.auth.signInWithOtp).toHaveBeenCalledWith({
        email: 'test@example.com',
        options: {
          emailRedirectTo: expect.stringContaining('/login'),
        },
      });
    });

    it('should handle OTP verification', async () => {
      const mockResponse = {
        data: { user: { id: '1' }, session: { access_token: 'token' } },
        error: null,
      };
      mockSupabaseClient.auth.verifyOtp.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.verifyOtp('test@example.com', '123456');
      });

      expect(mockSupabaseClient.auth.verifyOtp).toHaveBeenCalledWith({
        email: 'test@example.com',
        token: '123456',
        type: 'email',
      });
    });
  });

  describe('Password Management', () => {
    it('should handle password reset request', async () => {
      const mockResponse = { data: {}, error: null };
      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.resetPassword('test@example.com');
      });

      expect(mockSupabaseClient.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        {
          redirectTo: 'http://localhost:3000/reset-password',
          captchaToken: undefined,
        }
      );
    });

    it('should handle password update', async () => {
      const mockResponse = { data: { user: { id: '1' } }, error: null };
      mockSupabaseClient.auth.updateUser.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.updatePassword('newPassword123');
      });

      expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith({
        password: 'newPassword123',
      });
    });
  });

  describe('Session Management', () => {
    it('should refresh session', async () => {
      const mockSession = { access_token: 'new_token' };
      mockSupabaseClient.auth.refreshSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      let response: { data: { session: unknown } | null; error: unknown | null } | undefined;
      await act(async () => {
        response = await result.current.refreshSession();
      });

      expect(response?.data).toEqual({ session: mockSession });
    });

    it('should get current session', async () => {
      const mockSession = { access_token: 'current_token' };
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      let response: { data: unknown | null; error: unknown | null } | undefined;
      await act(async () => {
        response = await result.current.getSession();
      });

      expect(response?.data).toEqual(mockSession);
    });
  });

  describe('Error Handling', () => {
    it('should clear errors', async () => {
      // First create an error
      const mockError = { message: 'Test error', status: 400 };
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signInWithPassword('test@example.com', 'password');
      });

      expect(result.current.error).toEqual(mockError);

      // Now clear it
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBe(null);
    });

    it('should handle loading states correctly', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(false);

      act(() => {
        result.current.signInWithPassword('test@example.com', 'password');
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });
});