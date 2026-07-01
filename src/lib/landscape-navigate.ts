import type { NavigateFunction } from "react-router-dom"

const isPortraitMobile = () => {
    if (typeof window === "undefined") return false
    return window.innerWidth < 768 && window.innerHeight > window.innerWidth
}

export async function lockLandscape() {
    try {
        const screen = window.screen as Screen & { orientation?: { lock: (type: string) => Promise<void> } }
        if (screen.orientation?.lock) {
            await screen.orientation.lock("landscape")
        }
    } catch {
        // Lock not supported or denied
    }
}

export async function lockLandscapeAndNavigate(
    navigate: NavigateFunction,
    path: string
) {
    if (isPortraitMobile()) {
        await lockLandscape()
    }
    navigate(path)
}
