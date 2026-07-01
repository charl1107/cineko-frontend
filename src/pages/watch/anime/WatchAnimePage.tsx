import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useEffect, useState, useRef } from "react"
import { useTmdb } from "@/hooks/use-tmdb"
import { Button } from "@/ui/button"
import { ChevronLeft, PanelRightClose, PanelRightOpen, Maximize, Minimize } from "lucide-react"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { fetchAniListRelations, buildSeasonList, type SeasonItem } from "@/lib/anilist"
import { OrientationPrompt } from "@/components/player/OrientationPrompt"
import { lockLandscapeAndNavigate } from "@/lib/landscape-navigate"

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

function isInRange(episodeNum: number, rangeValue: string): boolean {
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
  const [searchParams, setSearchParams] = useSearchParams()
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
  const [seasons, setSeasons] = useState<SeasonItem[]>([])
  const [hasSeasons, setHasSeasons] = useState(false)
  const [selectedSeason, setSelectedSeason] = useState<string>("1")

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

  // Load episodes and find seasons via AniList
  useEffect(() => {
    let cancelled = false
    setLoading(true)

    tmdb.anime
      .episodes(id!)
      .then(async (data) => {
        if (cancelled) return
        const result = (data as Record<string, unknown>) ?? {}
        const list = (Array.isArray(result.episodes)
          ? result.episodes
          : result.results) as AnimeEpisode[] | undefined

        setEpisodes(list?.filter((ep) => ep?.embedUrl) ?? [])

        const media = (result.media || result.anime || {}) as Record<string, unknown>
        const title = (media.title || media.name || "") as string
        setAnimeTitle(title)

        const currentMalId = (media.mal_id || media.malId || media.idMal) as string | undefined
        let aniSeasons: SeasonItem[] = []

        if (currentMalId) {
          try {
            const aniData = await fetchAniListRelations(currentMalId)
            aniSeasons = buildSeasonList(aniData, title)
          } catch {
            // AniList call failed — silently ignore
          }
        }

        const apiSeasons = (result.seasons as SeasonItem[]) ?? []
        let merged: SeasonItem[] = [...apiSeasons]

        for (const s of aniSeasons) {
          if (!merged.some(m => m.number === s.number)) {
            merged.push(s)
          }
        }

        merged.sort((a, b) => a.number - b.number)
        setSeasons(merged)
        setHasSeasons(merged.length > 1)

        const current = merged.find((s) => s.isCurrent)
        setSelectedSeason(current ? String(current.number) : (merged[0]?.number ? String(merged[0].number) : "1"))

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
    setSearchParams(searchParams)
  }

  const handleSeasonChange = (value: string) => {
    const season = seasons.find((s) => String(s.number) === value)
    if (!season) return
    if (season.isCurrent) {
      setSelectedSeason(value)
      return
    }
    if (!season.name) return

    // Search Anikoto by title and navigate to the best match
    tmdb.anime
      .search(season.name)
      .then((res) => {
        const results = res.results || []
        const match = results.find(
          (r) =>
            (r.title as string)?.toLowerCase().includes(season.name.toLowerCase()) ||
            (r.title as string)?.toLowerCase() === season.name.toLowerCase()
        ) || results[0]

        if (match?.id) {
          lockLandscapeAndNavigate(navigate, `/watch/anime/${match.id}?e=1`)
        }
      })
      .catch(() => {
        // Search failed — silently ignore
      })
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
      <OrientationPrompt />
      <div className={cn(
        "flex flex-col bg-black text-white",
        theaterMode
          ? "fixed inset-0 z-50 h-screen supports-[height:100dvh]:h-dvh w-screen"
          : "relative h-screen supports-[height:100dvh]:h-dvh w-full"
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

            {/* Toggle button — min 44 px touch target */}
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className={cn(
                "absolute right-0 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-l-lg bg-white/10 text-white/80 backdrop-blur-md transition-all hover:bg-white/20",
                sidebarOpen && "translate-x-full opacity-0 pointer-events-none"
              )}
              style={{ zIndex: 20 }}
              title={sidebarOpen ? "Hide episodes" : "Show episodes"}
            >
              <PanelRightOpen className="h-4 w-4" />
            </button>
          </div>

          {/* Episode panel — responsive width for small screens */}
          <div
            className={cn(
              "flex shrink-0 flex-col h-full border-l border-white/10 bg-black transition-all duration-300 ease-in-out",
              sidebarOpen ? "w-[85vw] max-w-80 opacity-100" : "w-0 opacity-0 border-l-0"
            )}
          >
            <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 px-4">
              <div className="flex items-center gap-2">
                {/* Season selector */}
                {hasSeasons && seasons.length > 1 && (
                  <Select value={selectedSeason} onValueChange={handleSeasonChange}>
                    <SelectTrigger className="w-32 h-8 text-xs text-white border-white/10">
                      <SelectValue placeholder="Season" />
                    </SelectTrigger>
                    <SelectContent>
                      {seasons.map((s) => (
                        <SelectItem key={s.number} value={String(s.number)}>
                          {s.name}{s.isCurrent ? ' (Current)' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {/* Range selector for long anime */}
                {!hasSeasons && (
                  <EpisodeRangeSelect
                    episodes={episodes.length}
                    value={rangeValue}
                    onChange={setRangeValue}
                  />
                )}

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
                className="flex h-10 w-10 items-center justify-center rounded-md text-white/60 transition hover:bg-white/10 hover:text-white"
                title="Close episodes"
              >
                <PanelRightClose className="h-4 w-4" />
              </button>
            </div>

            {/* Episode list */}
            <div ref={listRef} className="flex-1 min-h-0 overflow-y-auto ep-scrollbar lenis-disabled p2">
              <div className="grid grid-cols-5 gap-1.5">
                {episodes.filter(ep => isInRange(ep.number, rangeValue)).map((ep) => {
                  const isActive = ep.number === currentEpisode
                  return (
                    <button
                      key={ep.id ?? ep.number}
                      data-active={isActive}
                      onClick={() => goToEpisode(ep.number)}
                      className={cn(
                        "flex h-11 items-center justify-center rounded-md text-xs font-medium transition",
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
          "flex h-28 shrink-0 flex-col border-t border-white/10 bg-black",
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
