import { useMediaHandle } from '@/hooks'
import { sceneStore } from '@/store'
import { getUrl } from '@/utils'
import { FunctionComponent, useEffect, useRef, MouseEvent, useCallback } from 'react'
import { useStore } from 'reto'
export const Video: FunctionComponent<{}> = () => {
    const { scene, setScene, videoControl } = useStore(sceneStore, ({ scene }) => [scene.video])
    const src = getUrl(scene.video, 'video')
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const closeVideo = useCallback(
        (e: MouseEvent<HTMLDivElement>) => {
            e.nativeEvent.stopImmediatePropagation()
            setScene(scene => ({ ...scene, video: '' }))
        },
        [],
    )
    useMediaHandle({
        control: videoControl,
        mediaRef: videoRef,
        src
    })

    useEffect(() => {
        const cb = (e: Event) => {
            setScene(scene => ({ ...scene, video: '' }))
        }
        videoRef.current?.addEventListener('ended', cb)
        return () => {
            videoRef.current?.removeEventListener('ended', cb)
        }
    }, [scene.video])

    return (
        <div id="videoContainer" className="videoContainer_styl" style={{ display: scene.video ? 'flex' : 'none' }} onClick={closeVideo} >
            <video ref={videoRef} autoPlay={true} id={"video_show"} src={src} />
        </div>
    )
}