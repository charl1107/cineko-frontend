// Generic card that works with any normalized media type
import * as React from "react"
import { Card, CardContent } from "@/components/ui/card.tsx"
import { cn } from "@/lib/utils.ts"
import { useMediaDrawer } from "@/components/media/drawer/hooks/useMediaDrawer"
import { StarRating } from "@/components/media/StarRating"

export type GenericMediaType = "movie" | "tv" | "anime" | "hentai" | "jav"

export interface GenericCardProps {
    id: string | number
    title: string
    image: string
    type: GenericMediaType
    rating?: number
    year?: number
    className?: string
}

export const GenericCard = React.forwardRef<HTMLDivElement, GenericCardProps>(
    ({ id, title, image, type, rating, year, className }, ref) => {
        const { open } = useMediaDrawer()

        return (
            <Card
                ref={ref}
                className={cn("group overflow-hidden border-none py-0 transition-all", className)}
                onClick={() => open({ type, id })}
            >
                <CardContent className="p-0">
                    <div className="relative overflow-hidden rounded-md bg-muted w-full" style={{ aspectRatio: "2 / 3" }}>
                        <img
                            src={image}
                            alt={title}
                            className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.08]"
                            loading="lazy"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = "/favicon.svg"
                            }}
                        />
                        <div className="pointer-events-none absolute inset-0 flex items-end opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
                            <div className="relative z-10 w-full p-3 text-white">
                                <div className="text-sm leading-tight font-semibold line-clamp-2">{title}</div>
                                <div className="mt-1 flex w-full justify-between text-xs font-medium">
                                    {rating ? <StarRating rating={rating} /> : <span />}
                                    {year ? <span>{year}</span> : <span />}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Always-visible title below image */}
                    <div className="px-1 pt-2 pb-1">
                        <div className="text-xs font-medium line-clamp-2 leading-tight">{title}</div>
                    </div>
                </CardContent>
            </Card>
        )
    }
)
GenericCard.displayName = "GenericCard"

// Grid version
export interface GenericGridProps {
    title: React.ReactNode | string
    fetcher: () => Promise<{ results: { id: string | number; title: string; image: string; rating?: number; year?: number; isNsfw?: boolean }[] }>
    type: GenericMediaType
    className?: string
    hideNsfw?: boolean
}

export function GenericGrid({ title, fetcher, type, className, hideNsfw }: GenericGridProps) {
    const [items, setItems] = React.useState<Awaited<ReturnType<typeof fetcher>>["results"]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)

    React.useEffect(() => {
        let mounted = true
        setIsLoading(true)
        setError(null)
        fetcher()
            .then((data) => {
                if (!mounted) return
                const results = data.results || []
                if (hideNsfw) {
                    setItems(results.filter((item) => !item.isNsfw))
                } else {
                    setItems(results)
                }
            })
            .catch((err) => {
                if (!mounted) return
                setError(err instanceof Error ? err.message : "Failed to load")
                setItems([])
            })
            .finally(() => setIsLoading(false))
        return () => { mounted = false }
    }, [fetcher, hideNsfw])

    if (error) {
        return (
            <section className={cn("space-y-4", className)}>
                {typeof title === "string" ? <h2 className="text-2xl font-semibold">{title}</h2> : title}
                <div className="text-sm text-destructive">Error: {error}</div>
            </section>
        )
    }

    if (isLoading) {
        return (
            <section className={cn("space-y-4", className)}>
                {typeof title === "string" ? <h2 className="text-2xl font-semibold">{title}</h2> : title}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="w-full animate-pulse rounded-md bg-muted" style={{ aspectRatio: "2 / 3" }} />
                    ))}
                </div>
            </section>
        )
    }

    if (items.length === 0) {
        return (
            <section className={cn("space-y-4", className)}>
                {typeof title === "string" ? <h2 className="text-2xl font-semibold">{title}</h2> : title}
                <p className="text-sm text-muted-foreground">No items found.</p>
            </section>
        )
    }

    return (
        <section className={cn("space-y-4", className)}>
            {typeof title === "string" ? <h2 className="text-2xl font-semibold">{title}</h2> : title}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {items.map((item) => (
                    <GenericCard
                        key={String(item.id)}
                        id={item.id}
                        title={item.title}
                        image={item.image}
                        type={type}
                        rating={item.rating}
                        year={item.year}
                    />
                ))}
            </div>
        </section>
    )
}
