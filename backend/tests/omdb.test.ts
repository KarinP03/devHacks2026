import { describe, it, expect } from "vitest";
import { OmdbClient } from "../src/modules/movies/omdb.client.js";
import {
  omdbSearchResultSchema,
  omdbMovieDetailSchema,
} from "../src/modules/movies/movie.schemas.js";

// We need a real API key for live tests, so we pull from env or skip
import { env } from "../src/config/env.js";

describe("OMDB Schema Live Integration Tests", () => {
  const client = new OmdbClient();

  // "Inception" is a highly reliable movie to test against
  const testMovieId = "tt1375666"; // Inception
  const testSearchQuery = "Matrix";

  it.skipIf(!env.OMDB_API_KEY)(
    "should match omdbSearchResultSchema for live searches",
    async () => {
      // 1. Fetch raw data from the client
      const { results } = await client.searchMovies(testSearchQuery);

      expect(results.length).toBeGreaterThan(0);

      // 2. Validate every single result explicitly against our Zod schema
      results.forEach((result) => {
        const parsed = omdbSearchResultSchema.safeParse(result);

        // If parsing fails, this will print out exactly which field mismatched what OMDB returned!
        if (!parsed.success) {
          console.error(
            "Schema mismatch on Search Result:",
            parsed.error.format(),
          );
        }
        expect(parsed.success).toBe(true);
      });
    },
  );

  it.skipIf(!env.OMDB_API_KEY)(
    "should match omdbMovieDetailSchema for a live movie ID",
    async () => {
      // 1. Fetch raw details
      const detail = await client.getMovieById(testMovieId);
      expect(detail).not.toBeNull();

      // 2. Validate it explicitly against the Zod schema
      const parsed = omdbMovieDetailSchema.safeParse(detail);

      // If parsing fails, this will print exactly which field our schema got wrong vs live OMDB
      if (!parsed.success) {
        console.error(
          "Schema mismatch on Movie Detail:",
          parsed.error.format(),
        );
      }

      expect(parsed.success).toBe(true);
    },
  );
});
