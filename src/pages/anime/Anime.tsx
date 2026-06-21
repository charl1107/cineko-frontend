import { useTmdb } from "@/hooks/use-tmdb"
import { GenericGrid } from "@/components/media/GenericCard.tsx"

export default function Anime() {
    const tmdb = useTmdb()

    return (
        <div className="min-h-screen overflow-hidden">
            <section className="relative flex h-[40vh] items-end overflow-hidden bg-muted">
                <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />
                <div className="relative z-10 w-full p-8 pb-4">
                    <h1 className="text-4xl font-bold">Anime</h1>
                    <p className="mt-2 text-muted-foreground">Discover trending and popular anime series.</p>
                </div>
            </section>

            <section className="flex flex-col gap-8 bg-background p-8">
                <GenericGrid title="Trending Anime" fetcher={() => tmdb.anime_lists.trending()} type="anime" />
                <GenericGrid title="Popular Anime" fetcher={() => tmdb.anime_lists.popular()} type="anime" />
                <GenericGrid title="Recent Anime" fetcher={() => tmdb.anime_lists.recent()} type="anime" />
            </section>
        </div>
    )
}
