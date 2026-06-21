import React from "react"
import { useMediaDrawer } from "@/components/media/drawer/hooks/useMediaDrawer"
import { MediaDrawer } from "@/components/media/drawer/MediaDrawer"

export const MediaDrawerRoot: React.FC = () => {
    const { stack, close } = useMediaDrawer()

    if (stack.length === 0) return null

    return (
        <>
            {stack.map((payload, index) => {
                return (
                    <MediaDrawer
                        key={`${payload.type}-${payload.id}-${index}`}
                        payload={payload}
                        depth={stack.length - 1 - index}
                        isOpen={true}
                        onClose={() => {
                            // Only allow closing the top drawer
                            if (index === stack.length - 1) {
                                close()
                            }
                        }}
                    />
                )
            })}
        </>
    )
}
