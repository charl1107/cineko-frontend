import { useState } from "react"
import { Smartphone, RotateCcw, X } from "lucide-react"
import { useOrientationPrompt } from "@/hooks/use-orientation-prompt"

export function OrientationPrompt() {
    const { showPrompt, lockOrientation } = useOrientationPrompt()
    const [dismissed, setDismissed] = useState(false)

    if (!showPrompt || dismissed) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4 p-6 text-center text-white">
                <Smartphone className="h-12 w-12 animate-pulse" />
                <h3 className="text-lg font-semibold">Rotate for Best Experience</h3>
                <p className="max-w-xs text-sm text-white/70">
                    This video is optimized for landscape viewing. Please rotate your device.
                </p>
                <button
                    onClick={lockOrientation}
                    className="flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition active:scale-95"
                >
                    <RotateCcw className="h-4 w-4" />
                    Lock Landscape
                </button>
            </div>
            <button
                onClick={() => setDismissed(true)}
                className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 transition"
                aria-label="Dismiss"
            >
                <X className="h-5 w-5" />
            </button>
        </div>
    )
}
