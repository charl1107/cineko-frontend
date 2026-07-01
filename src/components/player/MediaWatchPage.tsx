import { useParams, useSearchParams, useNavigate } from "react-router-dom"
import { MediaWatchProvider } from "./providers/MediaWatchProvider"
import { useMediaWatch } from "./hooks/useMediaWatch"
import { MediaPlayer } from "./MediaPlayer"
import { OrientationPrompt } from "./OrientationPrompt"
import type { MediaType } from "./types/media.types"
import { Button } from "@/components/ui/button"
import { ChevronLeft, AlertCircle, RotateCcw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

function MediaWatchPageContent({ type }: { type: MediaType }) {
    const { id } = useParams<{ id: string }>()
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    const season = searchParams.get("s") ? parseInt(searchParams.get("s")!) : type === "tv" ? 1 : undefined

    const episode = searchParams.get("e") ? parseInt(searchParams.get("e")!) : type === "tv" ? 1 : undefined

    const media = useMediaWatch(id!, type, season, episode)

    const { error } = media

    const goBack = () => {
        const home = type === "movie" ? "/movies" : "/shows"
        navigate(home)
    }

    if (error) {
        return (
            <div className="flex h-full min-h-screen w-full items-center justify-center p-6">
                <div className="w-full max-w-md space-y-4">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Playback Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </div>
            </div>
        )
    }

    return (
        <div className="relative flex flex-col h-screen w-full bg-black text-foreground overflow-hidden">
            <OrientationPrompt />
            <div className="absolute top-4 left-4 z-50">
                <Button variant="ghost" className="border border-border" onClick={goBack}>
                    <ChevronLeft className="h-6 w-6" /> Back
                </Button>
            </div>

            <div className="relative flex flex-1 min-h-0 w-full">
                <MediaPlayer />
            </div>
        </div>
    )
}

export default function MediaWatchPage({ type }: { type: MediaType }) {
    return (
        <MediaWatchProvider>
            <MediaWatchPageContent type={type} />
        </MediaWatchProvider>
    )
}
