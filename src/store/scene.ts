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
    pixiApp: null,
    goBackBgm: ''
}

export const getRuntime = () => runtime

export function sceneStore() {
    // const setting = useStore(settingStore)
    // console.log('playSpeed1',setting.setting.playSpeed)
    // const control = useStore(controlStore)
    // console.log('autoPlay1',control.control.autoPlay)
    const modal = useStore(modalStore)
    const scene = useSceneScripts(runtime)

    return {
        ...scene,
        ...modal
    }
}