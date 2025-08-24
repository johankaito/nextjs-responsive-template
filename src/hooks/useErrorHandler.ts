import { useCallback, useState } from 'react';
import { useToast } from '@/components/ui/useToast';
import { transformError, handleError } from '@/lib/error-handling';
import { 
  AppError, 
  ErrorType, 
  AuthenticationError,
  PermissionError,
  NetworkError,
  ValidationError,
  FileUploadError,
  DatabaseError
} from '@/types/errors';
import { useRouter } from 'next/navigation';

interface UseErrorHandlerOptions {
  /**
   * Whether to show toast notifications for errors
   */
  showToast?: boolean;
  /**
   * Whether to log errors to console
   */
  logErrors?: boolean;
  /**
   * Custom error handler function
   */
  onError?: (error: AppError) => void;
  /**
   * Whether to redirect on auth errors
   */
  redirectOnAuthError?: boolean;
}

/**
 * Hook for consistent error handling across the application
 * 
 * Provides utilities for handling errors with automatic transformation,
 * toast notifications, logging, and navigation based on error types.
 * 
 * @param options - Configuration options for error handling
 * @param options.showToast - Whether to show toast notifications (default: true)
 * @param options.logErrors - Whether to log errors to console (default: true)
 * @param options.onError - Custom error handler function
 * @param options.redirectOnAuthError - Whether to redirect to login on auth errors (default: true)
 * 
 * @returns {Object} Error handling utilities
 * @returns {Function} handle - Main error handler function
 * @returns {AppError|null} lastError - The last error that was handled
 * @returns {boolean} isError - Whether an error has occurred
 * @returns {Function} clearError - Clear the current error state
 * @returns {Function} createHandlers - Create wrapped handlers for async operations
 * 
 * @example
 * ```typescript
 * // Basic usage
 * const { handle, lastError, isError } = useErrorHandler();
 * 
 * try {
 *   await someOperation();
 * } catch (error) {
 *   handle(error, 'someOperation');
 * }
 * ```
 * 
 * @example
 * ```typescript
 * // With custom options
 * const { handle } = useErrorHandler({
 *   showToast: false,
 *   onError: (error) => {
 *     sendErrorToAnalytics(error);
 *   }
 * });
 * ```
 * 
 * @example
 * ```typescript
 * // Using createHandlers for async operations
 * const { createHandlers } = useErrorHandler();
 * 
 * const handlers = createHandlers(async () => {
 *   const data = await fetchData();
 *   return processData(data);
 * });
 * 
 * // Execute with error handling
 * const result = await handlers.execute(); // Throws on error
 * const [result, error] = await handlers.executeQuietly(); // Returns error
 * ```
 */
export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const {
    showToast = true,
    logErrors = true,
    onError,
    redirectOnAuthError = true,
  } = options;

  const { toast } = useToast();
  const router = useRouter();
  const [lastError, setLastError] = useState<AppError | null>(null);
  const [isError, setIsError] = useState(false);

  /**
   * Handle an error with consistent behavior
   */
  const handle = useCallback(
    (error: unknown, context?: string): AppError => {
      const appError = transformError(error, context);
      
      setLastError(appError);
      setIsError(true);

      // Log error if enabled
      if (logErrors) {
        handleError(error, context);
      }

      // Handle specific error types
      switch (appError.type) {
        case ErrorType.AUTH:
          if (redirectOnAuthError) {
            router.push('/login');
          }
          break;

        case ErrorType.PERMISSION:
          if (showToast) {
            toast({
              title: "Access Denied",
              description: appError.message,
              variant: "destructive",
            });
          }
          break;

        case ErrorType.NETWORK:
          if (showToast) {
            toast({
              title: "Connection Error",
              description: appError.message,
              variant: "destructive",
            });
          }
          break;

        case ErrorType.VALIDATION:
          if (showToast) {
            toast({
              title: "Validation Error",
              description: appError.message,
              variant: "destructive",
            });
          }
          break;

        case ErrorType.FILE_UPLOAD:
          if (showToast) {
            toast({
              title: "Upload Error",
              description: appError.message,
              variant: "destructive",
            });
          }
          break;

        case ErrorType.DATABASE:
          if (showToast) {
            toast({
              title: "Database Error",
              description: appError.message,
              variant: "destructive",
            });
          }
          break;

        default:
          if (showToast) {
            toast({
              title: "Error",
              description: appError.message,
              variant: "destructive",
            });
          }
      }

      // Call custom error handler if provided
      if (onError) {
        onError(appError);
      }

      return appError;
    },
    [showToast, logErrors, onError, redirectOnAuthError, toast, router]
  );

  /**
   * Clear the last error
   */
  const clearError = useCallback(() => {
    setLastError(null);
    setIsError(false);
  }, []);

  /**
   * Create error handlers for async operations
   */
  const createHandlers = useCallback(
    <T,>(
      operation: () => Promise<T>,
      options?: {
        context?: string;
        onSuccess?: (result: T) => void;
        onError?: (error: AppError) => void;
      }
    ) => {
      return {
        execute: async () => {
          clearError();
          try {
            const result = await operation();
            options?.onSuccess?.(result);
            return result;
          } catch (error) {
            const appError = handle(error, options?.context);
            options?.onError?.(appError);
            throw appError;
          }
        },
        executeQuietly: async () => {
          clearError();
          try {
            return await operation();
          } catch (error) {
            const appError = transformError(error, options?.context);
            setLastError(appError);
            setIsError(true);
            options?.onError?.(appError);
            return null;
          }
        },
      };
    },
    [handle, clearError]
  );

  return {
    /**
     * Handle an error
     */
    handle,
    /**
     * Clear the last error
     */
    clearError,
    /**
     * The last error that occurred
     */
    lastError,
    /**
     * Whether an error is present
     */
    isError,
    /**
     * Create error handlers for async operations
     */
    createHandlers,
    /**
     * Type-specific error checkers
     */
    isAuthError: lastError instanceof AuthenticationError,
    isPermissionError: lastError instanceof PermissionError,
    isNetworkError: lastError instanceof NetworkError,
    isValidationError: lastError instanceof ValidationError,
    isFileUploadError: lastError instanceof FileUploadError,
    isDatabaseError: lastError instanceof DatabaseError,
  };
}