import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useEffect, useState, useRef } from "react"
import { useTmdb } from "@/hooks/use-tmdb"
import { Button } from "@/components/ui/button"
import { ChevronLeft, PanelRightClose, PanelRightOpen, Maximize, Minimize } from "lucide-react"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface AnimeEpisode {
    id: string
    number: number
    title?: string
    embedUrl: string
    embedUrlSub?: string
    embedUrlDub?: string
    videasyUrl?: string
}

// Generate episode ranges like "1-100", "101-200"
function getRanges(total: number, chunkSize: number = 100): { label: string; value: string; start: number; end: number }[] {
    if (total <= 0) return []
    const ranges = []
    for (let i = 0; i < total; i += chunkSize) {
        const start = i + 1
        const end = Math.min(i + chunkSize, total)
        ranges.push({ label: `${start}-${end}`, value: `${start}-${end}`, start, end })
    }
    return ranges
}

function isInRange(episodeNum: number, rangeValue: string): boolean  {
    if (rangeValue === "all") return true
    const [startStr, endStr] = rangeValue.split("-")
    const start = parseInt(startStr, 10)
    const end = parseInt(endStr, 10)
    return episodeNum >= start && episodeNum <= end
}

function EpisodeRangeSelect({ episodes, value, onChange }: { episodes: number; value: string; onChange: (val: string) => void }) {
    const ranges = getRanges(episodes)
    if (ranges.length <= 1) {
        return <span className="text-xs text-white/50">All episodes</span>
    }
    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="w-28 h-8 border-white/10 text-xs text-white">
                <SelectValue placeholder="Range" />
            </SelectTrigger>
            <SelectContent>
                {ranges.map(r => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}

export default function WatchAnimePage() {
    const { id } = useParams<{ id: string }>()
    const [searchParams, setCtx] = useSearchParams()
    const navigate = useNavigate()
    const tmdb = useTmdb()
    const listRef = useRef<HTMLDivElement>(null)

    const [episodes, setEpisodes] = useState<AnimeEpisode[]>([])
    const [animeTitle, setAnimeTitle] = useState<string>("")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [rangeValue, setRangeValue] = useState<string>("all")
    const [theaterMode, setTheaterMode] = useState(false)
    const [provider, setProvider] = useState<"megaplay" | "videasy">("megaplay")

    const currentEpisode = parseInt(searchParams.get("e") || "1", 10)

    // Auto-open sidebar in theater mode
    useEffect(() => {
        if (theaterMode) {
            setSidebarOpen(true)
        }
    }, [theaterMode])

    // Auto-select range containing current episode
    useEffect(() => {
        if (episodes.length === 0) return
        const ranges = getRanges(episodes.length)
        if (ranges.length <= 1) {
            setRangeValue("all")
            return
        }
        const found = ranges.find(r => currentEpisode >= r.start && currentEpisode <= r.end)
        setRangeValue(found ? `${found.start}-${found.end}` : "all")
    }, [episodes.length, currentEpisode])

    // scroll active episode into view
    useEffect(() => {
        if (!listRef.current) return
        const active = listRef.current.querySelector("[data-active='true']")
        if (active) {
            active.scrollIntoView({ block: "nearest", behavior: "smooth" })
        }
    }, [currentEpisode])

    useEffect(() => {
        let cancelled = false
        setLoading(true)

        tmdb.anime
            .episodes(id!)
            .then((data) => {
                if (cancelled) return
                const result = (data as Record<string, unknown>) ?? {}
                const list = (Array.isArray(result.episodes)
                    ? result.episodes
                    : result.results) as AnimeEpisode[] | undefined

                setEpisodes(list?.filter((ep) => ep?.embedUrl) ?? [])
                setAnimeTitle((result.media?.title as string) || (result.anime?.title as string) || "")
                setLoading(false)
            })
            .catch((err) => {
                if (cancelled) return
                setError(err.message || "Failed to load episodes")
                setLoading(false)
            })

        return () => { cancelled = true }
    }, [id, tmdb])

    const goToEpisode = (num: number) => {
        if (num < 1) return
        searchParams.set("e", String(num))
        setCtx(searchParams)
    }

    const episode = episodes.find((ep) => ep.number === currentEpisode)

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-black">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center bg-black text-white">
                <p className="text-red-400">{error}</p>
                <Button variant="ghost" className="mt-4" onClick={() => navigate("/anime")}>
                    <ChevronLeft /> Back
                </Button>
            </div>
        )
    }

    if (episodes.length === 0) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center bg-black text-white">
                <p>No episodes available.</p>
                <Button variant="ghost" className="mt-4" onClick={() => navigate("/anime")}>
                    <ChevronLeft /> Back
                </Button>
            </div>
        )
    }

    return (
        <>
            <div className={cn(
                "flex flex-col bg-black text-white",
                theaterMode
                    ? "fixed inset-0 z-50 h-screen w-screen"
                    : "relative h-screen w-full"
            )}>
                {/* Header */}
                <div className="flex h-12 shrink-0 items-center border-b border-white/10 bg-black/90 px-4 z-10">
                    <Button variant="ghost" size="sm" onClick={() => navigate("/anime")}>
                        <ChevronLeft className="mr-1 h-4 w-4" /> Back
                    </Button>
                    <div className="ml-4 text-sm font-medium text-white/80 line-clamp-1">
                        {animeTitle}
                    </div>
                    <button
                        onClick={() => setTheaterMode((v) => !v)}
                        className="ml-auto flex items-center gap-1 rounded-md px-2 py-1 text-xs text-white/70 hover:bg-white/10 hover:text-white transition"
                        title={theaterMode ? "Exit theater mode" : "Theater mode"}
                    >
                        {theaterMode ? (
                            <Minimize className="h-4 w-4" />
                        ) : (
                            <Maximize className="h-4 w-4" />
                        )}
                        {theaterMode ? "Exit" : "Theater"}
                    </button>
                </div>

            {/* Body */}
            <div className="flex flex-1 overflow-hidden">
                {/* Player */}
                <div className="relative flex-1 bg-black">
                    {episode ? (
                        <iframe
                            src={provider === "videasy" ? episode.videasyUrl : episode.embedUrl}
                            className="block h-full w-full border-none"
                            allowFullScreen
                            allow="autoplay; encrypted-media; picture-in-picture"
                            loading="eager"
                            title={`Episode ${currentEpisode}`}
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-white">
                            Episode {currentEpisode} not found.
                        </div>
                    )}

                    {/* Toggle button — floating on right edge of player */}
                    <button
                        onClick={() => setSidebarOpen((v) => !v)}
                        className={cn(
                            "absolute right-0 top-1/2 -translate-y-1/2 flex h-10 w-8 items-center justify-center rounded-l-lg bg-white/10 text-white/80 backdrop-blur-md transition-all hover:bg-white/20",
                            sidebarOpen && "translate-x-full opacity-0 pointer-events-none"
                        )}
                        style={{ zIndex: 20 }}
                        title={sidebarOpen ? "Hide episodes" : "Show episodes"}
                    >
                        <PanelRightOpen className="h-4 w-4" />
                    </button>
                </div>

                {/* Episode panel */}
                <div
                    className={cn(
                        "flex shrink-0 flex-col h-full border-l border-white/10 bg-[#0a0a0a] transition-all duration-300 ease-in-out",
                        sidebarOpen ? "w-80 opacity-100" : "w-0 opacity-0 border-l-0"
                    )}
                >
                    <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 px-4">
                        <div className="flex items-center gap-2">
                            <EpisodeRangeSelect
                                episodes={episodes.length}
                                value={rangeValue}
                                onChange={setRangeValue}
                            />
                            <span className="text-xs text-white/50">
                                {episodes.length} eps
                            </span>
                            <Select value={provider} onValueChange={(v) => setProvider(v as "megaplay" | "videasy")}>
                                <SelectTrigger className="w-28 h-8 border-white/10 text-xs text-white">
                                    <SelectValue placeholder="Provider" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="megaplay">MegaPlay</SelectItem>
                                    <SelectItem value="videasy">Videasy</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="rounded-md p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
                            title="Close episodes"
                        >
                            <PanelRightClose className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Episode list — vertically scrollable */}
                    <div ref={listRef} className="flex-1 min-h-0 overflow-y-auto ep-scrollbar lenis-disabled p-2">
                        <div className="grid grid-cols-5 gap-1.5">
                            {episodes.filter(ep => isInRange(ep.number, rangeValue)).map((ep) => {
                                const isActive = ep.number === currentEpisode
                                return (
                                    <button
                                        key={ep.id ?? ep.number}
                                        data-active={isActive}
                                        onClick={() => goToEpisode(ep.number)}
                                        className={cn(
                                            "flex h-9 items-center justify-center rounded-md text-xs font-medium transition",
                                            isActive
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-white/10 text-white/80 hover:bg-white/20"
                                        )}
                                    >
                                        {ep.number}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile bottom panel */}
            <div className={cn(
                "flex h-28 shrink-0 flex-col border-t border-white/10 bg-[#0a0a0a]",
                theaterMode ? "hidden" : "lg:hidden"
            )}>
                <div className="flex h-8 items-center gap-2 px-2 pt-1">
                    <span className="text-xs text-white/50">{episodes.length} episodes</span>
                </div>
                <div className="flex gap-1.5 overflow-x-auto px-2 pb-2">
                    {episodes.map((ep) => {
                        const isActive = ep.number === currentEpisode
                        return (
                            <button
                                key={ep.id ?? ep.number}
                                onClick={() => goToEpisode(ep.number)}
                                className={cn(
                                    "shrink-0 rounded-md px-3.5 py-2 text-sm font-medium transition",
                                    isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-white/10 text-white hover:bg-white/20"
                                )}
                            >
                                {ep.number}
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    </>
    )
}
