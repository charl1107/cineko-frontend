import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTmdb } from "@/hooks/use-tmdb"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"

interface AnimeEpisodeItem {
    id?: string | number
    number?: number
    episode?: number
    title?: string
    name?: string
}

interface AnimeSeason {
    number: number
    name: string
    episodes: AnimeEpisodeItem[]
}

function getRanges(total: number, chunkSize: number = 100): { label: string; value: string; start: number; end: number }[] {
    if (total <= 0) return []
    const ranges: { label: string; value: string; start: number; end: number }[] = []
    for (let i = 0; i < total; i += chunkSize) {
        const start = i + 1
        const end = Math.min(i + chunkSize, total)
        ranges.push({ label: `${start}-${end}`, value: `${start}-${end}`, start, end })
    }
    return ranges
}

function isInRange(episodeNum: number, rangeValue: string): boolean {
    if (rangeValue === 'all') return true
    const [startStr, endStr] = rangeValue.split('-')
    const start = parseInt(startStr, 10)
    const end = parseInt(endStr, 10)
    return episodeNum >= start && episodeNum <= end
}

export function AnimeEpisodes({ animeId }: { animeId: string | number }) {
    const tmdb = useTmdb()
    const navigate = useNavigate()
    const [episodes, setEpisodes] = useState<AnimeEpisodeItem[]>([])
    const [seasons, setSeasons] = useState<AnimeSeason[]>([])
    const [hasSeasons, setHasSeasons] = useState(false)
    const [selectedSeason, setSelectedSeason] = useState('1')
    const [rangeValue, setRangeValue] = useState('all')
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

                const rawSeasons = (d.seasons as AnimeSeason[]) ?? []
                const detectedSeasons = Array.isArray(rawSeasons) && rawSeasons.length > 1
                setHasSeasons(!!d.hasSeasons && detectedSeasons)
                setSeasons(Array.isArray(rawSeasons) ? rawSeasons : [])

                setEpisodes(list?.filter((ep) => ep) ?? [])
                setSelectedSeason('1')
                setRangeValue('all')
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

    const displayedEpisodes = useMemo(() => {
        if (hasSeasons && seasons.length > 0) {
            const season = seasons.find((s) => String(s.number) === selectedSeason)
            return season?.episodes ?? []
        }
        return episodes.filter((ep) => isInRange(ep.number ?? ep.episode ?? 0, rangeValue))
    }, [hasSeasons, seasons, selectedSeason, episodes, rangeValue])

    const ranges = getRanges(episodes.length)

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold">Episodes</h3>

                    {hasSeasons && seasons.length > 0 && (
                        <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                            <SelectTrigger className="w-32 h-8 text-xs">
                                <SelectValue placeholder="Season" />
                            </SelectTrigger>
                            <SelectContent>
                                {seasons.map((s) => (
                                    <SelectItem key={s.number} value={String(s.number)}>
                                        {s.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}

                    {!hasSeasons && ranges.length > 1 && (
                        <Select value={rangeValue} onValueChange={setRangeValue}>
                            <SelectTrigger className="w-32 h-8 text-xs">
                                <SelectValue placeholder="Range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                {ranges.map((r) => (
                                    <SelectItem key={r.value} value={r.value}>
                                        {r.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>

                <span className="text-sm text-muted-foreground">
                    {displayedEpisodes.length} / {episodes.length}
                </span>
            </div>

            <div className="h-100 overflow-y-auto pr-2">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {displayedEpisodes.map((ep) => {
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

                {displayedEpisodes.length === 0 && (
                    <div className="flex h-20 items-center justify-center text-sm text-muted-foreground">
                        No episodes in this selection.
                    </div>
                )}
            </div>
        </section>
    )
}
