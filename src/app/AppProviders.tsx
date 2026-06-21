import { TooltipProvider } from "@/components/ui/tooltip"
import { type ReactNode } from "react"
import { TMDBProvider } from "@/app/providers/tmdb-provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { ThemeProvider } from "@/app/providers/theme-provider"
import { ColorThemeProvider } from "@/app/providers/color-theme-provider"
import { HistoryProvider } from "@/app/providers/history-provider"
import { MediaDrawerProvider } from "@/components/media/drawer/providers/MediaDrawerProvider"
import "@/app/i18n/i18n"
import "lenis/dist/lenis.css"
import { BrowserRouter } from "react-router-dom"

export default function AppProviders({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider defaultTheme="dark" storageKey="app-theme">
            <ColorThemeProvider>
                <TooltipProvider delayDuration={150}>
                    <TMDBProvider>
                        <HistoryProvider>
                            <SidebarProvider defaultOpen={false}>
                                <BrowserRouter>
                                    <MediaDrawerProvider>{children}</MediaDrawerProvider>
                                </BrowserRouter>
                            </SidebarProvider>
                        </HistoryProvider>
                    </TMDBProvider>
                </TooltipProvider>
            </ColorThemeProvider>
        </ThemeProvider>
    )
}
