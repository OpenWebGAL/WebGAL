import { controlStore, sceneStore } from '@/store'
import { getUrl } from '@/utils'
import { FunctionComponent, useEffect, useRef } from 'react'
import { useStore } from 'reto'

export const Vocal: FunctionComponent<{}> = () => {
    const { scene, control, isPlayDone } = useStore(sceneStore, ({ scene, control }) => [scene.vocal, control.playVocalSign])
    const audio = useRef<HTMLAudioElement | null>(null)
    useEffect(() => {
        const cb = () => {
            isPlayDone.current = true
        }
        if (scene.vocal && audio.current) {
            isPlayDone.current = false
            audio.current.currentTime = 0;
            // audio.current.volume = 0.25;
            audio.current.play();
            audio.current.addEventListener('ended', cb)
        }
        return () => {
            audio.current?.removeEventListener('ended', cb)
        }
    }, [scene.vocal, control.playVocalSign])
    return (
        <audio ref={audio} src={getUrl(scene.vocal, 'vocal')} id="vocal"></audio>
    )
}