import { useTmdb } from "@/hooks/use-tmdb"
import { HeroCarousel } from "@/components/media/HeroCarousel/HeroCarousel"
import { HeroFade } from "@/components/media/HeroCarousel/HeroFade"
import { MovieRail } from "@/components/media/MediaRail/TypedRails.tsx"
import { useEffect, useState } from "react"
import type { Genre, TrendingParams } from "@lorenzopant/tmdb"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx"
import { useTranslation } from "react-i18next"
import { usePageTitle } from "@/hooks/use-page-title"

export default function Movies() {
    const { t } = useTranslation("common")
    usePageTitle(`${t("movie.plural")} — Cineko`, "/movies")
    const tmdb = useTmdb()
    const [trendingRange, setTrendingRange] = useState<TrendingParams>({ time_window: "day" })
    const [genres, setGenres] = useState<Genre[]>([])
    const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null)

    useEffect(() => {
        let mounted = true

        async function loadGenres() {
            try {
                const data = await tmdb.genres.movie_list()
                if (mounted) {
                    setGenres(data.genres)
                    setSelectedGenre(data.genres[0])
                }
            } catch (e) {
                console.error(e)
            }
        }

        loadGenres()

        return () => {
            mounted = false
        }
    }, [tmdb.genres])

    return (
        <div className="min-h-screen overflow-hidden">
            <HeroCarousel tmdb={tmdb} fetcher={() => Promise.all([tmdb.movie_lists.now_playing()])} />

            <HeroFade />

            <section className="flex flex-col gap-8 bg-background p-8">
                <MovieRail
                    title={
                        <div className={"flex items-center justify-between"}>
                            <h2 className="text-2xl font-semibold">{t("trending")} {t("movie.plural")}</h2>
                            <div className="ml-4 flex items-center gap-2">
                                <Button onClick={() => setTrendingRange({ time_window: "day" })} variant={trendingRange.time_window === "day" ? "default" : "secondary"}>
                                    {t("today")}
                                </Button>
                                <Button onClick={() => setTrendingRange({ time_window: "week" })} variant={trendingRange.time_window === "week" ? "default" : "secondary"}>
                                    {t("thisWeek")}
                                </Button>
                            </div>
                        </div>
                    }
                    fetcher={() => tmdb.trending.movies(trendingRange)}
                />

                <MovieRail
                    title={
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-semibold">{selectedGenre ? `${selectedGenre.name} ${t("movie.plural")}` : t("selectGenre")}</h2>

                            <Select
                                value={selectedGenre?.id?.toString()}
                                onValueChange={(value) => {
                                    const genre = genres.find((g) => g.id.toString() === value)

                                    if (genre) {
                                        setSelectedGenre(genre)
                                    }
                                }}
                            >
                                <SelectTrigger className="w-55">
                                    <SelectValue placeholder={t("selectGenre")} />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectGroup>
                                        {genres.map((genre) => (
                                            <SelectItem key={genre.id} value={genre.id.toString()}>
                                                {genre.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    }
                    fetcher={() => tmdb.discover.movie({ with_genres: selectedGenre?.id })}
                />

                <MovieRail title={`${t("popular")} ${t("movie.plural")}`} fetcher={() => tmdb.movie_lists.popular({})} />

                <MovieRail title={`${t("topRated")} ${t("movie.plural")}`} fetcher={() => tmdb.movie_lists.top_rated()} />
            </section>
        </div>
    )
}
