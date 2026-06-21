// MediaDrawerProvider.tsx
import React, { createContext, useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import type { MediaDrawerContextType, MediaDrawerPayload } from "../types/drawer.types"
// eslint-disable-next-line react-refresh/only-export-components
export const MediaDrawerContext = createContext<MediaDrawerContextType | null>(null)

function serializeMedia(payload: MediaDrawerPayload) {
    return `${payload.type}-${payload.id}`
}

const ALL_MEDIA_TYPES = new Set(["movie", "tv", "anime"])

function deserializeMedia(value: string): MediaDrawerPayload | null {
    const [type, ...rest] = value.split("-")
    const id = rest.join("-") // support IDs with hyphens

    if (!type || !id) return null
    if (!ALL_MEDIA_TYPES.has(type)) return null

    return { type, id } as MediaDrawerPayload
}

export function MediaDrawerProvider({ children }: { children: React.ReactNode }) {
    const [stack, setStack] = useState<MediaDrawerPayload[]>([])
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    const isVisible = useMemo(() => stack.length > 0, [stack])

    /**
     * OPEN
     */
    const open = useCallback((payload: MediaDrawerPayload) => {
        setStack((prev) => [...prev, payload])
    }, [])

    /**
     * CLOSE
     */
    const close = useCallback(() => {
        setStack((prev) => prev.slice(0, -1))
    }, [])

    /**
     * CLOSE ALL
     */
    const closeAll = useCallback(() => {
        setStack([])
    }, [])

    /**
     * URL -> DRAWER
     * On initial page load, open drawer from ?media=
     */
    const [hasHydratedFromUrl, setHasHydratedFromUrl] = useState(false)

    useEffect(() => {
        if (hasHydratedFromUrl) return

        const media = searchParams.get("media")

        if (!media) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setHasHydratedFromUrl(true)
            return
        }

        const payload = deserializeMedia(media)

        if (payload) {
            setStack([payload])
        }

        setHasHydratedFromUrl(true)
    }, [searchParams, hasHydratedFromUrl])

    /**
     * DRAWER -> URL
     * Sync top drawer to URL
     */
    useEffect(() => {
        const params = new URLSearchParams(window.location.search)

        const top = stack[stack.length - 1]

        if (top) {
            params.set("media", serializeMedia(top))
        } else {
            params.delete("media")
        }

        navigate(
            {
                search: params.toString(),
            },
            {
                replace: true,
            }
        )
    }, [stack, navigate])

    const value = useMemo(
        () => ({
            stack,
            open,
            close,
            closeAll,
            isVisible,
        }),
        [stack, open, close, closeAll, isVisible]
    )

    return <MediaDrawerContext.Provider value={value}>{children}</MediaDrawerContext.Provider>
}
