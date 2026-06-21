/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_TMDB_API_KEY: string
    readonly VITE_STANDALONE: boolean
    readonly VITE_MANGA_PROXY_URL?: string
    readonly VITE_MANGA_API_URL?: string
    readonly VITE_PROXY_URL?: string
    readonly NODE_ENV: "development" | "production"
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
