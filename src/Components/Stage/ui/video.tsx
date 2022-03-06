import { sceneStore } from '@/store'
import { getUrl } from '@/utils'
import { FunctionComponent, useEffect, useRef, MouseEvent } from 'react'
import { useStore } from 'reto'
export const Video: FunctionComponent<{}> = () => {
    const { scene, setScene } = useStore(sceneStore, ({ scene }) => [scene.video])
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const closeVideo = (e: MouseEvent<HTMLDivElement>) => {
        e.nativeEvent.stopImmediatePropagation()
        setScene(scene => ({ ...scene, video: '' }))
    }
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
            <video ref={videoRef} autoPlay={true} id={"video_show"} src={getUrl(scene.video, 'video')} />
        </div>
    )
}