import { describe, it, expect } from "vitest";
import {
  addMovieSchema,
  manualAddSchema,
  updateMovieSchema,
  formatZodError,
} from "../src/modules/movies/movie.schemas.js";

describe("addMovieSchema", () => {
  it("accepts valid imdbId", () => {
    const result = addMovieSchema.safeParse({ imdbId: "tt1375666" });
    expect(result.success).toBe(true);
  });

  it("accepts imdbId with optional userMeta", () => {
    const result = addMovieSchema.safeParse({
      imdbId: "tt1375666",
      rating: 9,
      tags: ["favorite"],
      notes: "Great movie",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing imdbId", () => {
    const result = addMovieSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects invalid imdbId format", () => {
    const result = addMovieSchema.safeParse({ imdbId: "abc123" });
    expect(result.success).toBe(false);
  });

  it("rejects rating out of range", () => {
    const result = addMovieSchema.safeParse({
      imdbId: "tt1375666",
      rating: 15,
    });
    expect(result.success).toBe(false);
  });
});

describe("manualAddSchema", () => {
  const validManual = {
    title: "My Movie",
    year: 2020,
    director: "Me",
    genre: ["Drama"],
  };

  it("accepts valid manual add", () => {
    const result = manualAddSchema.safeParse(validManual);
    expect(result.success).toBe(true);
  });

  it("rejects empty director name", () => {
    const result = manualAddSchema.safeParse({ ...validManual, director: "" });
    expect(result.success).toBe(false);
  });

  it("rejects empty genre array", () => {
    const result = manualAddSchema.safeParse({ ...validManual, genre: [] });
    expect(result.success).toBe(false);
  });
});

describe("updateMovieSchema", () => {
  it("accepts partial update", () => {
    const result = updateMovieSchema.safeParse({ title: "Updated Title" });
    expect(result.success).toBe(true);
  });

  it("accepts empty object (all fields optional)", () => {
    const result = updateMovieSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("rejects invalid poster URL", () => {
    const result = updateMovieSchema.safeParse({ poster: "not-a-url" });
    expect(result.success).toBe(false);
  });
});

describe("formatZodError", () => {
  it("formats field errors readably", () => {
    const result = addMovieSchema.safeParse({ imdbId: 123 });
    expect(result.success).toBe(false);
    if (!result.success) {
      const msg = formatZodError(result.error);
      expect(msg).toContain("imdbId");
    }
  });
});
