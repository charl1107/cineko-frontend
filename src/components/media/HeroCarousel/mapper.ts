import type { DetailedMedia, HeroSlide } from "./types"
import { tmdbImage } from "@/lib/tmdb.utils"

export function toHeroSlides(mediaItems: DetailedMedia[]): HeroSlide[] {
    return mediaItems
        .filter((media) => media.backdrop_path || media.backdrop)
        .slice(0, 10)
        .map((media, index) => {
            const isMovie = "title" in media

            const title = isMovie ? media.title : media.name

            const year = isMovie ? media.release_date : media.first_air_date

            const logo =
                media.images?.logos?.find((l) => (l as any).iso_639_1 === "en" || (l as any).iso_639_1 === null || (l as any).iso_639_1 === "")?.file_path ??
                media.images?.logos?.[0]?.file_path ??
                (media.poster_path || media.poster) ??
                "/favicon.svg"

            const backdrop =
                media.backdrop_path ??
                media.backdrop ??
                media.images?.backdrops?.[0]?.file_path ??
                media.poster_path ??
                "/favicon.svg"

            return {
                id: media.id,
                type: isMovie ? "movie" : "tv",
                title,
                year: year ?? "",
                rating: media.vote_average
                    ? media.vote_average.toFixed(1)
                    : media.rating
                        ? String(media.rating)
                        : "N/A",
                description: media.overview || "No description available.",
                image: typeof backdrop === "string" && backdrop.startsWith("http")
                    ? backdrop
                    : backdrop === "/favicon.svg"
                        ? backdrop
                        : tmdbImage(backdrop as string, "original"),
                badge: index >= 6 ? "Popular" : index >= 3 ? "Trending" : "New",
                runtime: isMovie
                    ? media.runtime
                        ? `${media.runtime}m`
                        : ""
                    : media.episode_run_time?.[0]
                        ? `${media.episode_run_time[0]}m`
                        : (media.status ?? ""),
                logo: typeof logo === "string" && logo.startsWith("http")
                    ? logo
                    : logo === "/favicon.svg"
                        ? logo
                        : tmdbImage(logo, "original"),
            }
        })
}
