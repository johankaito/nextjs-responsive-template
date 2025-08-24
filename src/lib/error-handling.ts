import { PostgrestError } from "@supabase/supabase-js";
import {
  AppError,
  AuthenticationError,
  DatabaseError,
  FileUploadError,
  NetworkError,
  PermissionError,
  ValidationError,
  ErrorType,
  isPostgrestError as isPostgrestErrorType,
  isAuthError,
} from "@/types/errors";

// Map of technical error messages to user-friendly messages
const errorMessageMap: Record<string, string> = {
  // Auth errors
  "Invalid login credentials": "Invalid email or password. Please try again.",
  "Email not confirmed": "Please verify your email before logging in.",
  "User already registered": "An account with this email already exists.",
  
  // Permission errors
  "new row violates row-level security policy": "You don't have permission to perform this action.",
  "permission denied": "Access denied. You don't have the required permissions.",
  
  // File upload errors
  "Payload too large": "File size exceeds the maximum limit of 10MB.",
  "Invalid file type": "This file type is not allowed.",
  "File size exceeds": "The file is too large. Please upload a smaller file.",
  "File type": "This file type is not supported. Please check the allowed file types.",
  "storage/unauthorized": "You don't have permission to upload files to this location.",
  "storage/object-not-found": "The requested file could not be found.",
  "storage/quota-exceeded": "Storage quota exceeded. Please contact support.",
  
  // Database errors
  "duplicate key value": "This item already exists.",
  "foreign key violation": "Cannot delete this item as it's being used elsewhere.",
  "not-null constraint": "Please fill in all required fields.",
  
  // Network errors
  "Failed to fetch": "Network error. Please check your connection.",
  "NetworkError": "Unable to connect. Please check your internet connection.",
  
  // Generic errors
  "Internal Server Error": "Something went wrong. Please try again later.",
};

/**
 * Get a user-friendly error message
 */
export function getUserFriendlyError(error: unknown): string {
  if (!error) return "An unexpected error occurred.";
  
  // Handle PostgrestError
  if (isPostgrestError(error)) {
    const message = error.message || error.details || "";
    
    // Check for exact matches
    if (errorMessageMap[message]) {
      return errorMessageMap[message];
    }
    
    // Check for partial matches
    for (const [key, value] of Object.entries(errorMessageMap)) {
      if (message.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }
    
    // Return original message if no mapping found
    return message || "Database error occurred.";
  }
  
  // Handle standard Error
  if (error instanceof Error) {
    const message = error.message;
    
    // Check for exact matches
    if (errorMessageMap[message]) {
      return errorMessageMap[message];
    }
    
    // Check for partial matches
    for (const [key, value] of Object.entries(errorMessageMap)) {
      if (message.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }
    
    return message;
  }
  
  // Handle string errors
  if (typeof error === "string") {
    return errorMessageMap[error] || error;
  }
  
  return "An unexpected error occurred.";
}

/**
 * Type guard for PostgrestError
 */
export function isPostgrestError(error: unknown): error is PostgrestError {
  return isPostgrestErrorType(error);
}

/**
 * Transform any error into an AppError
 */
export function transformError(error: unknown, context?: string): AppError {
  // Already an AppError
  if (error instanceof AppError) {
    return error;
  }

  // Auth error
  if (isAuthError(error)) {
    const message = getUserFriendlyError(error);
    return new AuthenticationError(message, error);
  }

  // Database error
  if (isPostgrestError(error)) {
    const message = getUserFriendlyError(error);
    
    // Check for permission errors
    if (
      error.message?.includes("row-level security") ||
      error.message?.includes("permission denied")
    ) {
      return new PermissionError(message, { context });
    }
    
    // Check for validation errors
    if (
      error.message?.includes("not-null constraint") ||
      error.message?.includes("check constraint")
    ) {
      return new ValidationError(message);
    }
    
    return new DatabaseError(message, error);
  }

  // Network error
  if (
    error instanceof Error &&
    (error.message.includes("Failed to fetch") ||
      error.message.includes("NetworkError") ||
      error.message.includes("ERR_NETWORK"))
  ) {
    return new NetworkError(getUserFriendlyError(error), error);
  }

  // File upload error
  if (
    error instanceof Error &&
    (error.message.includes("storage/") ||
      error.message.includes("File size") ||
      error.message.includes("File type"))
  ) {
    return new FileUploadError(getUserFriendlyError(error), { context });
  }

  // Generic error
  if (error instanceof Error) {
    return new AppError(
      getUserFriendlyError(error),
      ErrorType.UNKNOWN,
      undefined,
      { context },
      error
    );
  }

  // String error
  if (typeof error === "string") {
    return new AppError(error, ErrorType.UNKNOWN, undefined, { context });
  }

  // Unknown error
  return new AppError(
    "An unexpected error occurred",
    ErrorType.UNKNOWN,
    undefined,
    { context, error }
  );
}

/**
 * Log error for debugging while showing user-friendly message
 */
export function handleError(error: unknown, context?: string): string {
  const appError = transformError(error, context);
  
  // Log the actual error for debugging
  console.error(`${appError.name}${context ? ` in ${context}` : ""}:`, {
    message: appError.message,
    type: appError.type,
    severity: appError.severity,
    context: appError.context,
    originalError: appError.originalError,
    timestamp: appError.timestamp,
  });
  
  // Return user-friendly message
  return appError.message;
} 