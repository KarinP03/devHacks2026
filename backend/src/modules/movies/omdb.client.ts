import { env } from "../../config/env.js";
import type { OmdbSearchResult, OmdbMovieDetail } from "./movie.schemas.js";

const OMDB_BASE_URL = "https://www.omdbapi.com";

/**
 * Thin wrapper around the OMDB API.
 * Isolated so it can be easily swapped for other external APIs (IGDB, Discogs, etc).
 */
export class OmdbClient {
  private apiKey: string;

  constructor() {
    this.apiKey = env.OMDB_API_KEY;
  }

  /**
   * Search OMDB by title query string.
   */
  async searchMovies(
    query: string,
    page = 1,
  ): Promise<{ results: OmdbSearchResult[]; totalResults: number }> {
    const url = `${OMDB_BASE_URL}/?apikey=${this.apiKey}&s=${encodeURIComponent(query)}&type=movie&page=${page}`;
    const res = await fetch(url);
    const data = (await res.json()) as {
      Search?: OmdbSearchResult[];
      totalResults?: string;
      Response: string;
      Error?: string;
    };

    if (data.Response === "False") {
      return { results: [], totalResults: 0 };
    }

    return {
      results: data.Search ?? [],
      totalResults: parseInt(data.totalResults ?? "0", 10),
    };
  }

  /**
   * Get detailed movie info by IMDB ID.
   */
  async getMovieById(imdbId: string): Promise<OmdbMovieDetail | null> {
    const url = `${OMDB_BASE_URL}/?apikey=${this.apiKey}&i=${encodeURIComponent(imdbId)}&plot=full`;
    const res = await fetch(url);
    const data = (await res.json()) as OmdbMovieDetail;

    if (data.Response === "False") {
      return null;
    }

    return data;
  }

  /**
   * Get detailed movie info by exact title.
   */
  async getMovieByTitle(
    title: string,
    year?: number,
  ): Promise<OmdbMovieDetail | null> {
    let url = `${OMDB_BASE_URL}/?apikey=${this.apiKey}&t=${encodeURIComponent(title)}&plot=full`;
    if (year) {
      url += `&y=${year}`;
    }
    const res = await fetch(url);
    const data = (await res.json()) as OmdbMovieDetail;

    if (data.Response === "False") {
      return null;
    }

    return data;
  }
}
