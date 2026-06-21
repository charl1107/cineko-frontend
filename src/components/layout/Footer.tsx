import { Separator } from "@/components/ui/separator"
import { useTranslation } from "react-i18next"
import { BookOpen, Clapperboard, Film, Sparkles, Tv, Shield, FileText, AlertTriangle, Info } from "lucide-react"
import { Link } from "react-router-dom"
import Favicon from "./Favicon"

export default function Footer() {
    const { t } = useTranslation(["footer", "common"])

    return (
        <footer id="footer" className="z-1 mt-8 border-t border-border bg-background py-4 md:py-12">
            <div className="mx-auto w-[min(92vw,1240px)]">
                <div className="mb-6 grid grid-cols-2 gap-6 md:mb-8 md:grid-cols-4 md:gap-8">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <div className="mb-3 flex items-center gap-2 md:mb-4">
                            <Favicon width={40} height={40} />
                            <span className="text-lg font-bold md:text-xl">{t("common:projectName")}</span>
                        </div>
                        <p className="text-xs text-muted-foreground md:text-sm">{t("tagline")}</p>
                    </div>

                    {/* Pages */}
                    <div>
                        <h3 className="mb-2 flex items-center gap-1 text-sm font-semibold md:mb-4 md:text-base">{t("common:pages")}</h3>
                        <ul className="space-y-1 md:space-y-2">
                            <li>
                                <Link to="/movies" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground md:text-sm" target="_self" rel="noopener">
                                    <Film className="h-4 w-4" /> {t("common:movie.plural")}
                                </Link>
                            </li>
                            <li>
                                <Link to="/shows" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground md:text-sm" target="_self" rel="noopener">
                                    <Tv className="h-4 w-4" /> {t("common:tvShow.plural")}
                                </Link>
                            </li>
                            <li>
                                <Link to="/anime" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground md:text-sm" target="_self" rel="noopener">
                                    <Sparkles className="h-4 w-4" /> {t("common:anime.plural")}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="mb-2 flex items-center gap-1 text-sm font-semibold md:mb-4 md:text-base">{t("links.legal")}</h3>
                        <ul className="space-y-1 md:space-y-2">
                            <li>
                                <Link to="/terms" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground md:text-sm" target="_self" rel="noopener">
                                    <Info className="h-4 w-4" /> {t("links.terms")}
                                </Link>
                            </li>
                            <li>
                                <Link to="/privacy" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground md:text-sm" target="_self" rel="noopener">
                                    <Shield className="h-4 w-4" /> {t("links.privacy")}
                                </Link>
                            </li>
                            <li>
                                <Link to="/disclaimer" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground md:text-sm" target="_self" rel="noopener">
                                    <AlertTriangle className="h-4 w-4" /> {t("links.disclaimer")}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* About */}
                    <div>
                        <h3 className="mb-2 flex items-center gap-1 text-sm font-semibold md:mb-4 md:text-base">{t("links.about")}</h3>
                        <ul className="space-y-1 md:space-y-2">
                            <li className="text-xs text-muted-foreground md:text-sm">{t("legal.what-we-do")}</li>
                            <li className="text-xs text-muted-foreground md:text-sm">{t("legal.no-collection")}</li>
                            <li className="text-xs text-muted-foreground md:text-sm">{t("legal.third-party")}</li>
                        </ul>
                    </div>
                </div>

                <Separator className="mb-6 md:mb-8" />

                <div className="flex flex-col items-center justify-between md:flex-row">
                    <p className="text-center text-xs text-muted-foreground md:text-left md:text-sm">
                        &copy; {new Date().getFullYear()} {t("common:projectName")}. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}
