import { useState, useCallback, useEffect } from "react"

export const MANGA_PROVIDERS = [
    { key: "mangafreak", label: "Manga 1" },
    { key: "mangasee", label: "Manga 2" },
    { key: "mangahub", label: "Manhua 1" },
    { key: "readm", label: "Manhua 2" },
] as const

export type MangaProvider = (typeof MANGA_PROVIDERS)[number]["key"]

const STORAGE_KEY = "streamflix_manga_source"

const DEFAULT_SOURCE: MangaProvider = "mangafreak"

function getStoredSource(): MangaProvider {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored && MANGA_PROVIDERS.some((p) => p.key === stored)) {
            return stored as MangaProvider
        }
    } catch {
        // localStorage not available
    }
    return DEFAULT_SOURCE
}

export function useMangaSource() {
    const [source, setSourceState] = useState<MangaProvider>(getStoredSource)

    const setSource = useCallback((newSource: MangaProvider) => {
        setSourceState(newSource)
        try {
            localStorage.setItem(STORAGE_KEY, newSource)
        } catch {
            // localStorage not available
        }
    }, [])

    useEffect(() => {
        setSourceState(getStoredSource())
    }, [])

    return { source, setSource }
}
