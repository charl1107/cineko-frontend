import { useEffect, useState, useCallback } from "react"

interface OrientationPromptState {
    showPrompt: boolean
    isLandscape: boolean
    lockOrientation: () => Promise<void>
}

const isMobile = () => {
    if (typeof navigator === "undefined") return false
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

const isPortrait = () => {
    if (typeof window === "undefined") return false
    return window.innerHeight > window.innerWidth
}

export function useOrientationPrompt(): OrientationPromptState {
    const [isLandscape, setIsLandscape] = useState(!isPortrait())
    const [isMobileDevice] = useState(() => isMobile())

    useEffect(() => {
        const handleOrientationChange = () => {
            setIsLandscape(!isPortrait())
        }

        window.addEventListener("orientationchange", handleOrientationChange)
        window.addEventListener("resize", handleOrientationChange)

        return () => {
            window.removeEventListener("orientationchange", handleOrientationChange)
            window.removeEventListener("resize", handleOrientationChange)
        }
    }, [])

    const lockOrientation = useCallback(async () => {
        try {
            const screen = window.screen as Screen & { orientation?: { lock: (type: string) => Promise<void> } }
            if (screen.orientation?.lock) {
                await screen.orientation.lock("landscape")
            }
        } catch {
            // Screen orientation lock not supported or permission denied
        }
    }, [])

    return {
        showPrompt: isMobileDevice && !isLandscape,
        isLandscape,
        lockOrientation,
    }
}
