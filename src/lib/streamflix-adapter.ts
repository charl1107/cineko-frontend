// Streamflix API adapter – calls the streamflix backend
// Normalizes responses from multiple scraper backends into a common flat format.

const API_BASE = import.meta.env.VITE_API_URL || "/api";

// ── Types ──────────────────────────────────────────────────────────
interface NormalizedItem {
    id: string | number;
    title: string;
    image: string;
    backdrop?: string;
    overview?: string;
    rating?: number;
    year?: number;
    type?: string;
    [key: string]: unknown;
}

interface NormalizedResponse {
    page: number;
    results: NormalizedItem[];
    total_results: number;
    total_pages: number;
}

type TmdbListOptions = Record<string, string | number | boolean | null | undefined>;

// ── Helpers ────────────────────────────────────────────────────────
function api(path: string, params?: Record<string, string>): Promise<unknown> {
    const base = API_BASE.startsWith("http") ? API_BASE : `${window.location.origin}${API_BASE}`;
    const url = new URL(`${base}${path}`);
    // Default to English; backend will fall back if not provided
    url.searchParams.set("language", "en-US");
    if (params) {
        Object.entries(params).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
        });
    }
    return fetch(url.toString()).then((r) => {
        if (!r.ok) throw new Error(`Fetch ${path} failed: ${r.status}`);
        return r.json();
    });
}

function toQueryParams(opts?: TmdbListOptions): Record<string, string> {
    if (!opts) return {};

    const params: Record<string, string> = {};

    Object.entries(opts).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") return;
        params[key] = String(value);
    });

    if (params.with_genres && !params.genre) {
        params.genre = params.with_genres;
        delete params.with_genres;
    }

    if (params.time_window && !params.window) {
        params.window = params.time_window;
        delete params.time_window;
    }

    return params;
}

function appendToResponse(value?: string | string[]): string {
    if (!value) return "";
    return Array.isArray(value) ? value.join(",") : value;
}

function normalizeImage(item: Record<string, unknown>): string {
    return (
        (typeof item.poster === "string" ? item.poster : null) ??
        (typeof item.poster_path === "string" ? item.poster_path : null) ??
        (typeof item.image === "string" ? item.image : null) ??
        (typeof item.thumbnail === "string" ? item.thumbnail : null) ??
        (typeof item.banner === "string" ? item.banner : null) ??
        (typeof item.backdrop === "string" ? item.backdrop : null) ??
        (typeof item.backdrop_path === "string" ? item.backdrop_path : null) ??
        "/favicon.svg"
    );
}

function normalizeBackdrop(item: Record<string, unknown>): string {
    return (
        (typeof item.backdrop === "string" ? item.backdrop : null) ??
        (typeof item.backdrop_path === "string" ? item.backdrop_path : null) ??
        normalizeImage(item)
    );
}

function normalizeItem(raw: unknown): NormalizedItem {
    if (!raw || typeof raw !== "object") {
        return { id: 0, title: "Untitled", image: "/favicon.svg" };
    }
    const item = raw as Record<string, unknown>;
    const title =
        (typeof item.title === "string" ? item.title : null) ??
        (typeof item.name === "string" ? item.name : null) ??
        "Untitled";

    const year =
        (typeof item.year === "number" ? item.year : null) ??
        (typeof item.release_year === "number" ? item.release_year : null) ??
        (typeof item.seasonYear === "number" ? item.seasonYear : null) ??
        (typeof item.date === "string" ? new Date(item.date).getFullYear() : null) ??
        (typeof item.release_date === "string"
            ? new Date(item.release_date).getFullYear()
            : typeof item.first_air_date === "string"
                ? new Date(item.first_air_date).getFullYear()
                : null) ??
        0;

    return {
        id: (item.id as string | number) ?? 0,
        title,
        image: normalizeImage(item),
        backdrop: normalizeBackdrop(item),
        overview: typeof item.overview === "string" ? item.overview : typeof item.description === "string" ? item.description : typeof item.synopsis === "string" ? item.synopsis : undefined,
        rating: Number(item.vote_average ?? item.rating ?? item.score ?? 0),
        year,
        isNsfw: Boolean(item.isNsfw ?? item.isAdult ?? item.hentai ?? item.nsfw ?? false),
        ...item,
    };
}

function normalizeResponse(data: unknown): NormalizedResponse {
    let results: unknown[] = [];
    let page = 1;
    let total = 0;
    let totalPages = 1;

    if (data && typeof data === "object") {
        const d = data as Record<string, unknown>;
        results = (Array.isArray(d.results) ? d.results : Array.isArray(d) ? d : []) as unknown[];
        page = Number(d.page ?? d.currentPage ?? 1);
        total = Number(d.total_results ?? d.totalResults ?? d.total ?? results.length);
        totalPages = Number(d.total_pages ?? d.totalPages ?? 1);
    }

    return {
        page,
        results: results.map(normalizeItem),
        total_results: total,
        total_pages: totalPages,
    };
}

// ── TMDB-compatible paginated response (kept for backward compat) ───
export interface PaginatedResponse<T> {
    page: number;
    results: T[];
    total_results: number;
    total_pages: number;
}

// ── Adapter class ──────────────────────────────────────────────────
export class StreamflixAdapter {
    // ▼ Movies
    movie_lists = {
        now_playing: () =>
            this._tmdbList("/trending", { type: "movie", window: "week" }),
        popular: (opts?: TmdbListOptions) =>
            this._tmdbList("/discover", {
                type: "movie",
                sort_by: "popularity.desc",
                ...toQueryParams(opts),
            }),
        top_rated: (opts?: TmdbListOptions) =>
            this._tmdbList("/discover", {
                type: "movie",
                sort_by: "vote_average.desc",
                ...toQueryParams(opts),
            }),
    };

    // ▼ TV
    tv_lists = {
        popular: (opts?: TmdbListOptions) =>
            this._tmdbList("/discover", {
                type: "tv",
                sort_by: "popularity.desc",
                ...toQueryParams(opts),
            }),
        top_rated: (opts?: TmdbListOptions) =>
            this._tmdbList("/discover", {
                type: "tv",
                sort_by: "vote_average.desc",
                ...toQueryParams(opts),
            }),
    };

    // ▼ Trending
    trending = {
        movies: (opts?: TmdbListOptions) =>
            this._tmdbList("/trending", {
                type: "movie",
                window: "week",
                ...toQueryParams(opts),
            }),
        tv: (opts?: TmdbListOptions) =>
            this._tmdbList("/trending", {
                type: "tv",
                window: "week",
                ...toQueryParams(opts),
            }),
    };

    // ▼ Details
    discover = {
        movie: (opts?: TmdbListOptions) =>
            this._tmdbList("/discover", {
                type: "movie",
                sort_by: "popularity.desc",
                ...toQueryParams(opts),
            }),
        tv: (opts?: TmdbListOptions) =>
            this._tmdbList("/discover", {
                type: "tv",
                sort_by: "popularity.desc",
                ...toQueryParams(opts),
            }),
    };

    genres = {
        movie_list: () => api("/genres", { type: "movie" }) as Promise<{ genres: Array<{ id: number; name: string }> }>,
        tv_list: () => api("/genres", { type: "tv" }) as Promise<{ genres: Array<{ id: number; name: string }> }>,
    };

    movies = {
        details: (opts: { movie_id: number; append_to_response?: string | string[] } = { movie_id: 0 }) =>
            api(`/movie/${opts.movie_id}`, {
                append_to_response: appendToResponse(opts.append_to_response),
                include_image_language: "en,null",
            }).catch(() => ({
                id: opts.movie_id,
                title: "",
                overview: "",
                poster_path: null,
                backdrop_path: null,
                release_date: "",
                vote_average: 0,
                runtime: 0,
                images: { logos: [], backdrops: [], posters: [] },
            })),
    };

    tv_series = {
        details: (opts: { series_id: number; append_to_response?: string | string[] } = { series_id: 0 }) =>
            api(`/tv/${opts.series_id}`, {
                append_to_response: appendToResponse(opts.append_to_response),
                include_image_language: "en,null",
            }).catch(() => ({
                id: opts.series_id,
                name: "",
                overview: "",
                poster_path: null,
                backdrop_path: null,
                first_air_date: "",
                vote_average: 0,
                episode_run_time: [],
                images: { logos: [], backdrops: [], posters: [] },
            })),
    };

    tv_seasons = {
        details: (opts: { series_id: number; season_number: number }) =>
            api(`/tv/${opts.series_id}/season/${opts.season_number}`) as Promise<Record<string, unknown>>,
    };

    tv_episodes = {
        details: async (opts: { series_id: number; season_number: number; episode_number: number }) => {
            const season = (await api(`/tv/${opts.series_id}/season/${opts.season_number}`)) as Record<string, unknown>;
            const episodes = Array.isArray(season.episodes) ? (season.episodes as Record<string, unknown>[]) : [];
            const episode = episodes.find((item) => Number(item.episode_number) === opts.episode_number);

            if (!episode) {
                throw new Error(`Episode S${opts.season_number}E${opts.episode_number} was not found`);
            }

            return episode;
        },
    };

    search = {
        multi: (opts: { query: string; page?: string | number }) =>
            this._tmdbList("/search", {
                type: "multi",
                q: opts.query,
                ...(opts.page ? { page: String(opts.page) } : {}),
            }),
    };

    // ▼ Anime (awit)
    anime_lists = {
        trending: () => api("/awit/trending").then(normalizeResponse),
        popular: () => api("/awit/popular").then(normalizeResponse),
        recent: () => api("/awit/recent").then(normalizeResponse),
    };

    anime = {
        search: (query: string, page = "1") =>
            api("/awit/search", { query, page }).then(normalizeResponse),
        info: (id: string | number) => api(`/awit/info/${id}`) as Promise<unknown>,
        episodes: (id: string | number) => api(`/awit/episodes/${id}`) as Promise<unknown>,
        watch: (params: Record<string, string>) =>
            api(`/awit/watch`, params) as Promise<unknown>,
    };

    // ▼ Hentai
    hentai_lists = {
        recent: () => api("/hentaitv/recent").then(normalizeResponse),
        trending: () => api("/hentaitv/trending").then(normalizeResponse),
    };

    hentai = {
        search: (query: string, page = "1") =>
            api(`/hentaitv/search/${encodeURIComponent(query)}/${page}`).then(normalizeResponse),
        info: (id: string | number) => api(`/hentaitv/info/${id}`) as Promise<unknown>,
        watch: (id: string | number) => api(`/hentaitv/watch/${id}`) as Promise<unknown>,
    };

    // ▼ JAV
    jav_lists = {
        recent: (page = "1") => api(`/jav/recent/${page}`).then(normalizeResponse),
        trending: (page = "1") => api(`/jav/trending/${page}`).then(normalizeResponse),
        featured: (page = "1") => api(`/jav/featured/${page}`).then(normalizeResponse),
    };

    jav = {
        search: (query: string, page = "1") =>
            api(`/jav/search/${encodeURIComponent(query)}/${page}`).then(normalizeResponse),
        info: (id: string | number) => api(`/jav/info/${id}`) as Promise<unknown>,
        watch: (id: string | number, server?: string) =>
            api(`/jav/watch/${id}${server ? `/${server}` : ""}`) as Promise<unknown>,
    };

    // ▼ Manga
    private _mangaNormalize(data: unknown): PaginatedResponse<Record<string, unknown>> {
        const d = data as Record<string, unknown>;
        const mangas = Array.isArray(d.mangas) ? d.mangas : Array.isArray(d.results) ? d.results : Array.isArray(d.data) ? d.data : [];
        const results = mangas.map(normalizeItem);
        return {
            page: Number(d.page ?? 1),
            results,
            total_results: Number(d.total_results ?? d.total ?? results.length),
            total_pages: Number(d.total_pages ?? 1),
        };
    }

    manga_lists = {
        latest: () => api("/manga/latest").then((r) => this._mangaNormalize(r)),
        popular: () => api("/manga/popular").then((r) => this._mangaNormalize(r)),
    };

    manga = {
        search: (query: string, page = "1") =>
            api("/manga/search", { q: query, page }).then((r) => this._mangaNormalize(r)),
        details: (params?: Record<string, string>) => api("/manga/details", params) as Promise<unknown>,
        chapters: (params?: Record<string, string>) => api("/manga/chapters", params) as Promise<unknown>,
        pages: (params?: Record<string, string>) => api("/manga/pages", params) as Promise<unknown>,
    };

    // ── Internal helper for legacy movie/TV lists ──
    private async _tmdbList(path: string, params?: Record<string, string>): Promise<PaginatedResponse<Record<string, unknown>>> {
        const data = (await api(path, params)) as Record<string, unknown>;
        const results = Array.isArray(data?.results) ? (data.results as Record<string, unknown>[]) : Array.isArray(data) ? (data as Record<string, unknown>[]) : [];
        return {
            page: Number(data?.page ?? 1),
            results,
            total_results: Number(data?.total_results ?? data?.total ?? results.length),
            total_pages: Number(data?.total_pages ?? 1),
        };
    }
}

export const streamflixApi = new StreamflixAdapter();
