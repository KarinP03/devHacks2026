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
    let res: Response;
    try {
      res = await fetch(url);
    } catch (err) {
      throw new Error(
        `OMDB network error during searchMovies: ${String(err)}`,
      );
    }

    let data: {
      Search?: OmdbSearchResult[];
      totalResults?: string;
      Response: string;
      Error?: string;
    };
    try {
      data = (await res.json()) as typeof data;
    } catch (err) {
      throw new Error(
        `OMDB invalid JSON during searchMovies: ${String(err)}`,
      );
    }

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
    let res: Response;
    try {
      res = await fetch(url);
    } catch (err) {
      throw new Error(
        `OMDB network error during getMovieById: ${String(err)}`,
      );
    }

    let data: OmdbMovieDetail;
    try {
      data = (await res.json()) as OmdbMovieDetail;
    } catch (err) {
      throw new Error(
        `OMDB invalid JSON during getMovieById: ${String(err)}`,
      );
    }

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
    let res: Response;
    try {
      res = await fetch(url);
    } catch (err) {
      throw new Error(
        `OMDB network error during getMovieByTitle: ${String(err)}`,
      );
    }

    let data: OmdbMovieDetail;
    try {
      data = (await res.json()) as OmdbMovieDetail;
    } catch (err) {
      throw new Error(
        `OMDB invalid JSON during getMovieByTitle: ${String(err)}`,
      );
    }

    if (data.Response === "False") {
      return null;
    }

    return data;
  }
}
