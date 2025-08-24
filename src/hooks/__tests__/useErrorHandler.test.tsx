/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useErrorHandler } from '../useErrorHandler';
import { useToast } from '@/components/ui/useToast';
import { useRouter } from 'next/navigation';
import { 
  AuthenticationError, 
  PermissionError, 
  NetworkError,
  ValidationError,
  FileUploadError,
  DatabaseError,
  ErrorType
} from '@/types/errors';

// Mock dependencies
vi.mock('@/components/ui/useToast');
vi.mock('next/navigation');

describe('useErrorHandler', () => {
  let mockToast: Mock;
  let mockPush: Mock;

  beforeEach(() => {
    mockToast = vi.fn();
    mockPush = vi.fn();

    (useToast as any).mockReturnValue({ toast: mockToast });
    (useRouter as any).mockReturnValue({ push: mockPush });

    vi.clearAllMocks();
  });

  it('should handle generic errors', () => {
    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.handle(new Error('Test error'));
    });

    expect(result.current.isError).toBe(true);
    expect(result.current.lastError).toBeDefined();
    expect(result.current.lastError?.message).toBe('Test error');
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Error',
      description: 'Test error',
      variant: 'destructive',
    });
  });

  it('should handle authentication errors', () => {
    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.handle(new AuthenticationError('Invalid credentials'));
    });

    expect(result.current.isAuthError).toBe(true);
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('should handle permission errors', () => {
    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.handle(new PermissionError('Access denied'));
    });

    expect(result.current.isPermissionError).toBe(true);
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Access Denied',
      description: 'Access denied',
      variant: 'destructive',
    });
  });

  it('should handle network errors', () => {
    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.handle(new NetworkError('Connection failed'));
    });

    expect(result.current.isNetworkError).toBe(true);
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Connection Error',
      description: 'Connection failed',
      variant: 'destructive',
    });
  });

  it('should handle validation errors', () => {
    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.handle(new ValidationError('Invalid input'));
    });

    expect(result.current.isValidationError).toBe(true);
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Validation Error',
      description: 'Invalid input',
      variant: 'destructive',
    });
  });

  it('should handle file upload errors', () => {
    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.handle(new FileUploadError('File too large'));
    });

    expect(result.current.isFileUploadError).toBe(true);
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Upload Error',
      description: 'File too large',
      variant: 'destructive',
    });
  });

  it('should handle database errors', () => {
    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.handle(new DatabaseError('Query failed'));
    });

    expect(result.current.isDatabaseError).toBe(true);
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Database Error',
      description: 'Query failed',
      variant: 'destructive',
    });
  });

  it('should clear errors', () => {
    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.handle(new Error('Test error'));
    });

    expect(result.current.isError).toBe(true);

    act(() => {
      result.current.clearError();
    });

    expect(result.current.isError).toBe(false);
    expect(result.current.lastError).toBe(null);
  });

  it('should not show toast when disabled', () => {
    const { result } = renderHook(() => 
      useErrorHandler({ showToast: false })
    );

    act(() => {
      result.current.handle(new Error('Test error'));
    });

    expect(mockToast).not.toHaveBeenCalled();
  });

  it('should not redirect on auth error when disabled', () => {
    const { result } = renderHook(() => 
      useErrorHandler({ redirectOnAuthError: false })
    );

    act(() => {
      result.current.handle(new AuthenticationError('Invalid credentials'));
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should call custom error handler', () => {
    const onError = vi.fn();
    const { result } = renderHook(() => 
      useErrorHandler({ onError })
    );

    act(() => {
      result.current.handle(new Error('Test error'));
    });

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Test error',
        type: ErrorType.UNKNOWN,
      })
    );
  });

  describe('createHandlers', () => {
    it('should execute operation successfully', async () => {
      const { result } = renderHook(() => useErrorHandler());
      const mockOperation = vi.fn().mockResolvedValue('success');
      const onSuccess = vi.fn();

      const handlers = result.current.createHandlers(mockOperation, {
        onSuccess,
      });

      const response = await handlers.execute();

      expect(response).toBe('success');
      expect(onSuccess).toHaveBeenCalledWith('success');
      expect(result.current.isError).toBe(false);
    });

    it('should handle operation errors', async () => {
      const { result, rerender } = renderHook(() => useErrorHandler());
      const mockOperation = vi.fn().mockRejectedValue(new Error('Failed'));
      const onError = vi.fn();

      const handlers = result.current.createHandlers(mockOperation, {
        context: 'test operation',
        onError,
      });

      await expect(handlers.execute()).rejects.toThrow();
      
      // Force a rerender to update the hook state
      rerender();

      expect(result.current.isError).toBe(true);
      expect(result.current.lastError?.message).toBe('Failed');
      expect(onError).toHaveBeenCalled();
    });

    it('should execute quietly and return null on error', async () => {
      const { result, rerender } = renderHook(() => useErrorHandler());
      const mockOperation = vi.fn().mockRejectedValue(new Error('Failed'));

      const handlers = result.current.createHandlers(mockOperation);
      const response = await handlers.executeQuietly();
      
      // Force a rerender to update the hook state
      rerender();

      expect(response).toBe(null);
      expect(result.current.isError).toBe(true);
      expect(mockToast).not.toHaveBeenCalled(); // No toast in quiet mode
    });
  });
});