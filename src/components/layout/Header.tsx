import { Button } from "@/components/ui/button"
import { SearchDialog } from "@/components/layout/SearchDialog.tsx"
import { LucideSearch, Settings2 } from "lucide-react"
import { Kbd } from "@/components/ui/kbd"
import { SidebarTrigger } from "@/components/ui/sidebar.tsx"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useAppSettings } from "@/hooks/use-appsettings.ts"
import { useIsMobile } from "@/hooks/use-mobile.ts"
import Favicon from "./Favicon"

export default function Header() {
    const { t } = useTranslation(["header", "common", "settings"])
    const { setShowSearch, showSearch } = useAppSettings()
    const isMobile = useIsMobile()

    return (
        <>
            <header className="fixed top-0 left-0 z-50 w-full py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
                <div className="mx-auto flex h-16 w-[min(92vw,1240px)] items-center rounded-2xl border bg-background/20 px-4 backdrop-blur-xl sm:px-5 lg:px-6">
                    {/* LEFT */}
                    <div className="flex flex-1 items-center gap-2">
                        <Link to="/" className="group inline-flex items-center gap-2">
                            <span className="inline-flex h-[62px] w-auto items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105">
                                <Favicon />
                            </span>
                            <span className="text-2xl font-semibold tracking-tight">{t("common:projectName")}</span>
                        </Link>
                        {!isMobile && <SidebarTrigger />}
                    </div>

                    {/* CENTER SEARCH */}
                    {!isMobile && (
                        <div className="hidden w-56 flex-1 sm:block md:w-72 lg:w-96">
                            <Button variant="outline" onClick={() => setShowSearch(!showSearch)} className="h-9 w-full justify-between px-3 text-sm">
                                <span className="inline-flex items-center gap-2 text-muted-foreground">
                                    <LucideSearch className="size-4" />
                                    <span className="hidden sm:inline">{t("searchPlaceholder")}</span>
                                </span>
                                <span className="hidden items-center gap-1 md:flex">
                                    <Kbd>⌘</Kbd>+<Kbd>F</Kbd>
                                </span>
                            </Button>
                        </div>
                    )}

                    {/* RIGHT */}
                    <div className="flex flex-1 items-center justify-end gap-2">
                        {isMobile && (
                            <>
                                <Button variant="ghost" size="icon" onClick={() => setShowSearch(!showSearch)}>
                                    <LucideSearch className="size-5" />
                                </Button>
                                <SidebarTrigger />
                            </>
                        )}

                        {!isMobile && (
                            <Button asChild variant="outline">
                                <Link to="/settings" className="inline-flex items-center gap-1.5">
                                    <Settings2 className="size-4" />
                                    {t("settings:title")}
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            <SearchDialog />
        </>
    )
}
