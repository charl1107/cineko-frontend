import { resolve } from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],

    resolve: {
        alias: {
            "@": resolve(__dirname, "src"),
            "@/app": resolve(__dirname, "src", "app"),
            "@/features": resolve(__dirname, "src", "features"),
            "@/shared": resolve(__dirname, "src", "shared"),
        },
    },

    server: {
        port: 3000,
        proxy: {
            "/api": {
                target: "http://localhost:8787",
                changeOrigin: true,
            },
        },
    },

    build: {
        emptyOutDir: true,
        outDir: resolve(__dirname, "dist"),
    },
})
