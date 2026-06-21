import { useEffect, useState } from "react"
import type { TMDB } from "@lorenzopant/tmdb"

import { toHeroSlides } from "./mapper"
import { fetchDetailedMedia, resolveHeroFetcher } from "./utils"
import type { HeroFetcherResult, HeroSlide } from "./types"

export function useHeroSlides(tmdb: TMDB, fetcher: HeroFetcherResult) {
    const [slides, setSlides] = useState<HeroSlide[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let mounted = true

        async function load() {
            setLoading(true)

            try {
                const mixed = await resolveHeroFetcher(fetcher)
                const detailed = await fetchDetailedMedia(mixed, tmdb)

                const filtered = detailed.filter((m) => m.backdrop_path || m.backdrop || m.images?.backdrops?.length)

                if (!mounted) return
                const slides = toHeroSlides(filtered)

                setSlides(slides)
            } catch (e) {
                console.error(e)
                if (mounted) setSlides([])
            } finally {
                if (mounted) setLoading(false)
            }
        }

        load()

        return () => {
            mounted = false
        }
    }, [tmdb, fetcher])

    return { slides, loading }
}
