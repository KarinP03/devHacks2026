import Movie from "./Movie.ts";

export default class FetchMovie {
    static async getMovie(title: string, year: number): Promise<Movie> {

        const url = "https://www.omdbapi.com/?t=" + title + "&y=" + year + "&apikey=78b83996";
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const result = await response.json();
        console.log(result);

        return new Movie(result.Title, result.Year, result.Rated, new Date(result.Released), result.Runtime, result.Genre, result.Director,
            result.Writer, result.Actors, result.Plot, result.Language, result.Country, result.Awards, result.Poster, result.Metascore, result.imdbRating
        , result.imdbVotes, result.imdbID, result.Type, result.BoxOffice);
    }
}