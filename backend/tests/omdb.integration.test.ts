import { describe, it, expect } from "vitest";
import { OmdbClient } from "../src/modules/movies/omdb.client.js";

/**
 * Integration tests — actually calls the OMDB API.
 * Requires a valid OMDB_API_KEY in .env.
 *
 * Run with: npm test
 */
describe("OMDB Integration", () => {
  const omdb = new OmdbClient();

  it("should search for movies by query", async () => {
    const { results, totalResults } = await omdb.searchMovies("Inception");
    expect(results.length).toBeGreaterThan(0);
    expect(totalResults).toBeGreaterThan(0);

    const first = results[0];
    expect(first.Title).toBeDefined();
    expect(first.Year).toBeDefined();
    expect(first.imdbID).toBeDefined();
    expect(first.Poster).toBeDefined();
  });

  it("should return empty results for gibberish query", async () => {
    const { results, totalResults } =
      await omdb.searchMovies("xyznotamovie12345");
    expect(results).toHaveLength(0);
    expect(totalResults).toBe(0);
  });

  it("should get movie details by IMDB ID", async () => {
    const detail = await omdb.getMovieById("tt1375666"); // Inception
    expect(detail).not.toBeNull();
    expect(detail?.Title).toBe("Inception");
    expect(detail?.Director).toBe("Christopher Nolan");
    expect(detail?.Year).toBe("2010");
    expect(detail?.Genre).toContain("Sci-Fi");
    expect(detail?.imdbRating).toBeDefined();
    expect(detail?.Poster).toBeDefined();
    expect(detail?.Poster).not.toBe("N/A");
  });

  it("should return null for invalid IMDB ID", async () => {
    const detail = await omdb.getMovieById("tt0000000");
    expect(detail).toBeNull();
  });

  it("should get movie details by title", async () => {
    const detail = await omdb.getMovieByTitle("Inception");
    expect(detail).not.toBeNull();
    expect(detail?.Title).toBe("Inception");
    expect(detail?.imdbID).toBe("tt1375666");
  });

  it("should get movie by title + year for disambiguation", async () => {
    const detail = await omdb.getMovieByTitle("Dune", 2021);
    expect(detail).not.toBeNull();
    expect(detail?.Title).toContain("Dune");
    expect(detail?.Year).toBe("2021");
  });

  it("should return null for non-existent title", async () => {
    const detail = await omdb.getMovieByTitle("ThisMovieDoesNotExist99999");
    expect(detail).toBeNull();
  });

  it("should have poster URL that looks valid", async () => {
    const detail = await omdb.getMovieById("tt1375666");
    expect(detail?.Poster).toMatch(/^https?:\/\//);
  });

  // --- Disambiguation: same title, different years ---

  it("search for 'Dune' should return multiple results from different years", async () => {
    const { results } = await omdb.searchMovies("Dune");
    expect(results.length).toBeGreaterThan(1);

    const years = results.map((r) => r.Year);
    const uniqueYears = new Set(years);
    expect(uniqueYears.size).toBeGreaterThan(1);
  });

  it("getMovieByTitle('Dune', 2021) should return 2021 version", async () => {
    const detail = await omdb.getMovieByTitle("Dune", 2021);
    expect(detail).not.toBeNull();
    expect(detail?.Year).toBe("2021");
  });

  it("getMovieByTitle('Dune', 1984) should return 1984 version", async () => {
    const detail = await omdb.getMovieByTitle("Dune", 1984);
    expect(detail).not.toBeNull();
    expect(detail?.Year).toBe("1984");
  });

  it("getMovieByTitle('Dune') without year returns SOME version (ambiguous)", async () => {
    const detail = await omdb.getMovieByTitle("Dune");
    expect(detail).not.toBeNull();
    // Without year, OMDB picks one — could be any version
    expect(detail?.Title).toContain("Dune");
  });
});
