import { createRoot } from "react-dom/client"
import "@/index.css"
import App from "@/app/App"
import AppProviders from "@/app/AppProviders"
import { AppSettingsProvider } from "@/app/providers/settings-provider.tsx"

createRoot(document.getElementById("root")!).render(
    <AppSettingsProvider>
        <AppProviders>
            <App />
        </AppProviders>
    </AppSettingsProvider>
)
