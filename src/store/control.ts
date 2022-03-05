import { useCallback, useState } from "react"
import { useStore } from "reto"
import { gameInfoStore } from "."
const initState = () => ({
    playVocalSign: 0,
    titleVisible: true,
    saveVisible: false,
    backlogVisible: false,
    loadVisible: false,
    autoPlay: false,
    fastPlay: false,
    settingVisible: false,
    bottomBoxVisible: true
})

const state = initState()

export function controlStore() {
    const gameInfo = useStore(gameInfoStore)
    // const scene = useStore(sceneStore)
    const [control, setControl] = useState(state)

    return {
        control,
        setControl,
        ...gameInfo,
        // ...scene
    }
}