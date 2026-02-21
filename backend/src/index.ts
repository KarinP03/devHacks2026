import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { serve } from "@hono/node-server";
import { env } from "./config/env.js";
import { corsMiddleware } from "./middleware/cors.js";
import { globalErrorHandler } from "./middleware/error-handler.js";
import { movieRoutes } from "./modules/movies/index.js";
import { successResponse } from "./contracts/index.js";

const app = new OpenAPIHono();

// --- Middleware ---
app.use("*", corsMiddleware);
app.onError(globalErrorHandler);

// --- Health check and Redirects ---
app.get("/", (c) => c.redirect("/docs"));

app.get("/api/health", (c) => {
  return c.json(successResponse({ status: "ok", uptime: process.uptime() }));
});

// --- Collection routes ---
// Each collection type mounts its own route group here.
// To add a new collection: import its routes and mount under /api/collections/{type}
app.route("/api/collections/movies", movieRoutes);

// --- OpenAPI spec ---
app.doc("/doc", {
  openapi: "3.1.0",
  info: {
    title: "Collection Manager API",
    version: "0.1.0",
    description:
      "API for managing personal media collections. " +
      "Currently supports movies with OMDB integration.",
  },
  tags: [
    {
      name: "Movies",
      description:
        "Manage your movie collection — search OMDB, add, update, and delete movies.",
    },
  ],
});

// --- Swagger UI ---
app.get("/docs", swaggerUI({ url: "/doc" }));

// --- Start server ---
console.log(`Collection Manager API starting on port ${env.PORT}...`);

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    console.log(`Server running at http://localhost:${info.port}`);
    console.log(
      `Movie routes:  http://localhost:${info.port}/api/collections/movies`,
    );
    console.log(`Swagger UI:    http://localhost:${info.port}/docs`);
    console.log(`OpenAPI spec:  http://localhost:${info.port}/doc`);
    console.log(`Health check:  http://localhost:${info.port}/api/health`);
  },
);
