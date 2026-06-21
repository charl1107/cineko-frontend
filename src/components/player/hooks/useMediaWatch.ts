import { useEffect } from "react"
import type { MediaType } from "../types/media.types"
import { useMediaDetails } from "./useMediaDetails"
import { mapMovieToUnified, mapTvEpisodeToUnified } from "../mappers/media.mapper"
import { useMediaWatchContext } from "../providers/MediaWatchProvider"

export function useMediaWatch(id: string, type: MediaType, season?: number, episode?: number) {
    const { setMedia, setError, setIsLoading } = useMediaWatchContext()
    const { details, isLoading: detailsLoading, error: detailsError } = useMediaDetails(id, type, season, episode)

    useEffect(() => {
        if (detailsError) {
            setError(detailsError)
            return
        }

        if (!detailsLoading) {
            let unified
            if (type === "movie" && details.movie) {
                unified = mapMovieToUnified(details.movie)
            } else if (type === "tv" && details.show && details.episode) {
                unified = mapTvEpisodeToUnified(details.show, details.episode)
            }

            if (unified) {
                setMedia(unified)
                setIsLoading(false)
            } else {
                setError("Failed to resolve media data. Please try again.")
            }
        }
    }, [details, detailsLoading, detailsError, type, setMedia, setError, setIsLoading])

    return {
        isLoading: detailsLoading,
        error: detailsError,
    }
}
