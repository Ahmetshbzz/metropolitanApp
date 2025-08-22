export interface StructuredError extends Error {
  key?: string;
  params?: Record<string, unknown>;
  code?: string;
}

export interface APIErrorPayload {
  key?: string;
  params?: Record<string, unknown>;
  message?: string;
}

export interface APIError {
  response?: {
    data?: APIErrorPayload;
    status?: number;
  };
  message: string;
  code?: string;
}

export function isAPIError(error: unknown): error is APIError {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as APIError).message === "string"
  );
}

export function isStructuredError(error: unknown): error is StructuredError {
  return (
    error instanceof Error &&
    ("key" in error || "code" in error || "params" in error)
  );
}

export enum ErrorCode {
  AUTH_INVALID_CREDENTIALS = "AUTH_INVALID_CREDENTIALS",
  AUTH_TOKEN_EXPIRED = "AUTH_TOKEN_EXPIRED",
  AUTH_UNAUTHORIZED = "AUTH_UNAUTHORIZED",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_INPUT = "INVALID_INPUT",
  INSUFFICIENT_STOCK = "INSUFFICIENT_STOCK",
  ORDER_NOT_FOUND = "ORDER_NOT_FOUND",
  PAYMENT_FAILED = "PAYMENT_FAILED",
  NETWORK_ERROR = "NETWORK_ERROR",
  TIMEOUT = "TIMEOUT",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
}


