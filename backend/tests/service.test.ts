import { describe, it, expect, beforeEach, vi } from "vitest";
import { MovieService } from "../src/modules/movies/movie.service.js";
import type {
  Movie,
  OmdbMovieDetail,
  OmdbSearchResult,
} from "../src/modules/movies/movie.types.js";
import type { MovieRepository } from "../src/modules/movies/movie.repository.js";
import type { OmdbClient } from "../src/modules/movies/omdb.client.js";
import { generateId } from "../src/utils/id.js";

// --- Fake OMDB detail for testing ---
const fakeOmdbDetail: OmdbMovieDetail = {
  Title: "Inception",
  Year: "2010",
  Rated: "PG-13",
  Released: "16 Jul 2010",
  Runtime: "148 min",
  Genre: "Action, Sci-Fi, Thriller",
  Director: "Christopher Nolan",
  Writer: "Christopher Nolan",
  Actors: "Leonardo DiCaprio",
  Plot: "A thief who steals corporate secrets...",
  Language: "English",
  Country: "USA",
  Awards: "Won 4 Oscars",
  Poster: "https://example.com/inception.jpg",
  Ratings: [],
  Metascore: "74",
  imdbRating: "8.8",
  imdbVotes: "2,000,000",
  imdbID: "tt1375666",
  Type: "movie",
  DVD: "N/A",
  BoxOffice: "$292,576,195",
  Production: "N/A",
  Website: "N/A",
  Response: "True",
};

const fakeSearchResults: OmdbSearchResult[] = [
  {
    Title: "Inception",
    Year: "2010",
    imdbID: "tt1375666",
    Type: "movie",
    Poster: "https://example.com/poster.jpg",
  },
  {
    Title: "Interstellar",
    Year: "2014",
    imdbID: "tt0816692",
    Type: "movie",
    Poster: "https://example.com/poster2.jpg",
  },
];

// --- Mock repo ---
function createMockRepo(): MovieRepository {
  const store = new Map<string, Movie>();

  return {
    findAll: vi.fn(async () => Array.from(store.values())),
    findById: vi.fn(async (id: string) => store.get(id) ?? null),
    create: vi.fn(async (item: Omit<Movie, "id" | "dateAdded">) => {
      const movie: Movie = {
        ...item,
        id: generateId(),
        dateAdded: new Date().toISOString(),
      };
      store.set(movie.id, movie);
      return movie;
    }),
    update: vi.fn(async (id: string, partial: Partial<Movie>) => {
      const existing = store.get(id);
      if (!existing) return null;
      const updated: Movie = {
        ...existing,
        ...partial,
        id,
        dateAdded: existing.dateAdded,
      };
      store.set(id, updated);
      return updated;
    }),
    delete: vi.fn(async (id: string) => store.delete(id)),
    search: vi.fn(async (q: string) =>
      Array.from(store.values()).filter((m) =>
        m.title.toLowerCase().includes(q.toLowerCase()),
      ),
    ),
    findByImdbId: vi.fn(
      async (imdbId: string) =>
        Array.from(store.values()).find((m) => m.imdbId === imdbId) ?? null,
    ),
  } as unknown as MovieRepository;
}

// --- Mock OMDB client ---
function createMockOmdb(): OmdbClient {
  return {
    searchMovies: vi.fn(async () => ({
      results: fakeSearchResults,
      totalResults: 2,
    })),
    getMovieById: vi.fn(async () => fakeOmdbDetail),
    getMovieByTitle: vi.fn(async () => fakeOmdbDetail),
  } as unknown as OmdbClient;
}

describe("MovieService", () => {
  let service: MovieService;
  let repo: MovieRepository;
  let omdb: OmdbClient;

  beforeEach(() => {
    repo = createMockRepo();
    omdb = createMockOmdb();
    service = new MovieService(repo, omdb);
  });

  it("getAll returns empty array initially", async () => {
    const movies = await service.getAll();
    expect(movies).toHaveLength(0);
    expect(repo.findAll).toHaveBeenCalled();
  });

  it("add creates a movie via repo", async () => {
    const movie = await service.add({
      collectionType: "movie",
      title: "Test Movie",
      year: 2020,
      director: "Test Director",
      genre: ["Drama"],
      era: "contemporary",
      tags: [],
    });
    expect(movie.id).toBeDefined();
    expect(movie.title).toBe("Test Movie");
    expect(repo.create).toHaveBeenCalled();
  });

  it("getById returns movie after adding", async () => {
    const added = await service.add({
      collectionType: "movie",
      title: "Test",
      year: 2020,
      director: "Dir",
      genre: [],
      era: "contemporary",
      tags: [],
    });
    const found = await service.getById(added.id);
    expect(found).not.toBeNull();
    expect(found?.title).toBe("Test");
  });

  it("getById returns null for unknown id", async () => {
    const found = await service.getById("nope");
    expect(found).toBeNull();
  });

  it("remove deletes a movie", async () => {
    const added = await service.add({
      collectionType: "movie",
      title: "To Delete",
      year: 2020,
      director: "Dir",
      genre: [],
      era: "contemporary",
      tags: [],
    });
    const deleted = await service.remove(added.id);
    expect(deleted).toBe(true);
  });

  it("lookupFromOmdb calls omdb.searchMovies", async () => {
    const results = await service.lookupFromOmdb("inception");
    expect(results).toHaveLength(2);
    expect(omdb.searchMovies).toHaveBeenCalledWith("inception");
  });

  it("addFromOmdb fetches from OMDB and creates movie", async () => {
    const movie = await service.addFromOmdb("tt1375666");
    expect(movie).not.toBeNull();
    expect(movie?.title).toBe("Inception");
    expect(movie?.era).toBe("contemporary");
    expect(movie?.director).toBe("Christopher Nolan");
    expect(movie?.genre).toEqual(["Action", "Sci-Fi", "Thriller"]);
    expect(omdb.getMovieById).toHaveBeenCalledWith("tt1375666");
    expect(repo.create).toHaveBeenCalled();
  });

  it("addFromOmdb returns null if OMDB returns nothing", async () => {
    vi.mocked(omdb.getMovieById).mockResolvedValueOnce(null);
    const movie = await service.addFromOmdb("tt0000000");
    expect(movie).toBeNull();
  });

  it("addFromOmdb passes userMeta through", async () => {
    const movie = await service.addFromOmdb("tt1375666", {
      rating: 9,
      tags: ["favorite"],
      notes: "Great movie",
    });
    expect(movie?.rating).toBe(9);
    expect(movie?.tags).toEqual(["favorite"]);
    expect(movie?.notes).toBe("Great movie");
  });

  it("search delegates to repo", async () => {
    await service.add({
      collectionType: "movie",
      title: "Inception",
      year: 2010,
      director: "Nolan",
      genre: [],
      era: "contemporary",
      tags: [],
    });
    const results = await service.search("inception");
    expect(repo.search).toHaveBeenCalledWith("inception");
  });
});
