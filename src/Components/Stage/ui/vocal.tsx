import { useMediaHandle } from '@/hooks'
import { controlStore, sceneStore } from '@/store'
import { getUrl } from '@/utils'
import { FunctionComponent, useEffect, useRef } from 'react'
import { useStore } from 'reto'

export const Vocal: FunctionComponent<{}> = () => {
    const { scene, isPlayDone, vocalControl } = useStore(sceneStore, ({ scene }) => [scene.vocal])
    const audio = useRef<HTMLAudioElement | null>(null)
    const src = getUrl(scene.vocal, 'vocal')
    useMediaHandle({
        control: vocalControl,
        mediaRef: audio,
        src
    })
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
    }, [scene.vocal])
    return (
        <audio ref={audio} src={src} id="vocal"></audio>
    )
}