import { Outlet } from "react-router-dom"
import { useSidebar } from "@/components/ui/sidebar.tsx"
import SideBar from "@/components/sidebar/SideBar"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { MediaDrawerRoot } from "@/components/media/drawer/MediaDrawerRoot"
import { useMediaDrawer } from "@/components/media/drawer/hooks/useMediaDrawer.ts"

export default function AppLayout() {
    const { open, setOpen } = useSidebar()
    const { isVisible } = useMediaDrawer()

    return (
        <div className="relative min-h-screen w-full bg-background text-foreground">
            <MediaDrawerRoot />

            {/* Sidebar */}
            <SideBar />

            {/* Overlay */}
            <div onClick={() => setOpen(false)} className={`fixed inset-0 z-20 transition-all duration-300 ease-out ${open ? "opacity-100 backdrop-blur-sm" : "pointer-events-none opacity-0"}`} />

            <Header />

            <div
                id="app-root"
                className={`relative flex min-h-screen flex-col ${
                    window.matchMedia("(prefers-reduced-motion: reduce)").matches
                        ? ""
                        : "transition-all duration-500 ease-out"
                } ${isVisible ? "translate-x-3 scale-[0.99] opacity-90" : "opacity-100"}`}
            >
                {/* background effects */}
                <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                    <div className="absolute top-0 left-0 h-full w-full animate-pulse animation-duration-[10s]">
                        <div className="absolute -top-48 -left-48 h-[40vw] w-[40vw] rounded-full bg-primary/60 blur-[128px]" />
                        <div className="absolute -top-32 -left-32 h-[30vw] w-[30vw] rounded-full bg-primary/20 blur-[96px]" />
                        <div className="absolute -top-16 -left-16 h-[20vw] w-[20vw] rounded-full bg-primary/10 blur-3xl" />
                    </div>
                </div>

                <main className="relative z-10 mx-auto w-full flex-1 space-y-6">
                    <Outlet />
                </main>

                <Footer />
            </div>

            
        </div>
    )
}
