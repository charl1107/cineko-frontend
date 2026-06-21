// Direct manga API client — calls VITE_MANGA_API_URL directly (backend-henna-zeta-50)

const MANGA_API = (import.meta.env.VITE_MANGA_API_URL || "https://backend-henna-zeta-50.vercel.app/api/v1").replace(/\/$/, "")
const DEFAULT_SOURCE = "mangafreak"

// Provider config — display labels vs API keys
// NOTE: Only include providers the backend actually supports.
//       "mangasee" returns "Scraper not found" — removed.
export const MANGA_PROVIDERS = [
    { key: "mangafreak", label: "Manga 1" },
] as const

export type MangaProvider = (typeof MANGA_PROVIDERS)[number]["key"]

function apiUrl(path: string, params?: Record<string, string>): string {
    const url = new URL(`${MANGA_API}${path}`)
    if (params) {
        Object.entries(params).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v)
        })
    }
    return url.toString()
}

async function fetchJson<T>(url: string): Promise<T> {
    const res = await fetch(url, { method: "GET" })
    if (!res.ok) {
        const body = await res.text().catch(() => "")
        throw new Error(`API ${res.status}: ${res.statusText}${body ? " — " + body.slice(0, 200) : ""}`)
    }
    return res.json() as Promise<T>
}

// ── Raw API types ──────────────────────────────────────────────
interface RawManga {
    id: string
    title: string
    thumbnail?: string
    url: string
    description?: string
    status?: string
    author?: string
    artist?: string
    genre?: string
}

interface RawChapter {
    id: string
    name: string
    url: string
    dateUpload?: number
}

interface RawPage {
    index: number
    imageUrl: string
}

// ── Normalized types ───────────────────────────────────────────
export interface MangaItem {
    id: string
    title: string
    image: string
    rating?: number
    year?: number
    isNsfw: boolean
}

export interface MangaPaginatedResponse {
    page: number
    results: MangaItem[]
    total_results: number
    total_pages: number
    hasNextPage?: boolean
}

// ── Normalization ──────────────────────────────────────────────
function normalizeItem(raw: RawManga): MangaItem {
    return {
        id: raw.url || raw.id || "",
        title: raw.title || "Untitled",
        image: raw.thumbnail || "/favicon.svg",
        rating: 0,
        year: 0,
        isNsfw: false,
    }
}

function normalizeResponse(data: { mangas?: RawManga[]; page?: number; total_pages?: number }): MangaPaginatedResponse {
    const mangas = data.mangas || []
    return {
        page: data.page || 1,
        results: mangas.map(normalizeItem),
        total_results: mangas.length,
        total_pages: data.total_pages || 1,
        hasNextPage: mangas.length > 0,
    }
}

// ── API functions ──────────────────────────────────────────────
export function mangaApi(source: string = DEFAULT_SOURCE) {
    return {
        getPopular: (page = 1) =>
            fetchJson<{ mangas: RawManga[]; page?: number; total_pages?: number }>(
                apiUrl("/manga/popular", { source, page: String(page) })
            ).then(normalizeResponse),

        getLatest: (page = 1) =>
            fetchJson<{ mangas: RawManga[]; page?: number; total_pages?: number }>(
                apiUrl("/manga/latest", { source, page: String(page) })
            ).then(normalizeResponse),

        search: (query: string, page = 1) =>
            fetchJson<{ mangas: RawManga[]; page?: number; total_pages?: number }>(
                apiUrl("/manga/search", { q: query, source, page: String(page) })
            ).then(normalizeResponse),

        getDetails: (mangaUrl: string) =>
            fetchJson<RawManga>(
                apiUrl("/manga/details", { source, mangaUrl: mangaUrl })
            ),

        getChapters: (mangaUrl: string) =>
            fetchJson<RawChapter[]>(
                apiUrl("/manga/chapters", { source, mangaUrl: mangaUrl })
            ),

        getPages: (chapterUrl: string) =>
            fetchJson<{ pages: RawPage[]; total: number }>(
                apiUrl("/manga/pages", { source, chapterUrl: chapterUrl })
            ),
    }
}

// ── Image proxy ───────────────────────────────────────────────
export function mangaImageProxy(url: string): string {
    const proxyUrl = (import.meta.env.VITE_MANGA_PROXY_URL || import.meta.env.VITE_PROXY_URL || "").trim()
    if (!proxyUrl) return url
    const hasScheme = proxyUrl.startsWith("http://") || proxyUrl.startsWith("https://")
    const base = hasScheme ? proxyUrl : `${window.location.origin}${proxyUrl}`
    return `${base}/?url=${encodeURIComponent(url)}`
}
