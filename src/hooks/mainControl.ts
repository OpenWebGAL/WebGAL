import { sceneStore } from "@/store"
import { throttle } from "lodash"
import { useEffect } from "react"
import { useStore } from "reto"

export const useMainControl = () => {
    const { scene, setScene, stopAutoPlay, setControl, next, control } = useStore(sceneStore, ({ scene, control }) => [scene.showingText, control.autoPlay, control.panicOverlayVisible])
    useEffect(() => {
        function click(e: MouseEvent) {
            if (scene.showingText) {
                setScene(scene => ({ ...scene, showingText: false }))
                return
            }
            if (control.autoPlay) {
                stopAutoPlay()
                setControl(control => ({ ...control, autoPlay: false }))
            }
            next()
        }
        const cb = throttle(click, 1000, { leading: true })
        document.addEventListener('click', cb)

        return () => {
            document.removeEventListener('click', cb)
        }
    }, [scene.showingText, control.autoPlay])

    useEffect(() => {
        const cb = (e: KeyboardEvent) => {
            console.log(e)
            if (e.key.toLowerCase() === 'escape') {
                setControl(control => ({ ...control, panicOverlayVisible: !control.panicOverlayVisible }))
            }
        }
        document.addEventListener('keyup', cb)
        return () => {
            document.removeEventListener('keyup', cb)
        }
    }, [control.panicOverlayVisible])

}