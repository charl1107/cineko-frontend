import React, { createContext, useContext, useState, useCallback, useMemo } from "react"
import type { UnifiedMedia } from "../types/media.types"

interface PlayerState {
    media: UnifiedMedia | null
    error?: string
    isLoading: boolean
}

interface MediaWatchContextType {
    state: PlayerState
    setMedia: (media: UnifiedMedia | null) => void
    setError: (error?: string) => void
    setIsLoading: (isLoading: boolean) => void
}

const MediaWatchContext = createContext<MediaWatchContextType | null>(null)

export function MediaWatchProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<PlayerState>({
        media: null,
        isLoading: true,
    })

    const setMedia = useCallback((media: UnifiedMedia | null) => {
        setState((prev) => ({ ...prev, media, isLoading: false }))
    }, [])

    const setError = useCallback((error?: string) => {
        setState((prev) => ({ ...prev, error, isLoading: false }))
    }, [])

    const setIsLoading = useCallback((isLoading: boolean) => {
        setState((prev) => ({ ...prev, isLoading }))
    }, [])

    const value = useMemo(
        () => ({ state, setMedia, setError, setIsLoading }),
        [state, setMedia, setIsLoading, setError]
    )

    return <MediaWatchContext.Provider value={value}>{children}</MediaWatchContext.Provider>
}

export function useMediaWatchContext() {
    const context = useContext(MediaWatchContext)
    if (!context) {
        throw new Error("useMediaWatchContext must be used within MediaWatchProvider")
    }
    return context
}
