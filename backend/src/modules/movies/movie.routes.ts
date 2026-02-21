import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { successResponse, errorResponse } from "../../contracts/index.js";
import { MovieRepository } from "./movie.repository.js";
import { MovieService } from "./movie.service.js";
import { OmdbClient } from "./omdb.client.js";
import {
  addMovieSchema,
  manualAddSchema,
  updateMovieSchema,
  querySchema,
  idParamSchema,
  movieResponseSchema,
  movieListResponseSchema,
  omdbSearchResponseSchema,
  errorResponseSchema,
  deleteResponseSchema,
} from "./movie.schemas.js";

const movieRoutes = new OpenAPIHono();

// Instantiate per-module dependency chain
const repo = new MovieRepository();
const omdb = new OmdbClient();
const service = new MovieService(repo, omdb);

// ─── GET / — List all movies ────────────────────────────────────

const listRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Movies"],
  summary: "List all movies",
  description:
    "Returns every movie in your collection. Use this to populate the main gallery view.",
  responses: {
    200: {
      content: { "application/json": { schema: movieListResponseSchema } },
      description: "Movie list",
    },
  },
});

movieRoutes.openapi(listRoute, async (c) => {
  const movies = await service.getAll();
  return c.json(successResponse(movies, { total: movies.length }), 200);
});

// ─── GET /search — Search local collection ──────────────────────

const searchRoute = createRoute({
  method: "get",
  path: "/search",
  tags: ["Movies"],
  summary: "Search your collection",
  description:
    "Search movies already in your collection by title or director. Use for filtering the gallery.",
  request: { query: querySchema },
  responses: {
    200: {
      content: { "application/json": { schema: movieListResponseSchema } },
      description: "Search results",
    },
    400: {
      content: { "application/json": { schema: errorResponseSchema } },
      description: "Missing query",
    },
  },
});

movieRoutes.openapi(searchRoute, async (c) => {
  const { q } = c.req.valid("query");
  const results = await service.search(q);
  return c.json(successResponse(results, { total: results.length }), 200);
});

// ─── GET /lookup — Search OMDB ──────────────────────────────────

const lookupRoute = createRoute({
  method: "get",
  path: "/lookup",
  tags: ["Movies"],
  summary: "Search OMDB",
  description:
    "Search the OMDB database for movies. Use this for the 'add movie' typeahead — shows title, year, poster. " +
    "Minimum 1 character. Does NOT add movies to your collection.",
  request: { query: querySchema },
  responses: {
    200: {
      content: { "application/json": { schema: omdbSearchResponseSchema } },
      description: "OMDB search results",
    },
    400: {
      content: { "application/json": { schema: errorResponseSchema } },
      description: "Missing query",
    },
  },
});

movieRoutes.openapi(lookupRoute, async (c) => {
  const { q } = c.req.valid("query");
  const results = await service.lookupFromOmdb(q);
  return c.json(successResponse(results, { total: results.length }), 200);
});

// ─── GET /:id — Get single movie ────────────────────────────────

const getByIdRoute = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["Movies"],
  summary: "Get movie by ID",
  description:
    "Fetch a single movie from your collection by its internal ID. Use for the detail view.",
  request: { params: idParamSchema },
  responses: {
    200: {
      content: { "application/json": { schema: movieResponseSchema } },
      description: "Movie found",
    },
    404: {
      content: { "application/json": { schema: errorResponseSchema } },
      description: "Movie not found",
    },
  },
});

movieRoutes.openapi(getByIdRoute, async (c) => {
  const { id } = c.req.valid("param");
  const movie = await service.getById(id);
  if (!movie) {
    return c.json(errorResponse("Movie not found"), 404);
  }
  return c.json(successResponse(movie), 200);
});

// ─── POST /add — Add from OMDB by IMDB ID ──────────────────────

const addRoute = createRoute({
  method: "post",
  path: "/add",
  tags: ["Movies"],
  summary: "Add movie by IMDB ID",
  description:
    "Fetch full movie details from OMDB using an IMDB ID (e.g. tt1375666) and add to your collection. " +
    "Use after the user selects a movie from the /lookup search results.",
  request: {
    body: { content: { "application/json": { schema: addMovieSchema } } },
  },
  responses: {
    201: {
      content: { "application/json": { schema: movieResponseSchema } },
      description: "Movie added",
    },
    400: {
      content: { "application/json": { schema: errorResponseSchema } },
      description: "Validation error",
    },
    404: {
      content: { "application/json": { schema: errorResponseSchema } },
      description: "Not found on OMDB",
    },
  },
});

movieRoutes.openapi(addRoute, async (c) => {
  const { imdbId, rating, tags, notes } = c.req.valid("json");
  const movie = await service.addFromOmdb(imdbId, { rating, tags, notes });
  if (!movie) {
    return c.json(errorResponse("Could not find movie on OMDB"), 404);
  }
  return c.json(successResponse(movie), 201);
});

// ─── POST / — Manual add ────────────────────────────────────────

const manualAddRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Movies"],
  summary: "Manually add a movie",
  description:
    "Add a movie by providing all details yourself (bypasses OMDB). " +
    "Use when the movie isn't on OMDB or you want full control over the data.",
  request: {
    body: { content: { "application/json": { schema: manualAddSchema } } },
  },
  responses: {
    201: {
      content: { "application/json": { schema: movieResponseSchema } },
      description: "Movie added",
    },
    400: {
      content: { "application/json": { schema: errorResponseSchema } },
      description: "Validation error",
    },
  },
});

movieRoutes.openapi(manualAddRoute, async (c) => {
  const parsed = c.req.valid("json");
  const movie = await service.add({
    ...parsed,
    director: parsed.director,
    tags: parsed.tags ?? [],
  });
  return c.json(successResponse(movie), 201);
});

// ─── PUT /:id — Update movie ────────────────────────────────────

const updateRoute = createRoute({
  method: "put",
  path: "/{id}",
  tags: ["Movies"],
  summary: "Update a movie",
  description:
    "Partially update a movie in your collection. Only include the fields you want to change.",
  request: {
    params: idParamSchema,
    body: { content: { "application/json": { schema: updateMovieSchema } } },
  },
  responses: {
    200: {
      content: { "application/json": { schema: movieResponseSchema } },
      description: "Movie updated",
    },
    400: {
      content: { "application/json": { schema: errorResponseSchema } },
      description: "Validation error",
    },
    404: {
      content: { "application/json": { schema: errorResponseSchema } },
      description: "Movie not found",
    },
  },
});

movieRoutes.openapi(updateRoute, async (c) => {
  const { id } = c.req.valid("param");
  const body = c.req.valid("json");
  const movie = await service.update(id, body);
  if (!movie) {
    return c.json(errorResponse("Movie not found"), 404);
  }
  return c.json(successResponse(movie), 200);
});

// ─── DELETE /:id — Remove movie ─────────────────────────────────

const deleteRoute = createRoute({
  method: "delete",
  path: "/{id}",
  tags: ["Movies"],
  summary: "Delete a movie",
  description: "Remove a movie from your collection permanently.",
  request: { params: idParamSchema },
  responses: {
    200: {
      content: { "application/json": { schema: deleteResponseSchema } },
      description: "Movie deleted",
    },
    404: {
      content: { "application/json": { schema: errorResponseSchema } },
      description: "Movie not found",
    },
  },
});

movieRoutes.openapi(deleteRoute, async (c) => {
  const { id } = c.req.valid("param");
  const deleted = await service.remove(id);
  if (!deleted) {
    return c.json(errorResponse("Movie not found"), 404);
  }
  return c.json(successResponse({ deleted: true as const }), 200);
});

export { movieRoutes };
