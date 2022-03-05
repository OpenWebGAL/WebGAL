import { AutoPlayWaitTime, FontSize, PlaySpeed } from "@/types"
import { useState } from "react"

const initState = () => ({
    fontSize: FontSize.medium,
    playSpeed: PlaySpeed.medium,
    autoPlayWaitTime: AutoPlayWaitTime.normal
})

const state = initState()

export function settingStore() {
    const [setting, setSetting] = useState(state)

    return {
        setting,
        setSetting,
    }
}