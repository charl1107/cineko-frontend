import type { CountryISO3166_1 } from "@lorenzopant/tmdb"

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p"

export function tmdbImage(path: string | null | undefined, size = "w780", fallback = "/favicon.svg"): string {
    if (!path) return fallback
    if (String(path).startsWith("http")) return path
    return `${TMDB_IMAGE_BASE}/${size}${path}`
}

export function getCountry(): CountryISO3166_1 | undefined {
    try {
        const locale = new Intl.Locale(navigator.language)
        if (locale.region) return locale.region as unknown as CountryISO3166_1
    } catch {
        // continue
    }

    const fallback = navigator.language.split("-")[1]
    if (fallback) return fallback.toUpperCase() as unknown as CountryISO3166_1

    return undefined
}
