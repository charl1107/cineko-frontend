import { useMediaWatchContext } from "../providers/MediaWatchProvider"

export function usePlayerState() {
    const { state, setError, setIsLoading } = useMediaWatchContext()

    return {
        ...state,
        setError,
        setIsLoading,
    }
}
