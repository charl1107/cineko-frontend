import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTmdb } from "@/hooks/use-tmdb"

interface AnimeEpisodeItem {
    id?: string | number
    number?: number
    episode?: number
    title?: string
    name?: string
}

export function AnimeEpisodes({ animeId }: { animeId: string | number }) {
    const tmdb = useTmdb()
    const navigate = useNavigate()
    const [episodes, setEpisodes] = useState<AnimeEpisodeItem[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        setIsLoading(true)

        tmdb.anime
            .episodes(animeId)
            .then((data) => {
                if (cancelled) return
                const d = data as Record<string, unknown>
                const list = (Array.isArray(d.episodes) ? d.episodes : d.results) as AnimeEpisodeItem[]
                setEpisodes(list?.filter((ep) => ep) ?? [])
                setIsLoading(false)
            })
            .catch(() => {
                if (!cancelled) setIsLoading(false)
            })

        return () => { cancelled = true }
    }, [animeId, tmdb])

    if (isLoading) {
        return (
            <div className="flex h-40 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        )
    }

    if (!episodes.length) return null

    const getEpisodeLabel = (ep: AnimeEpisodeItem) => {
        const num = ep.number ?? ep.episode ?? 0
        const label = ep.title || ep.name || `Episode ${num}`
        return `EP ${num}: ${label}`
    }

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Episodes</h3>
            </div>

            <div className="h-100 overflow-y-auto pr-2">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {episodes.map((ep) => {
                        const number = ep.number ?? ep.episode ?? 0
                        return (
                            <button
                                key={ep.id ?? number}
                                onClick={() => navigate(`/watch/anime/${animeId}?e=${number}`)}
                                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left text-sm text-white transition hover:bg-white/10"
                            >
                                <div className="font-medium">EP {number}</div>
                                <div className="truncate text-xs text-white/60">{ep.title || ep.name || "Episode"}</div>
                            </button>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
