import { useEffect } from "react"

/**
 * usePageTitle — lightweight SEO helper for SPAs.
 * Updates document.title and injects a <link rel="canonical"> tag.
 * No external dependencies; works in any React app.
 */
export function usePageTitle(title: string, canonicalPath?: string) {
    useEffect(() => {
        const previousTitle = document.title
        document.title = title

        // Canonical
        let link: HTMLLinkElement | null = null
        if (canonicalPath) {
            const existing = document.querySelector<HTMLLinkElement>("link[rel='canonical']")
            if (existing) {
                existing.setAttribute("href", canonicalPath)
            } else {
                link = document.createElement("link")
                link.rel = "canonical"
                link.href = canonicalPath
                document.head.appendChild(link)
            }
        }

        return () => {
            document.title = previousTitle
            if (link) {
                document.head.removeChild(link)
            }
        }
    }, [title, canonicalPath])
}
