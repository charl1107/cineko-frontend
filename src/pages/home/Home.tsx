import { useTmdb } from "@/hooks/use-tmdb"
import { HeroCarousel } from "@/components/media/HeroCarousel/HeroCarousel"
import { HeroFade } from "@/components/media/HeroCarousel/HeroFade"
import { MovieRail, TvRail } from "@/components/media/MediaRail/TypedRails.tsx"
import { usePageTitle } from "@/hooks/use-page-title"

export function HomePage() {
    usePageTitle("Cineko — Your Open Cinema", "/")
    const tmdb = useTmdb()

    return (
        <div className="min-h-screen overflow-hidden">
            <HeroCarousel tmdb={tmdb} fetcher={() => Promise.all([tmdb.movie_lists.now_playing(), tmdb.tv_lists.popular()])} />

            <HeroFade />

            <section className="flex flex-col gap-8 bg-background p-8">
                <MovieRail title="Popular Movies" fetcher={() => tmdb.movie_lists.popular({})} />

                <TvRail title="Trending TV Shows" fetcher={() => tmdb.tv_lists.popular({})} />

                <MovieRail title="Top Rated Movies" fetcher={() => tmdb.movie_lists.top_rated()} />
            </section>
        </div>
    )
}

export default HomePage
