export type MediaType = "movie" | "tv" | "anime" | "hentai" | "jav"

export interface MediaDrawerPayload {
    type: MediaType
    id: string | number
}

export interface MediaDrawerContextType {
    stack: MediaDrawerPayload[]
    open: (payload: MediaDrawerPayload) => void
    close: () => void
    closeAll: () => void
    isVisible: boolean
}