import React, { useMemo } from "react"
import { TmdbContext } from "@/hooks/use-tmdb"
import { StreamflixAdapter } from "@/lib/streamflix-adapter.ts"

export function TMDBProvider({ children }: { children: React.ReactNode }) {
    const tmdb = useMemo(() => new StreamflixAdapter(), [])

    return <TmdbContext.Provider value={{ tmdb }}>{children}</TmdbContext.Provider>
}
