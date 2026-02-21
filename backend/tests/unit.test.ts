import { describe, it, expect, beforeEach } from "vitest";
import { MovieService } from "../src/modules/movies/movie.service.js";
import { MovieRepository } from "../src/modules/movies/movie.repository.js";
import { OmdbClient } from "../src/modules/movies/omdb.client.js";

describe("MovieService Era Assignment", () => {
  let service: MovieService;

  beforeEach(() => {
    // Mock dependencies. We only care about the service logic.
    const mockRepo = {
      create: async (movie: any) => ({
        ...movie,
        id: "test-id",
        dateAdded: new Date().toISOString(),
      }),
    } as unknown as MovieRepository;

    const mockOmdb = {} as unknown as OmdbClient;

    service = new MovieService(mockRepo, mockOmdb);
  });

  const baseMovie = {
    title: "Test",
    director: "Test Director",
    genre: ["Test"],
    tags: [],
  };

  it("should assign 'silent' for years before 1930", async () => {
    const m1 = await service.add({ ...baseMovie, year: 1920 });
    const m2 = await service.add({ ...baseMovie, year: 1929 });
    expect(m1.era).toBe("silent");
    expect(m2.era).toBe("silent");
  });

  it("should assign 'golden' for years 1930-1959", async () => {
    const m1 = await service.add({ ...baseMovie, year: 1930 });
    const m2 = await service.add({ ...baseMovie, year: 1955 });
    expect(m1.era).toBe("golden");
    expect(m2.era).toBe("golden");
  });

  it("should assign 'classic' for years 1960-1979", async () => {
    const m1 = await service.add({ ...baseMovie, year: 1960 });
    const m2 = await service.add({ ...baseMovie, year: 1975 });
    expect(m1.era).toBe("classic");
    expect(m2.era).toBe("classic");
  });

  it("should assign 'modern' for years 1980-1999", async () => {
    const m1 = await service.add({ ...baseMovie, year: 1980 });
    const m2 = await service.add({ ...baseMovie, year: 1995 });
    expect(m1.era).toBe("modern");
    expect(m2.era).toBe("modern");
  });

  it("should assign 'contemporary' for years 2000+", async () => {
    const m1 = await service.add({ ...baseMovie, year: 2000 });
    const m2 = await service.add({ ...baseMovie, year: 2024 });
    expect(m1.era).toBe("contemporary");
    expect(m2.era).toBe("contemporary");
  });
});

describe("successResponse / errorResponse", () => {
  // Import dynamically to avoid env.ts side effects
  let successResponse: typeof import("../src/contracts/api-response.js").successResponse;
  let errorResponse: typeof import("../src/contracts/api-response.js").errorResponse;

  beforeEach(async () => {
    const mod = await import("../src/contracts/api-response.js");
    successResponse = mod.successResponse;
    errorResponse = mod.errorResponse;
  });

  it("successResponse sets success=true and wraps data", () => {
    const res = successResponse({ foo: "bar" });
    expect(res.success).toBe(true);
    expect(res.data).toEqual({ foo: "bar" });
    expect(res.meta?.timestamp).toBeDefined();
  });

  it("successResponse includes optional meta", () => {
    const res = successResponse([1, 2, 3], { total: 3 });
    expect(res.meta?.total).toBe(3);
  });

  it("errorResponse sets success=false and data=null", () => {
    const res = errorResponse("something broke");
    expect(res.success).toBe(false);
    expect(res.data).toBeNull();
    expect(res.error).toBe("something broke");
    expect(res.meta?.timestamp).toBeDefined();
  });
});
