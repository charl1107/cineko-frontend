import { useCallback, useEffect, useState } from "react"
import { useTmdb } from "@/hooks/use-tmdb"
import { getMovieDetails, getTVDetails } from "../services/media.service"
import { mapMedia } from "../mappers/media.mapper"
import type { MediaNormalized } from "../types/media.types"
import type { MediaType } from "../types/drawer.types"

function extractFromUrl(url: string | undefined): string | undefined {
    if (!url || typeof url !== "string") return undefined
    const match = url.match(/\/([^/]+)\/?$/)
    if (!match) return undefined
    return match[1]
        .replace(/_/g, " ")
        .replace(/\b\w/g, (w) => w.toUpperCase())
}

function normalizeScraperItem(raw: Record<string, unknown>, type: MediaType): MediaNormalized {
    const rawTitle = ((raw.title as string) || "").trim()
    const title =
        rawTitle ||
        (raw.name as string) ||
        (raw.eng_title as string) ||
        (raw.english as string) ||
        (raw.titles?.english as string) ||
        extractFromUrl((raw.id as string) || (raw.url as string)) ||
        extractFromUrl((raw.sourceUrl as string) || (raw.link as string)) ||
        "Untitled"

    const image = (raw.image as string) || (raw.thumbnail as string) || (raw.poster as string) || (raw.poster_path as string) || "/favicon.svg"

    return {
        id: (raw.id as string | number) ?? 0,
        type,
        title,
        overview: (raw.overview as string) || (raw.description as string) || (raw.synopsis as string) || "",
        releaseDate: (raw.release_date as string) || (raw.date as string) || "",
        rating: Number(raw.vote_average ?? raw.rating ?? raw.score ?? 0),
        voteCount: 0,
        genres: [],
        backdropUrl: (raw.backdrop as string) || image,
        posterUrl: image,
        logoUrl: null,
        trailer: null,
        cast: [],
        recommendations: [],
    }
}

export function useMediaDetails(type: MediaType, id: string | number) {
    const tmdb = useTmdb()
    const [data, setData] = useState<MediaNormalized | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const fetchDetails = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            if (type === "movie") {
                const details = await getMovieDetails(tmdb, id as number)
                setData(mapMedia(details, "movie"))
            } else if (type === "tv") {
                const details = await getTVDetails(tmdb, id as number)
                setData(mapMedia(details, "tv"))
            } else if (type === "anime") {
                const raw = await tmdb.anime.info(id) as Record<string, unknown>
                setData(normalizeScraperItem(raw, "anime"))
            } else if (type === "hentai") {
                const raw = await tmdb.hentai.info(id) as Record<string, unknown>
                setData(normalizeScraperItem(raw, "hentai"))
            } else if (type === "jav") {
                const raw = await tmdb.jav.info(id) as Record<string, unknown>
                setData(normalizeScraperItem(raw, "jav"))
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error("Failed to fetch details"))
        } finally {
            setIsLoading(false)
        }
    }, [tmdb, type, id])

    useEffect(() => {
        fetchDetails()
    }, [fetchDetails])

    return { data, isLoading, error, refetch: fetchDetails }
}
