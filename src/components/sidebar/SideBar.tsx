import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarTrigger,
    useSidebar,
} from "@/components/ui/sidebar"

import { LucideCog, LucideFilm, LucideHome, LucideTv, Sparkles } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useHistory } from "@/hooks/use-history"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button.tsx"
import { useMediaDrawer } from "@/components/media/drawer/hooks/useMediaDrawer.ts"
import { cn } from "@/lib/utils"
import Favicon from "../layout/Favicon"

export default function SideBar() {
    const { setOpen, setOpenMobile } = useSidebar()
    const { t } = useTranslation(["common", "watchhistory"])
    const navigate = useNavigate()
    const location = useLocation()
    const { history } = useHistory()
    const { isVisible } = useMediaDrawer()

    const isActive = (path: string) => location.pathname === path

    const navItemClass = (active: boolean) =>
        cn(
            "group align-text-left relative flex w-full items-center justify-start gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
            active ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
        )

    const clickHandler = (path: string) => {
        setOpen(false)
        setOpenMobile(false)
        navigate(path)
    }

    return (
        <Sidebar side="left" variant="floating" collapsible="offcanvas" className={cn("z-50", isVisible && "hidden")}>
            {/* Header */}
            <SidebarHeader>
                <div onClick={() => clickHandler("/")} className="flex cursor-pointer items-center gap-3 px-2 py-2">
                    <Favicon />

                    <h1 className="text-2xl font-bold">{t("projectName")}</h1>

                    <SidebarTrigger />
                </div>
            </SidebarHeader>

            <SidebarContent>
                {/* Pages */}
                <SidebarGroup>
                    <SidebarGroupLabel>{t("pages")}</SidebarGroupLabel>

                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <Button variant={"link"} onClick={() => clickHandler("/")} className={navItemClass(isActive("/"))}>
                                    <LucideHome size={18} />
                                    <span>{t("home")}</span>
                                </Button>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <Button variant={"link"} onClick={() => clickHandler("/movies")} className={navItemClass(isActive("/movies"))}>
                                    <LucideFilm size={18} />
                                    <span>{t("movie.plural")}</span>
                                </Button>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <Button variant={"link"} onClick={() => clickHandler("/shows")} className={navItemClass(isActive("/shows"))}>
                                    <LucideTv size={18} />
                                    <span>{t("tvShow.plural")}</span>
                                </Button>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <Button variant={"link"} onClick={() => clickHandler("/anime")} className={navItemClass(isActive("/anime"))}>
                                    <Sparkles size={18} />
                                    <span>{t("anime.plural")}</span>
                                </Button>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* History */}
                <SidebarGroup>
                    <SidebarGroupLabel>{t("watchhistory:title")}</SidebarGroupLabel>

                    <SidebarGroupContent>
                        {history.length === 0 ? (
                            <p className="px-2 text-sm text-muted-foreground">{t("watchhistory:empty")}</p>
                        ) : (
                            <div className="max-h-75 overflow-y-auto pr-1">
                                <SidebarMenu>
                                    {history.map((entry) => {
                                        const key = entry.kind === "movie" ? `movie-${entry.item.id}` : `episode-${entry.item.show_id}-${entry.item.season_number}-${entry.item.episode_number}`

                                        const label = entry.kind === "movie" ? entry.item.title : `${entry.item.tvshowtitle} S${entry.item.season_number}E${entry.item.episode_number}`

                                        return (
                                            <SidebarMenuItem key={key}>
                                                <SidebarMenuButton
                                                    onClick={() => clickHandler(entry.kind === "movie" ? `/movie/${entry.item.id}` : `/show/${entry.item.show_id}`)}
                                                    className="flex justify-between hover:bg-muted/50"
                                                >
                                                    <span className="truncate">{label}</span>

                                                    <Badge variant="secondary">{t(`${entry.kind}.singular`)}</Badge>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        )
                                    })}
                                </SidebarMenu>
                            </div>
                        )}
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* Footer */}
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <Button variant={"link"} onClick={() => clickHandler("/settings")} className={navItemClass(isActive("/settings"))}>
                            <LucideCog size={18} />
                            <span>{t("settings")}</span>
                        </Button>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    )
}
