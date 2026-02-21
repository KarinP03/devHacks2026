import { describe, it, expect, beforeEach } from "vitest";
import type { Movie } from "../src/modules/movies/movie.types.js";
import type { IRepository } from "../src/contracts/repository.js";
import { generateId } from "../src/utils/id.js";

/**
 * In-memory repository for testing — mirrors MovieRepository behavior
 * but doesn't touch the filesystem.
 */
class TestMovieRepository implements IRepository<Movie> {
  store = new Map<string, Movie>();

  async findAll(): Promise<Movie[]> {
    return Array.from(this.store.values());
  }

  async findById(id: string): Promise<Movie | null> {
    return this.store.get(id) ?? null;
  }

  async create(item: Omit<Movie, "id" | "dateAdded">): Promise<Movie> {
    const movie: Movie = {
      ...item,
      id: generateId(),
      dateAdded: new Date().toISOString(),
    };
    this.store.set(movie.id, movie);
    return movie;
  }

  async update(id: string, partial: Partial<Movie>): Promise<Movie | null> {
    const existing = this.store.get(id);
    if (!existing) return null;
    const updated: Movie = {
      ...existing,
      ...partial,
      id,
      dateAdded: existing.dateAdded,
    };
    this.store.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }

  async search(query: string): Promise<Movie[]> {
    const q = query.toLowerCase();
    return Array.from(this.store.values()).filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.director.toLowerCase().includes(q),
    );
  }
}

function makeMovie(
  overrides: Partial<Omit<Movie, "id" | "dateAdded">> = {},
): Omit<Movie, "id" | "dateAdded"> {
  return {
    collectionType: "movie",
    title: "Inception",
    year: 2010,
    director: "Christopher Nolan",
    genre: ["Action", "Sci-Fi"],
    plot: "A thief who steals corporate secrets...",
    imdbId: "tt1375666",
    runtime: "148 min",
    imdbRating: "8.8",
    poster: "https://example.com/poster.jpg",
    imageUrl: "https://example.com/poster.jpg",
    era: "contemporary",
    tags: [],
    ...overrides,
  };
}

describe("Repository (in-memory)", () => {
  let repo: TestMovieRepository;

  beforeEach(() => {
    repo = new TestMovieRepository();
  });

  it("should start empty", async () => {
    const all = await repo.findAll();
    expect(all).toHaveLength(0);
  });

  it("should create a movie with generated id and dateAdded", async () => {
    const movie = await repo.create(makeMovie());
    expect(movie.id).toBeDefined();
    expect(movie.dateAdded).toBeDefined();
    expect(movie.title).toBe("Inception");
  });

  it("should find a movie by id", async () => {
    const created = await repo.create(makeMovie());
    const found = await repo.findById(created.id);
    expect(found).not.toBeNull();
    expect(found?.title).toBe("Inception");
  });

  it("should return null for non-existent id", async () => {
    const found = await repo.findById("non-existent");
    expect(found).toBeNull();
  });

  it("should list all movies", async () => {
    await repo.create(makeMovie({ title: "Inception" }));
    await repo.create(makeMovie({ title: "Interstellar" }));
    const all = await repo.findAll();
    expect(all).toHaveLength(2);
  });

  it("should update a movie", async () => {
    const created = await repo.create(makeMovie());
    const updated = await repo.update(created.id, {
      title: "Inception (Updated)",
    });
    expect(updated?.title).toBe("Inception (Updated)");
    expect(updated?.dateAdded).toBe(created.dateAdded); // dateAdded preserved
  });

  it("should return null when updating non-existent", async () => {
    const result = await repo.update("fake-id", { title: "Nope" });
    expect(result).toBeNull();
  });

  it("should delete a movie", async () => {
    const created = await repo.create(makeMovie());
    const deleted = await repo.delete(created.id);
    expect(deleted).toBe(true);
    const found = await repo.findById(created.id);
    expect(found).toBeNull();
  });

  it("should return false when deleting non-existent", async () => {
    const result = await repo.delete("fake-id");
    expect(result).toBe(false);
  });

  it("should search by title", async () => {
    await repo.create(makeMovie({ title: "Inception" }));
    await repo.create(makeMovie({ title: "Interstellar" }));
    const results = await repo.search("inception");
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe("Inception");
  });

  it("should search by director", async () => {
    await repo.create(
      makeMovie({ title: "Inception", director: "Christopher Nolan" }),
    );
    await repo.create(
      makeMovie({ title: "Parasite", director: "Bong Joon-ho" }),
    );
    const results = await repo.search("nolan");
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe("Inception");
  });
});
