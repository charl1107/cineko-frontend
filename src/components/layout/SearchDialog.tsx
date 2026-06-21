import { useEffect, useState } from "react"
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Skeleton } from "@/components/ui/skeleton"
import { useTmdb } from "@/hooks/use-tmdb"
import { useDebouncedValue } from "@/hooks/use-debounce"
import { useSearchParams } from "react-router-dom"
import { LucideClapperboard, LucideFilter, LucidePlay, LucideTv, Sparkles } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useAppSettings } from "@/hooks/use-appsettings.ts"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group.tsx"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu.tsx"
import { useMediaDrawer } from "@/components/media/drawer/hooks/useMediaDrawer.ts"
import { StarRating } from "@/components/media/StarRating"
import { tmdbImage } from "@/lib/tmdb.utils"
type MediaFilter = "all" | "movie" | "tv" | "anime"
type SearchResult = {
    id: string | number
    media_type: Exclude<MediaFilter, "all">
    title: string
    subtitle: string
    image?: string
    rating?: number | null
}

export function SearchDialog() {
    const tmdb = useTmdb()
    const { showSearch, setShowSearch } = useAppSettings()
    const { t } = useTranslation(["searchdialog", "common"])
    const { open } = useMediaDrawer()
    const [query, setQuery] = useState("")
    const debouncedQuery = useDebouncedValue(query, 400)

    const [results, setResults] = useState<SearchResult[]>([])
    const [loading, setLoading] = useState(false)
    const [searchParams, setSearchParams] = useSearchParams()

    const [filter, setFilter] = useState<MediaFilter>("all")


    // read params
    useEffect(() => {
        const q = searchParams.get("q")
        const f = searchParams.get("type") as MediaFilter | null

        if (q) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setQuery(q)
            setShowSearch(true)
        }

        if (f === "movie" || f === "tv" || f === "anime" || f === "all") {
            setFilter(f)
        }
    }, [searchParams, setShowSearch])

    // keyboard shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const nav = navigator as Navigator & { userAgentData?: { platform: string } }

            const platform = nav.userAgentData?.platform ?? navigator.userAgent ?? ""
            const isMac = platform.toLowerCase().includes("mac")

            const modKey = isMac ? e.metaKey : e.ctrlKey

            if (modKey && e.key.toLowerCase() === "f") {
                e.preventDefault()
                setShowSearch(!showSearch)
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [showSearch, setShowSearch])

    // sync URL params
    useEffect(() => {
        if (!showSearch) return

        const params = new URLSearchParams(searchParams)

        if (query) {
            params.set("q", query)
        } else {
            params.delete("q")
        }

        if (filter !== "all") {
            params.set("type", filter)
        } else {
            params.delete("type")
        }

        setSearchParams(params, { replace: true })
    }, [query, filter, showSearch, setSearchParams, searchParams])

    // debounced search
    useEffect(() => {
        if (!debouncedQuery) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setResults([])
            return
        }

        let cancelled = false

        const fetchResults = async () => {
            setLoading(true)

            try {
                const [tmdbResults, animeResults] = await Promise.all([
                    tmdb.search.multi({ query: debouncedQuery }).catch(() => ({ results: [] })),
                    tmdb.anime.search(debouncedQuery).catch(() => ({ results: [] })),
                ])

                const mappedResults: SearchResult[] = [
                    ...tmdbResults.results
                        .filter((item: Record<string, unknown>) => item.media_type === "movie" || item.media_type === "tv")
                        .map((item: Record<string, unknown>) => ({
                            id: item.id as string | number,
                            media_type: item.media_type as "movie" | "tv",
                            title: ((item.title as string) || (item.name as string) || "Untitled"),
                            subtitle: ((item.release_date as string) || (item.first_air_date as string) || t("fallbackDate")),
                            image: item.poster_path as string | undefined,
                            rating: Number(item.vote_average ?? 0),
                        })),
                    ...animeResults.results.map((item: Record<string, unknown>) => ({
                        id: item.id as string | number,
                        media_type: "anime" as const,
                        title: (item.title as string) || (item.name as string) || "Untitled",
                        subtitle: item.year ? String(item.year) : "Anime",
                        image: item.image as string | undefined,
                        rating: Number(item.rating ?? item.score ?? 0),
                    })),
                ]

                if (!cancelled) {
                    setResults(mappedResults)
                }
            } catch (err) {
                console.error(err)
            } finally {
                if (!cancelled) {
                    setLoading(false)
                }
            }
        }

        fetchResults()

        return () => {
            cancelled = true
        }
    }, [debouncedQuery, t, tmdb])

    const handleSelect = (item: SearchResult) => {
        open({
            type: item.media_type,
            id: item.id,
        })
    }

    // filtering
    const filteredResults = results.filter((r) => {
        if (filter === "all") return true
        return r.media_type === filter
    })

    const renderItem = (item: SearchResult) => {
        const icon =
            item.media_type === "movie" ? <LucidePlay className="h-4 w-4" /> :
            item.media_type === "tv" ? <LucideTv className="h-4 w-4" /> :
            item.media_type === "anime" ? <Sparkles className="h-4 w-4" /> :
            <LucideClapperboard className="h-4 w-4" />

        return (
            <CommandItem key={`${item.media_type}-${item.id}`} value={`${item.title}-${item.media_type}-${item.id}`} onSelect={() => handleSelect(item)} className="flex items-center gap-3">
                {item.image ? (
                    <img src={tmdbImage(item.image, "w185")} alt={item.title} className="h-14 w-10 shrink-0 rounded-md object-cover" />
                ) : (
                    <div className="flex h-14 w-10 items-center justify-center rounded-md bg-muted">{icon}</div>
                )}

                <div className="flex flex-col overflow-hidden">
                    <span className="truncate text-sm font-medium">{item.title}</span>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground ring-0 outline-none focus:ring-0 focus:outline-none">
                        {item.rating ? <StarRating rating={item.rating} /> : null}

                        <span>{item.subtitle}</span>
                    </div>
                </div>
            </CommandItem>
        )
    }

    return (
        <CommandDialog
            open={showSearch}
            onOpenChange={(o) => {
                setShowSearch(o)

                if (!o) {
                    setSearchParams({}, { replace: true })
                }
            }}
            className="lenis-stopped lenis-disabled max-h-[80vh] w-[95vw] max-w-180 transition-transform sm:w-150 sm:scale-[1.05] md:w-180 md:scale-[1.20]"
        >
            <Command>
                <div className="px-2 pt-2">
                    <InputGroup>
                        <InputGroupInput placeholder={t("placeholder")} value={query} onChange={(e) => setQuery(e.target.value)} />

                        <InputGroupAddon align="inline-end">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-1 pr-1">
                                        <LucideFilter className={`h-4 w-4 ${filter !== "all" ? "text-primary" : "text-muted-foreground"}`} />
                                    </button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setFilter("all")}>
                                        <LucidePlay className="mr-2 h-4 w-4" />
                                        {t("common:all")}
                                    </DropdownMenuItem>

                                    <DropdownMenuItem onClick={() => setFilter("movie")} className={filter === "movie" ? "text-primary" : ""}>
                                        <LucideClapperboard className="mr-2 h-4 w-4" />
                                        {t("common:movie.plural")}
                                    </DropdownMenuItem>

                                    <DropdownMenuItem onClick={() => setFilter("tv")} className={filter === "tv" ? "text-primary" : ""}>
                                        <LucideTv className="mr-2 h-4 w-4" />
                                        {t("common:tvShow.plural")}
                                    </DropdownMenuItem>

                                    <DropdownMenuItem onClick={() => setFilter("anime")} className={filter === "anime" ? "text-primary" : ""}>
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        {t("common:anime.plural")}
                                    </DropdownMenuItem>

                                </DropdownMenuContent>
                            </DropdownMenu>
                        </InputGroupAddon>
                    </InputGroup>
                </div>

                <CommandList>
                    {loading && (
                        <div className="space-y-2 p-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    )}

                    {!loading && query.length === 0 && <CommandEmpty>{t("emptyIdle")}</CommandEmpty>}

                    {!loading && query.length > 0 && results.length === 0 && (
                        <CommandEmpty>
                            {t("emptyNoResults")} <span className="text-muted-foreground italic">{t("quoteAuthor")}</span>
                        </CommandEmpty>
                    )}

                    {!loading && filteredResults.length > 0 && (
                        <CommandGroup heading={filter === "movie" ? t("common:movie.plural") : filter === "tv" ? t("common:tvShow.plural") : filter === "anime" ? t("common:anime.plural") : t("common:results")}>
                            {filteredResults.map(renderItem)}
                        </CommandGroup>
                    )}
                </CommandList>
            </Command>
        </CommandDialog>
    )
}
