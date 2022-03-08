import { useMediaHandle } from '@/hooks/mediaControl';
import { sceneStore } from '@/store';
import { getUrl } from '@/utils';
import { FunctionComponent, useRef, useEffect } from 'react'
import { useStore } from 'reto';

// 由于浏览器规则限制，不能在用户交互前播放音视频，所以要在初始化时增加一个startPage，通过点击来触发
export const Bgm: FunctionComponent<{}> = () => {
    const { scene, bgmControl } = useStore(sceneStore, ({ scene }) => [scene.bgm])
    const audio = useRef<HTMLAudioElement | null>(null)
    const src = getUrl(scene.bgm, 'bgm')
    useMediaHandle({
        control: bgmControl,
        mediaRef: audio,
        src
    })
    useEffect(() => {
        if (scene.bgm && audio.current) {
            audio.current.currentTime = 0;
            audio.current.volume = 0.25;
            audio.current.play();
        }
    }, [scene.bgm])

    return (
        <audio ref={audio} src={src} id="currentBGM" loop></audio >
    )
}