import type { ICollectionService } from "../../contracts/service.js";
import type { Movie, OmdbSearchResult, MovieEra } from "./movie.schemas.js";
import type { MovieRepository } from "./movie.repository.js";
import type { OmdbClient } from "./omdb.client.js";

/**
 * Minimal payload required to create a new movie in the repository.
 */
export type CreateMovieInput = Omit<
  Movie,
  "id" | "dateAdded" | "collectionType" | "era"
> &
  Partial<Pick<Movie, "collectionType" | "era">>;

/**
 * Movie business logic — orchestrates OMDB lookups and repository persistence.
 */
export class MovieService implements ICollectionService<Movie> {
  constructor(
    private repo: MovieRepository,
    private omdb: OmdbClient,
  ) {}

  async getAll(): Promise<Movie[]> {
    return this.repo.findAll();
  }

  async getById(id: string): Promise<Movie | null> {
    return this.repo.findById(id);
  }

  async add(item: CreateMovieInput): Promise<Movie> {
    const movie: Omit<Movie, "id" | "dateAdded"> = {
      ...item,
      collectionType: "movie",
      era: item.era ?? this.getMovieEra(item.year),
      tags: item.tags ?? [],
    };
    return this.repo.create(movie);
  }

  async update(id: string, item: Partial<Movie>): Promise<Movie | null> {
    return this.repo.update(id, item);
  }

  async remove(id: string): Promise<boolean> {
    return this.repo.delete(id);
  }

  async search(query: string): Promise<Movie[]> {
    return this.repo.search(query);
  }

  /**
   * Search OMDB for movies (does NOT add them to the collection).
   * Returns lightweight search results. The frontend uses this for "add movie" flows.
   */
  async lookupFromOmdb(query: string): Promise<OmdbSearchResult[]> {
    const { results } = await this.omdb.searchMovies(query);
    return results;
  }

  /**
   * Fetch full movie details from OMDB by IMDB ID and add to the collection.
   * Returns existing movie if already added (duplicate guard).
   */
  async addFromOmdb(
    imdbId: string,
    userMeta?: { rating?: number; tags?: string[]; notes?: string },
  ): Promise<Movie | null> {
    // Duplicate guard
    const existing = await this.repo.findByImdbId(imdbId);
    if (existing) return existing;

    const detail = await this.omdb.getMovieById(imdbId);
    if (!detail) return null;

    const year = parseInt(detail.Year, 10) || 0;
    const posterUrl = detail.Poster !== "N/A" ? detail.Poster : undefined;

    return this.add({
      title: detail.Title,
      year,
      director: detail.Director,
      genre: detail.Genre.split(",").map((g) => g.trim()),
      plot: detail.Plot,
      imdbId: detail.imdbID,
      runtime: detail.Runtime,
      imdbRating: detail.imdbRating,
      poster: posterUrl,
      imageUrl: posterUrl,
      rating: userMeta?.rating,
      notes: userMeta?.notes,
      tags: userMeta?.tags ?? [],
    });
  }
  /**
   * Determine the movie era from its release year.
   * Used by the backend to apply visual filters (B&W, grain, etc).
   */
  private getMovieEra(year: number): MovieEra {
    if (year < 1930) return "silent";
    if (year < 1960) return "golden";
    if (year < 1980) return "classic";
    if (year < 2000) return "modern";
    return "contemporary";
  }
}
