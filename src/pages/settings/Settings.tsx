import { useTranslation } from "react-i18next"
import { useNavigate, useSearchParams } from "react-router-dom"
import { usePageTitle } from "@/hooks/use-page-title"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"

import { useAppSettings } from "@/hooks/use-appsettings.ts"
import { supportedLocales, type SupportedLocales } from "@/hooks/use-appsettings"
import { useHistory } from "@/hooks/use-history.ts"

import { H1 } from "@/components/ui/typography.tsx"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

import ConfirmDialog from "@/components/layout/ConfirmDialog.tsx"

import { Monitor, Moon, Sun, Trash2 } from "lucide-react"
import { useEffect } from "react"
import i18n from "i18next"
import { useTheme } from "@/app/providers/theme-provider"
import { useColorTheme } from "@/hooks/use-color-theme"
import { colorThemes } from "@/hooks/use-color-theme"
import { cn } from "@/lib/utils"

export default function Settings() {
    const { t } = useTranslation(["settings", "common"])
    usePageTitle(`${t("settings:title")} — Cineko`, "/settings")
    const navigate = useNavigate()

    const [searchParams, setSearchParams] = useSearchParams()

    const validTabs = ["appearance", "history", "playback"] as const

    type Tab = (typeof validTabs)[number]

    const tabFromUrl = searchParams.get("tab")

    const currentTab: Tab = validTabs.includes(tabFromUrl as Tab) ? (tabFromUrl as Tab) : "appearance"

    useEffect(() => {
        if (!tabFromUrl) {
            navigate({ pathname: location.pathname, search: `?tab=${validTabs[0]}` }, { replace: true })
        }
    }, [])

    const { theme, setTheme } = useTheme()
    const { colorTheme, setColorTheme } = useColorTheme()

    const { locale, autoplayNext, setLocale, setAutoplayNext } = useAppSettings()

    const handleLanguageChange = (value: string) => {
        setLocale(value as SupportedLocales)
        i18n.changeLanguage(value).catch((err) => {
            console.error("Failed to change language:", err)
        })
        location.reload()
    }

    const { clear, history, remove } = useHistory()

    return (
        <section className="mx-auto mt-25 min-h-[60vh] max-w-3xl space-y-6 px-4 sm:px-6">
            <H1>{t("title")}</H1>

            <Tabs
                value={currentTab}
                onValueChange={(value) => {
                    const params = new URLSearchParams(searchParams)

                    if (value === "appearance") {
                        params.delete("tab")
                    } else {
                        params.set("tab", value)
                    }

                    setSearchParams(params, {
                        replace: true,
                    })
                }}
                className="w-full px-3"
            >
                <TabsList variant="line">
                    <TabsTrigger value="appearance">{t("tabs.appearance")}</TabsTrigger>
                    <TabsTrigger value="history">{t("tabs.history")}</TabsTrigger>
                    <TabsTrigger value="playback">{t("tabs.playback")}</TabsTrigger>
                </TabsList>

                {/* ---------------- APPEARANCE ---------------- */}
                <TabsContent value="appearance">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("appearance.title")}</CardTitle>
                            <CardDescription>{t("appearance.description")}</CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-8">
                            {/* Light / Dark / System */}
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <Label>{t("appearance.theme.label")}</Label>
                                    <p className="pt-1 text-sm text-muted-foreground">{t("appearance.theme.info")}</p>
                                </div>

                                <div className="flex shrink-0 gap-1 rounded-lg border p-1">
                                    <button
                                        type="button"
                                        onClick={() => setTheme("light")}
                                        className={cn(
                                            "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-all",
                                            theme === "light" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <Sun className="size-4" />
                                        <span className="hidden sm:inline">{t("appearance.theme.light")}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTheme("dark")}
                                        className={cn(
                                            "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-all",
                                            theme === "dark" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <Moon className="size-4" />
                                        <span className="hidden sm:inline">{t("appearance.theme.dark")}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTheme("system")}
                                        className={cn(
                                            "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-all",
                                            theme === "system" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <Monitor className="size-4" />
                                        <span className="hidden sm:inline">{t("appearance.theme.system")}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Color theme swatches */}
                            <div>
                                <Label>{t("appearance.colorTheme.label")}</Label>
                                <p className="pt-1 text-sm text-muted-foreground">{t("appearance.colorTheme.info")}</p>

                                <div className="mt-4 flex flex-wrap gap-4">
                                    {colorThemes.map((ct) => (
                                        <button type="button" key={ct.id} onClick={() => setColorTheme(ct.id)} className="group flex flex-col items-center gap-2" title={ct.label}>
                                            <div
                                                className={cn(
                                                    `swatch-${ct.id}`,
                                                    "size-9 rounded-full ring-offset-2 ring-offset-background transition-all",
                                                    colorTheme === ct.id ? "scale-110 ring-2 ring-foreground" : "hover:scale-105 hover:ring-2 hover:ring-foreground/40"
                                                )}
                                            />
                                            <span className={cn("text-xs transition-colors", colorTheme === ct.id ? "font-medium text-foreground" : "text-muted-foreground")}>{ct.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Language */}
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <Label>{t("general.language.cardlabel")}</Label>
                                    <p className="pt-1 text-sm text-muted-foreground">{t("general.language.info", { gitUrl: t("common:opensource.git-url") })}</p>
                                </div>

                                <Select value={locale} onValueChange={(value) => handleLanguageChange(value)}>
                                    <SelectTrigger className="max-w-min">
                                        <SelectValue placeholder={t("general.language.placeholder")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>{t("general.language.selectlabel")}</SelectLabel>
                                            {[...supportedLocales]
                                                .sort((a, b) => a.label.localeCompare(b.label))
                                                .map((l) => (
                                                    <SelectItem key={l.iso639} value={l.iso639}>
                                                        {l.label}
                                                    </SelectItem>
                                                ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ---------------- HISTORY ---------------- */}
                <TabsContent value="history">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("history.title")}</CardTitle>
                            <CardDescription>{t("history.description")}</CardDescription>

                            <div className="flex items-center gap-2">
                                <ConfirmDialog
                                    title={t("history.clear.title")}
                                    description={t("history.clear.description")}
                                    onConfirm={clear}
                                    trigger={
                                        <Button variant="destructive" className={"max-w-min"} disabled={!history.length}>
                                            <Trash2 />
                                            <span className={"ml-1 hidden sm:inline"}>{t("history.clear.button")}</span>
                                        </Button>
                                    }
                                />
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {!history.length ? (
                                <Empty className="rounded-lg border py-10">
                                    <EmptyHeader>
                                        <EmptyMedia variant="icon">
                                            <Trash2 className="size-5" />
                                        </EmptyMedia>
                                        <EmptyTitle>{t("history.empty.title")}</EmptyTitle>
                                        <EmptyDescription>{t("history.empty.description")}</EmptyDescription>
                                    </EmptyHeader>
                                </Empty>
                            ) : (
                                <div className="space-y-2">
                                    {history.map((item) => {
                                        const title = item.kind === "movie" ? item.item.title : `${item.item.tvshowtitle} • S${item.item.season_number}E${item.item.episode_number}`

                                        return (
                                            <div key={title} className="lenis-stopped flex items-center justify-between border-b border-dashed border-border py-2">
                                                <p className="text-sm">{title}</p>

                                                <ConfirmDialog
                                                    title={t("history.item.removeTitle")}
                                                    description={t("history.item.removeDescription")}
                                                    onConfirm={() => remove(item)}
                                                    trigger={
                                                        <Button variant="secondary" size="sm">
                                                            <Trash2 />
                                                            {t("history.item.removeButton")}
                                                        </Button>
                                                    }
                                                />
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ---------------- PLAYBACK ---------------- */}
                <TabsContent value="playback">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t("playback.title")}</CardTitle>
                                <CardDescription>{t("playback.description")}</CardDescription>
                            </CardHeader>

                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label>{t("playback.autoplayNext.label")}</Label>
                                        <p className="text-sm text-muted-foreground">{t("playback.autoplayNext.description")}</p>
                                    </div>

                                    <Switch checked={autoplayNext} onCheckedChange={setAutoplayNext} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </section>
    )
}
