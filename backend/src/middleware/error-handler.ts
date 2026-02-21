import type { ErrorHandler } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { errorResponse } from "../contracts/index.js";

/**
 * Global error handler — ensures every error returns our standard ApiResponse envelope.
 */
export const globalErrorHandler: ErrorHandler = (err, c) => {
  console.error(`[ERROR] ${err.message}`);

  const status: ContentfulStatusCode =
    "status" in err && typeof err.status === "number" && err.status >= 200
      ? (err.status as ContentfulStatusCode)
      : 500;
  const message = err.message || "Internal Server Error";

  return c.json(errorResponse(message), status);
};
