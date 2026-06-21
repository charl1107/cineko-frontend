import type { MovieDetailsWithAppends, TVDetailsWithAppends, TVSeason } from "@lorenzopant/tmdb"
import { MOVIE_APPENDS, TV_APPENDS } from "../constants/tmdb"
import type { MediaCast, MediaEpisode, MediaNormalized, MediaRecommendation } from "../types/media.types"
import { tmdbImage } from "@/lib/tmdb.utils"

export const mapMedia = (data: MovieDetailsWithAppends<typeof MOVIE_APPENDS> | TVDetailsWithAppends<typeof TV_APPENDS>, type: "movie" | "tv"): MediaNormalized => {
    const isMovie = type === "movie"
    const movieData = isMovie ? (data as MovieDetailsWithAppends<typeof MOVIE_APPENDS>) : null
    const tvData = !isMovie ? (data as TVDetailsWithAppends<typeof TV_APPENDS>) : null

    const trailer = data.videos?.results?.find((v) => v.type === "Trailer" && v.site === "YouTube")?.key || null

    const cast: MediaCast[] =
        data.credits?.cast?.slice(0, 10).map((c) => ({
            id: c.id,
            name: c.name,
            character: c.character,
            profileUrl: tmdbImage(c.profile_path, "w185"),
        })) || []

    const recommendations: MediaRecommendation[] =
        data.recommendations?.results?.slice(0, 12).map((r) => ({
            id: r.id,
            type: ("media_type" in r ? r.media_type : isMovie ? "movie" : "tv") as "movie" | "tv",
            title: ("title" in r ? r.title : r.name) as string,
            posterUrl: tmdbImage(r.poster_path, "w500"),
            backdropUrl: tmdbImage(r.backdrop_path, "w780"),
            rating: r.vote_average,
        })) || []

    return {
        id: data.id,
        type,
        title: isMovie ? movieData!.title : tvData!.name,
        overview: data.overview ?? "",
        releaseDate: isMovie ? movieData!.release_date : tvData!.first_air_date,
        rating: data.vote_average,
        voteCount: data.vote_count,
        runtime: isMovie ? movieData!.runtime : tvData!.episode_run_time?.[0],
        genres: data.genres?.map((g) => g.name) ?? [],
        backdropUrl: tmdbImage(data.backdrop_path, "original"),
        posterUrl: tmdbImage(data.poster_path, "w500"),
        logoUrl: tmdbImage(
            data.images?.logos?.find((l: { iso_639_1?: string | null }) => l.iso_639_1 === "en" || l.iso_639_1 === null || l.iso_639_1 === "")?.file_path ??
            data.images?.logos?.[0]?.file_path,
            "w500",
            ""
        ),
        trailer,
        cast,
        recommendations,
        seasons: tvData?.seasons?.map((s) => ({
            id: s.id,
            seasonNumber: s.season_number,
            name: s.name,
            episodeCount: s.episode_count,
            posterUrl: tmdbImage(s.poster_path, "w500"),
            airDate: s.air_date ?? "N/A",
        })),
    }
}

export const mapEpisodes = (season: TVSeason): MediaEpisode[] => {
    return (season.episodes ?? []).map((e) => ({
        id: e.id,
        episodeNumber: e.episode_number,
        name: e.name,
        overview: e.overview,
        stillUrl: tmdbImage(e.still_path, "w780"),
        airDate: e.air_date ?? "N/A",
        runtime: e.runtime ?? 0,
    }))
}

export function formatRuntime(runtime?: number) {
    if (!runtime) return null

    const hours = Math.floor(runtime / 60)
    const minutes = runtime % 60

    return `${hours}h ${minutes}m`
}
