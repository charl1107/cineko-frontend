import { Outlet } from "react-router-dom"

export default function BlankLayout() {
    return (
        <div className="min-h-screen w-full bg-background text-foreground">
            <Outlet />
        </div>
    )
}
