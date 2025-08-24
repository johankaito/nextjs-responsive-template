import { PostgrestError, AuthError } from '@supabase/supabase-js';

/**
 * Application error types
 */
export enum ErrorType {
  AUTH = 'AUTH',
  PERMISSION = 'PERMISSION',
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  FILE_UPLOAD = 'FILE_UPLOAD',
  DATABASE = 'DATABASE',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Application error severity levels
 */
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

/**
 * Base application error
 */
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly severity: ErrorSeverity;
  public readonly context?: Record<string, unknown>;
  public readonly originalError?: unknown;
  public readonly timestamp: Date;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.ERROR,
    context?: Record<string, unknown>,
    originalError?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.severity = severity;
    this.context = context;
    this.originalError = originalError;
    this.timestamp = new Date();
  }
}

/**
 * Auth-specific error
 */
export class AuthenticationError extends AppError {
  constructor(message: string, originalError?: AuthError) {
    super(message, ErrorType.AUTH, ErrorSeverity.ERROR, undefined, originalError);
    this.name = 'AuthenticationError';
  }
}

/**
 * Permission-specific error
 */
export class PermissionError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, ErrorType.PERMISSION, ErrorSeverity.WARNING, context);
    this.name = 'PermissionError';
  }
}

/**
 * Network-specific error
 */
export class NetworkError extends AppError {
  constructor(message: string, originalError?: Error) {
    super(message, ErrorType.NETWORK, ErrorSeverity.ERROR, undefined, originalError);
    this.name = 'NetworkError';
  }
}

/**
 * Validation-specific error
 */
export class ValidationError extends AppError {
  public readonly fields?: Record<string, string>;

  constructor(message: string, fields?: Record<string, string>) {
    super(message, ErrorType.VALIDATION, ErrorSeverity.WARNING, { fields });
    this.fields = fields;
    this.name = 'ValidationError';
  }
}

/**
 * File upload-specific error
 */
export class FileUploadError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, ErrorType.FILE_UPLOAD, ErrorSeverity.ERROR, context);
    this.name = 'FileUploadError';
  }
}

/**
 * Database-specific error
 */
export class DatabaseError extends AppError {
  constructor(message: string, originalError?: PostgrestError) {
    super(message, ErrorType.DATABASE, ErrorSeverity.ERROR, undefined, originalError);
    this.name = 'DatabaseError';
  }
}

/**
 * Error response type for API responses
 */
export interface ErrorResponse {
  error: {
    message: string;
    type: ErrorType;
    severity: ErrorSeverity;
    timestamp: string;
    context?: Record<string, unknown>;
  };
}

/**
 * Type guards
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function isAuthError(error: unknown): error is AuthError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    'message' in error &&
    '__isAuthError' in error
  );
}

export function isPostgrestError(error: unknown): error is PostgrestError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    ('details' in error || 'hint' in error || 'code' in error)
  );
}