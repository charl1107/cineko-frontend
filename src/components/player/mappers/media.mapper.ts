import type { MovieDetails, TVSeriesDetails, TVEpisode } from "@lorenzopant/tmdb"
import type { UnifiedMedia } from "../types/media.types"
import { tmdbImage } from "@/lib/tmdb.utils"

export function mapMovieToUnified(movie: MovieDetails): UnifiedMedia {
    return {
        id: movie.id.toString(),
        type: "movie",
        title: movie.title,
        overview: movie.overview ?? "No overview available.",
        posterUrl: tmdbImage(movie.poster_path, "w500", ""),
        backdropUrl: tmdbImage(movie.backdrop_path, "original", ""),
        releaseDate: movie.release_date,
        runtime: movie.runtime,
    }
}

export function mapTvEpisodeToUnified(show: TVSeriesDetails, episode: TVEpisode): UnifiedMedia {
    return {
        id: show.id.toString(),
        type: "tv",
        title: show.name,
        overview: episode.overview || show.overview || "No overview available.",
        posterUrl: tmdbImage(show.poster_path, "w500", ""),
        backdropUrl: tmdbImage(episode.still_path, "w780", ""),
        releaseDate: episode.air_date,
        seasonNumber: episode.season_number,
        episodeNumber: episode.episode_number,
        episodeTitle: episode.name,
    }
}
