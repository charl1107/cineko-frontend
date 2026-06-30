import { lazy, Suspense, useEffect } from "react"
import { Toaster } from "@/components/ui/sonner"
import { Route, Routes } from "react-router-dom"
import { useIsMobile } from "@/hooks/use-mobile.ts"
import Lenis from "lenis"

const HomePage = lazy(() => import("@/pages/home/Home"))
const MoviesPage = lazy(() => import("@/pages/movies/Movies"))
const WatchMoviePage = lazy(() => import("@/pages/watch/movie/WatchMoviePage.tsx"))
const WatchTvPage = lazy(() => import("@/pages/watch/tv/WatchTvPage.tsx"))
const WatchAnimePage = lazy(() => import("@/pages/watch/anime/WatchAnimePage.tsx"))
const ShowsPage = lazy(() => import("@/pages/shows/Shows"))
const AnimePage = lazy(() => import("@/pages/anime/Anime"))
const NotFound = lazy(() => import("@/pages/404/NotFound"))
const Settings = lazy(() => import("@/pages/settings/Settings"))
const LegalPage = lazy(() => import("@/pages/disclaimer/LegalPage"))

import AppLayout from "@/app/AppLayout.tsx"
import BlankLayout from "@/app/BlankLayout"

export default function App() {
    const isMobile = useIsMobile()

    useEffect(() => {
        if (!isMobile) {
            const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
            if (prefersReducedMotion) return

            const lenis = new Lenis({
                autoRaf: true,
                prevent: (node) => node.classList.contains("lenis-disabled"),
            })

            return () => lenis.destroy()
        }
    }, [isMobile])

    return (
        <>
            <Suspense
                fallback={
                    <div className="flex min-h-screen min-w-screen items-center justify-center">
                        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                }
            >
                <Routes>
                    {/* MAIN APP */}
                    <Route element={<AppLayout />}>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/movies" element={<MoviesPage />} />
                        <Route path="/shows" element={<ShowsPage />} />
                        <Route path="/anime" element={<AnimePage />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/terms" element={<LegalPage type="terms" />} />
                        <Route path="/privacy" element={<LegalPage type="privacy" />} />
                        <Route path="/disclaimer" element={<LegalPage type="disclaimer" />} />
                        <Route path="*" element={<NotFound />} />
                    </Route>

                    <Route element={<BlankLayout />}>
                        <Route path="/watch/movie/:id" element={<WatchMoviePage />} />
                        <Route path="/watch/tv/:id" element={<WatchTvPage />} />
                        <Route path="/watch/anime/:id" element={<WatchAnimePage />} />
                    </Route>
                </Routes>
            </Suspense>

            <Toaster />
        </>
    )
}
