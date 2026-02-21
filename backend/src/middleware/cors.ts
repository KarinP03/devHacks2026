import { cors } from "hono/cors";

/**
 * CORS middleware configured for local development.
 * Allows the React frontend (Vite dev server) to call the API.
 */
export const corsMiddleware = cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
});
