export default class movie {
    title: string;
    year: number;
    rated: string;
    released: Date;
    runtime: number;
    genre: string;
    director: string;
    writer: string;
    actors: string;
    plot: string;
    language: string;
    country: string;
    awards: string;
    poster: string;
    metascore: number;
    imdbRating: number;
    imdbVotes: number;
    imdbID: string;
    type: string;
    boxOffice: number;

    constructor(
        title: string,
        year: number,
        rated: string,
        released: Date,
        runtime: number,
        genre: string,
        director: string,
        writer: string,
        actors: string,
        plot: string,
        language: string,
        country: string,
        awards: string,
        poster: string,
        metascore: number,
        imdbRating: number,
        imdbVotes: number,
        imdbID: string,
        type: string,
        boxOffice: number
    ) {
        this.title = title;
        this.year = year;
        this.rated = rated;
        this.released = released;
        this.runtime = runtime;
        this.genre = genre;
        this.director = director;
        this.writer = writer;
        this.actors = actors;
        this.plot = plot;
        this.language = language;
        this.country = country;
        this.awards = awards;
        this.poster = poster;
        this.metascore = metascore;
        this.imdbRating = imdbRating;
        this.imdbVotes = imdbVotes;
        this.imdbID = imdbID;
        this.type = type;
        this.boxOffice = boxOffice;
    }
}