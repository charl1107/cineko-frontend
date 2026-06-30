import { useTmdb } from "@/hooks/use-tmdb"
import { GenericGrid } from "@/components/media/GenericCard.tsx"
import { useTranslation } from "react-i18next"
import { usePageTitle } from "@/hooks/use-page-title"

export default function Anime() {
    const { t } = useTranslation("common")
    usePageTitle(`${t("anime.plural")} — Cineko`, "/anime")
    const tmdb = useTmdb()

    return (
        <div className="min-h-screen overflow-hidden">
            <section className="relative flex h-[40vh] items-end overflow-hidden bg-muted">
                <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />
                <div className="relative z-10 w-full p-8 pb-4">
                    <h1 className="text-4xl font-bold">{t("anime.plural")}</h1>
                    <p className="mt-2 text-muted-foreground">{t("discoverTrending")}</p>
                </div>
            </section>

            <section className="flex flex-col gap-8 bg-background p-8">
                <GenericGrid title={`${t("trending")} ${t("anime.plural")}`} fetcher={() => tmdb.anime_lists.trending()} type="anime" />
                <GenericGrid title={`${t("popular")} ${t("anime.plural")}`} fetcher={() => tmdb.anime_lists.popular()} type="anime" />
                <GenericGrid title={`${t("recent")} ${t("anime.plural")}`} fetcher={() => tmdb.anime_lists.recent()} type="anime" />
            </section>
        </div>
    )
}
