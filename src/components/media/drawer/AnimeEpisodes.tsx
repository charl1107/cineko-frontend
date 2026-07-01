import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTmdb } from "@/hooks/use-tmdb"
import { useMediaDrawer } from "./hooks/useMediaDrawer"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { fetchAniListRelations, buildSeasonList, type SeasonItem } from "@/lib/anilist"
import { lockLandscapeAndNavigate } from "@/lib/landscape-navigate"

interface AnimeEpisodeItem {
  id?: string | number
  number?: number
  episode?: number
  title?: string
  name?: string
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
  const { open } = useMediaDrawer()
  const [episodes, setEpisodes] = useState<AnimeEpisodeItem[]>([])
  const [allSeasons, setAllSeasons] = useState<SeasonItem[]>([])
  const [hasSeasonDropdown, setHasSeasonDropdown] = useState(false)
  const [selectedSeason, setSelectedSeason] = useState('1')
  const [rangeValue, setRangeValue] = useState('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    tmdb.anime
      .episodes(animeId)
      .then(async (data) => {
        if (cancelled) return
        const d = data as Record<string, unknown>
        const list = (Array.isArray(d.episodes) ? d.episodes : d.results) as AnimeEpisodeItem[]
        const media = (d.media || d.anime || {}) as Record<string, unknown>

        setEpisodes((Array.isArray(list) ? list : []).filter((ep) => ep))

        const currentMalId = (media.mal_id || media.malId || media.idMal) as string | undefined
        let seasons: SeasonItem[] = []

        if (currentMalId) {
          try {
            const aniData = await fetchAniListRelations(currentMalId)
            const title = (media.title || media.name || "") as string
            seasons = buildSeasonList(aniData, title)
          } catch {
            // AniList call failed — ignore
          }
        }

        const apiSeasons = (d.seasons as Array<{ number: number; name: string; isCurrent?: boolean; episodes?: AnimeEpisodeItem[] }>) || []
        if (apiSeasons.length > 1) {
          setAllSeasons(apiSeasons.map(s => ({ ...s, relation: s.isCurrent ? "CURRENT" : "OTHER" } as SeasonItem)))
          setHasSeasonDropdown(true)
        } else if (seasons.length > 1) {
          setAllSeasons(seasons)
          setHasSeasonDropdown(true)
          const current = seasons.find(s => s.isCurrent)
          setSelectedSeason(String(current?.number || 1))
        } else {
          setAllSeasons([])
          setHasSeasonDropdown(false)
        }

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

  if (!episodes.length && !allSeasons.length) return null

  const handleSeasonChange = (value: string) => {
    const season = allSeasons.find((s) => String(s.number) === value)
    if (!season || season.isCurrent) return
    if (!season.name) return

    // Search Anikoto by title and open the first match
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
          open({ type: 'anime', id: String(match.id) })
        }
      })
      .catch(() => {
        // Search failed — silently ignore
      })
  }

  const ranges = getRanges(episodes.length)

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-semibold">Episodes</h3>

          {hasSeasonDropdown && allSeasons.length > 1 && (
            <Select value={selectedSeason} onValueChange={handleSeasonChange}>
              <SelectTrigger className="w-40 h-8 text-xs">
                <SelectValue placeholder="Season" />
              </SelectTrigger>
              <SelectContent>
                {allSeasons.map((s) => (
                  <SelectItem key={s.number} value={String(s.number)}>
                    {s.name}{s.isCurrent ? ' (Current)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {(!hasSeasonDropdown || allSeasons.length <= 1) && ranges.length > 1 && (
            <Select value={rangeValue} onValueChange={setRangeValue}>
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue placeholder="Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {ranges.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <span className="text-sm text-muted-foreground">
          {episodes.length} / {episodes.length}
        </span>
      </div>

      <div className="h-100 overflow-y-auto pr-2">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {episodes.map((ep) => {
            const number = ep.number ?? ep.episode ?? 0
            return (
              <button
                key={ep.id ?? number}
                onClick={() => lockLandscapeAndNavigate(navigate, `/watch/anime/${animeId}?e=${number}`)}
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
