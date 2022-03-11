import { sceneStore } from "@/store"
import { exit } from "@/utils"
import { throttle } from "lodash"
import { useEffect } from "react"
import { useStore } from "reto"

export const useMainControl = () => {
    const { scene, setScene, stopAutoPlay, setControl, next, control, videoControl, vocalControl, bgmControl } = useStore(sceneStore, ({ scene, control }) => [scene.showingText, control.autoPlay, control.panicOverlayVisible, scene.choose])
    useEffect(() => {
        function click(e: MouseEvent) {
            if (exit(scene.choose)) return
            if (scene.showingText) {
                setScene(scene => ({ ...scene, showingText: false }))
                return
            }
            if (control.autoPlay) {
                stopAutoPlay()
                setControl(control => ({ ...control, autoPlay: false, fastPlay: false }))
            }
            next()
        }
        const cb = throttle(click, 1000, { leading: true })
        document.addEventListener('click', cb)

        return () => {
            document.removeEventListener('click', cb)
        }
    }, [scene.showingText, control.autoPlay, scene.choose])

    useEffect(() => {
        const cb = throttle((e: KeyboardEvent) => {
            switch (e.code.toLowerCase()) {
                case 'escape':
                    setControl(control => {
                        if(!control.panicOverlayVisible){
                            videoControl.current?.pause()
                            bgmControl.current?.pause()
                            vocalControl.current?.pause()
                        }else{
                            videoControl.current?.play()
                            bgmControl.current?.play()
                            vocalControl.current?.play()
                        }
                        return { ...control, panicOverlayVisible: !control.panicOverlayVisible }
                    })
                    break
                case 'arrowup':
                    if (!control.titleVisible && !control.backlogVisible) setControl(control => ({ ...control, backlogVisible: true }))
                    break
                case 'arrowright':
                case 'enter':
                case 'space':
                    if (!control.titleVisible) document.body.click()
                    break
            }
        }, 1000, { leading: true })
        document.addEventListener('keyup', cb)
        return () => {
            document.removeEventListener('keyup', cb)
        }
    }, [control.backlogVisible, control.titleVisible, control.panicOverlayVisible])

}