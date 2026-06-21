import { cn } from "@/lib/utils"
import * as React from "react"

const Favicon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <img
        src="/logo%20(1).svg"
        alt="Logo"
        className={cn("h-[58px] w-auto", props.className)}
    />
)

export default Favicon
