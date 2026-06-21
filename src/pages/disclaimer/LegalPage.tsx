import { Button } from "@/components/ui/button.tsx"
import { LucideHome } from "lucide-react"
import { Link } from "react-router-dom"
import { H1, P } from "@/components/ui/typography.tsx"
import { useTranslation } from "react-i18next"

type DocType = "terms" | "privacy" | "disclaimer"

const legalContent: Record<DocType, { title: string; body: string[] }> = {
    terms: {
        title: "Terms of Service",
        body: [
            "By accessing and using this service, you accept these terms. If you do not agree, please do not use the service.",
            "This is a streaming guide that indexes publicly available content from third-party providers. We do not host, store, or distribute any video files.",
            "All content displayed belongs to its respective owners. No claims of ownership are made over any media.",
            "The service is provided for personal and educational use only.",
        ],
    },
    privacy: {
        title: "Privacy Policy",
        body: [
            "We do not collect personal data, IP addresses, or viewing history.",
            "No cookies are used for tracking purposes.",
            "Your privacy is 100% respected.",
            "We do not sell or share any user information with third parties.",
        ],
    },
    disclaimer: {
        title: "Content Disclaimer",
        body: [
            "This is a free streaming guide that indexes publicly available content from third-party providers. We do not host, store, or distribute any video files.",
            "All content is sourced from external providers. We do not own, control, or endorse any of the media displayed.",
            "All rights belong to their respective owners.",
            "We make no representations or warranties about the accuracy, completeness, or legality of any content listed.",
        ],
    },
}

interface LegalPageProps {
    type: DocType
}

export default function LegalPage({ type }: LegalPageProps) {
    const { t } = useTranslation()
    const doc = legalContent[type]

    return (
        <section className="mx-auto mt-25 flex max-w-4xl flex-col items-center justify-center px-4 sm:px-6">
            <H1>{doc.title}</H1>
            <div className="mt-4 w-full space-y-4 text-center text-muted-foreground text-sm sm:text-base">
                {doc.body.map((paragraph, i) => (
                    <P key={i} className={type === "disclaimer" ? undefined : "text-left max-w-prose mx-auto"}>
                        {paragraph}
                    </P>
                ))}
            </div>
            <Button asChild className="mt-8">
                <Link to={"/"}>
                    <LucideHome />
                    {t("common:backToHome")}
                </Link>
            </Button>
        </section>
    )
}
