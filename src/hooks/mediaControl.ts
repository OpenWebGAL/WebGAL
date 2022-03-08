import type { MediaControl } from "@/types"
import { MutableRefObject, useImperativeHandle, useRef } from "react"

export const useMediaControl = () => {
    const bgmControl = useRef<MediaControl | null>(null)
    const vocalControl = useRef<MediaControl | null>(null)
    const videoControl = useRef<MediaControl | null>(null)
    return {
        bgmControl,
        vocalControl,
        videoControl
    }
}

type MediaHandle = {
    control: MutableRefObject<MediaControl | null>,
    mediaRef: MutableRefObject<HTMLAudioElement | HTMLVideoElement | null>
    src: string
}

export const useMediaHandle = ({ control, mediaRef, src }: MediaHandle) => {
    useImperativeHandle(
        control,
        () => ({
            replay: () => {
                if (src && mediaRef.current) {
                    mediaRef.current.currentTime = 0;
                    mediaRef.current.play();
                }
            },
            pause: () => {
                if (src && mediaRef.current) {
                    mediaRef.current.pause();
                }
            },
            setMeidaState: (mediaState) => {
                if (!mediaRef.current) return
                for (const key in mediaState) {
                    if (mediaState[key as keyof typeof mediaState])
                        (mediaRef.current[key as keyof typeof mediaState] as unknown) = mediaState[key as keyof typeof mediaState]
                }
            }
        }),
        [src],
    )
}