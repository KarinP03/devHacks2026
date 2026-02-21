import { z } from "@hono/zod-openapi";

// ─── Reusable Fields ──────────────────────────────────────────────

const fields = {
  id: z.uuid("Invalid UUID format").openapi({
    description: "Movie collection ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
  imdbId: z
    .string()
    .regex(/^tt\d+$/, 'Must match format "tt1234567"')
    .openapi({ example: "tt1375666" }),
  title: z.string().min(1).openapi({ example: "My Movie" }),
  year: z.number().int().min(1888).max(2100).openapi({ example: 2020 }),
  director: z.string().min(1).openapi({ example: "Jane Doe" }),
  genre: z
    .array(z.string())
    .min(1, "At least one genre required")
    .openapi({ example: ["Drama"] }),
  plot: z.string(),
  runtime: z.string().openapi({ example: "120 min" }),
  poster: z.url(),
  imageUrl: z.string(),
  rating: z
    .number()
    .min(0)
    .max(10)
    .openapi({ description: "Personal rating 0–10", example: 8 }),
  tags: z
    .array(z.string())
    .openapi({ description: "Custom labels", example: ["favorite", "sci-fi"] }),
  notes: z.string().openapi({
    description: "Personal notes",
    example: "Watched with friends",
  }),
  era: z.enum(["silent", "golden", "classic", "modern", "contemporary"]),
  collectionType: z.literal("movie"),
  dateAdded: z.string(),
  imdbRating: z.string(),
  searchQuery: z
    .string()
    .min(1)
    .openapi({ description: "Search query", example: "Inception" }),
  // --- Basic OMDB mapping fields ---
  string: z.string(),
  stringOptional: z.string().optional(),
};

// ─── Shared pieces ──────────────────────────────────────────────

const userMetaSchema = z.object({
  rating: fields.rating.optional(),
  tags: fields.tags.optional(),
  notes: fields.notes.optional(),
});

// ─── Request schemas ────────────────────────────────────────────

export const addMovieSchema = z
  .object({
    imdbId: fields.imdbId,
  })
  .extend(userMetaSchema.shape)
  .openapi("AddMovieRequest");

const movieDataSchema = z.object({
  title: fields.title,
  year: fields.year,
  director: fields.director.optional().default("Unknown"),
  genre: fields.genre,
  plot: fields.plot.optional(),
  runtime: fields.runtime.optional(),
  poster: fields.poster.optional(),
});

export const manualAddSchema = movieDataSchema
  .extend(userMetaSchema.shape)
  .openapi("ManualAddRequest");

export const updateMovieSchema = movieDataSchema
  .extend(userMetaSchema.shape)
  .partial()
  .openapi("UpdateMovieRequest");

export const querySchema = z.object({
  q: fields.searchQuery,
});

export const idParamSchema = z.object({
  id: fields.id,
});

// ─── Response schemas ───────────────────────────────────────────

export const movieSchema = movieDataSchema
  .extend(userMetaSchema.shape)
  .extend({
    id: fields.id,
    collectionType: fields.collectionType,
    director: fields.director, // Overrides optional director from request
    imdbId: z.string().optional(), // Can't use strict imdbId here, as DB might not have regex match on old entries
    imdbRating: fields.imdbRating.optional(),
    imageUrl: fields.imageUrl.optional(),
    era: fields.era,
    tags: fields.tags, // Overrides optional tags from userMeta
    dateAdded: fields.dateAdded,
  })
  .openapi("Movie");

const metaSchema = z.object({
  timestamp: z.string(),
  total: z.number().optional(),
  page: z.number().optional(),
});

function createApiResponseSchema<T extends z.ZodTypeAny>(
  dataSchema: T,
  name: string,
) {
  return z
    .object({
      success: z.literal(true),
      data: dataSchema,
      meta: metaSchema.optional(),
    })
    .openapi(name);
}

export const movieResponseSchema = createApiResponseSchema(
  movieSchema,
  "MovieResponse",
);

export const movieListResponseSchema = createApiResponseSchema(
  z.array(movieSchema),
  "MovieListResponse",
);

export const omdbSearchResultSchema = z
  .object({
    Title: fields.title,
    Year: fields.string,
    imdbID: fields.imdbId,
    Type: fields.string,
    Poster: fields.poster.or(z.literal("N/A")), // OMDB sometimes returns "N/A" for missing posters
  })
  .openapi("OmdbSearchResult");

export const omdbSearchResponseSchema = createApiResponseSchema(
  z.array(omdbSearchResultSchema),
  "OmdbSearchResponse",
);

export const omdbMovieDetailSchema = z
  .object({
    Title: fields.title,
    Year: fields.string,
    Rated: fields.string,
    Released: fields.string,
    Runtime: fields.string,
    Genre: fields.string,
    Director: fields.string, // OMDB returns comma separated string for director
    Writer: fields.string,
    Actors: fields.string,
    Plot: fields.plot,
    Language: fields.string,
    Country: fields.string,
    Awards: fields.string,
    Poster: fields.poster.or(z.literal("N/A")),
    Ratings: z.array(z.object({ Source: fields.string, Value: fields.string })),
    Metascore: fields.string,
    imdbRating: fields.imdbRating,
    imdbVotes: fields.string,
    imdbID: fields.imdbId,
    Type: fields.string,
    DVD: fields.stringOptional,
    BoxOffice: fields.stringOptional,
    Production: fields.stringOptional,
    Website: fields.stringOptional,
    Response: fields.string,
    Error: fields.stringOptional,
  })
  .openapi("OmdbMovieDetail");

export const errorResponseSchema = z
  .object({
    success: z.literal(false),
    data: z.null(),
    error: z.string(),
    meta: metaSchema.optional(),
  })
  .openapi("ErrorResponse");

export const deleteResponseSchema = createApiResponseSchema(
  z.object({ deleted: z.literal(true) }),
  "DeleteResponse",
);

// ─── Helpers ────────────────────────────────────────────────────

export function formatZodError(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? `${issue.path.join(".")}: ` : "";
      return `${path}${issue.message}`;
    })
    .join("; ");
}

// ─── Inferred Types ─────────────────────────────────────────────

export type Movie = z.infer<typeof movieSchema>;
export type MovieEra = z.infer<typeof fields.era>;
export type OmdbSearchResult = z.infer<typeof omdbSearchResultSchema>;
export type OmdbMovieDetail = z.infer<typeof omdbMovieDetailSchema>;
