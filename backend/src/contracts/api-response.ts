/**
 * Unified API response envelope.
 * Every endpoint returns this shape so the frontend can handle responses uniformly.
 */
export type ApiResponse<T> =
  | {
      success: true;
      data: T;
      error?: undefined;
      meta?: { total?: number; page?: number; timestamp: string };
    }
  | {
      success: false;
      data: null;
      error: string;
      meta?: { total?: number; page?: number; timestamp: string };
    };

/** Helper to create a success response */
export function successResponse<T>(
  data: T,
  meta?: { total?: number; page?: number },
) {
  return {
    success: true as const,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };
}

/** Helper to create an error response */
export function errorResponse(
  error: string,
  meta?: { total?: number; page?: number },
) {
  return {
    success: false as const,
    data: null,
    error,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };
}
