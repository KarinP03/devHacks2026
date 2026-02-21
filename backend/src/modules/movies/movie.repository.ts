import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { IRepository } from "../../contracts/repository.js";
import type { Movie } from "./movie.schemas.js";
import { generateId } from "../../utils/id.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "..", "..", "data");
const DATA_FILE = join(DATA_DIR, "movies.json");

/**
 * JSON file-backed movie repository.
 * Implements IRepository<Movie> — persists data to `backend/data/movies.json`.
 */
export class MovieRepository implements IRepository<Movie> {
  private store: Map<string, Movie>;

  constructor() {
    this.store = new Map();
    this.load();
  }

  // --- Persistence helpers ---

  private load(): void {
    if (!existsSync(DATA_FILE)) {
      this.store = new Map();
      return;
    }
    try {
      const raw = readFileSync(DATA_FILE, "utf-8");
      const movies: Movie[] = JSON.parse(raw);
      this.store = new Map(movies.map((m) => [m.id, m]));
    } catch (err) {
      console.warn(
        "[MovieRepository] Failed to load data file, starting fresh:",
        err,
      );
      this.store = new Map();
    }
  }

  private save(): void {
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true });
    }
    const movies = Array.from(this.store.values());
    writeFileSync(DATA_FILE, JSON.stringify(movies, null, 2), "utf-8");
  }

  // --- IRepository<Movie> ---

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
    this.save();
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
    this.save();
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = this.store.delete(id);
    if (deleted) this.save();
    return deleted;
  }

  async search(query: string): Promise<Movie[]> {
    const q = query.toLowerCase();
    return Array.from(this.store.values()).filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.director.toLowerCase().includes(q) ||
        m.genre.some((g) => g.toLowerCase().includes(q)) ||
        m.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }

  async findByImdbId(imdbId: string): Promise<Movie | null> {
    for (const movie of this.store.values()) {
      if (movie.imdbId === imdbId) return movie;
    }
    return null;
  }
}
