import { useSceneScripts } from "@/hooks"
import type { Runtime } from "@/types"
import { useStore } from "reto"
import { controlStore, modalStore, settingStore } from "."

export const runtime: Runtime = {
    sceneScripts: [],
    SceneName: '',
    SentenceID: 0,
    command: '',
    content: '',
    GameVar: {},
    SavedBacklog: [],
    pixiApp: null
}

export const getRuntime = () => runtime

export function sceneStore() {
    // const setting = useStore(settingStore)
    // console.log('playSpeed1',setting.setting.playSpeed)
    const control = useStore(controlStore)
    // console.log('autoPlay1',control.control.autoPlay)
    const modal = useStore(modalStore)
    const { scene, setScene, StartGame, isPlayDone, pixiRef, jumpFromBacklog, next, setting, jump, stopAutoPlay, startAutoPlay } = useSceneScripts(runtime)

    return {
        scene,
        setScene,
        StartGame,
        next,
        jump,
        jumpFromBacklog,
        isPlayDone,
        pixiRef,
        stopAutoPlay,
        startAutoPlay,
        ...control,
        ...setting,
        ...modal
    }
}