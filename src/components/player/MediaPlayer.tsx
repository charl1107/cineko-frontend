import { useRef, useEffect } from "react"
import { usePlayerState } from "./hooks/usePlayerState"

function buildVideasyUrl(
    type: "movie" | "tv",
    id: string,
    season?: number,
    episode?: number
): string {
    const base =
        type === "movie"
            ? `https://player.videasy.net/movie/${id}`
            : `https://player.videasy.net/tv/${id}/${season ?? 1}/${episode ?? 1}`

    const params = new URLSearchParams({
        nextEpisode: "true",
        autoplayNextEpisode: "true",
        episodeSelector: "true",
        overlay: "true",
        color: "8B5CF6",
    })

    if (type === "tv") {
        params.set("nextEpisode", "true")
        params.set("autoplayNextEpisode", "true")
        params.set("episodeSelector", "true")
    }

    return `${base}?${params.toString()}`
}

export function MediaPlayer() {
    const { media } = usePlayerState()
    const iframeRef = useRef<HTMLIFrameElement>(null)

    const videasyUrl =
        media?.id && media?.type
            ? buildVideasyUrl(media.type as "movie" | "tv", media.id, media.seasonNumber, media.episodeNumber)
            : null

    useEffect(() => {
        const iframe = iframeRef.current
        if (!iframe) return

        // Ensure the iframe's content window is focused so keyboard shortcuts (like F) work.
        // For cross-origin iframes, contentWindow.focus() is allowed as a special case.
        try {
            if (iframe.contentWindow) {
                iframe.contentWindow.focus()
            } else {
                iframe.focus()
            }
        } catch {
            // Cross-origin focus may fail silently
        }
    }, [videasyUrl])

    return (
        <div className="h-full w-full bg-black">
            {videasyUrl ? (
                <iframe
                    ref={iframeRef}
                    id="videasy-player"
                    src={videasyUrl}
                    className="block h-full w-full border-none"
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                    loading="eager"
                    title="Videasy Player"
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center text-white">
                    Loading…
                </div>
            )}
        </div>
    )
}
