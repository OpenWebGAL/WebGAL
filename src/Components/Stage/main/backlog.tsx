import { FunctionComponent, MouseEvent, MutableRefObject, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react'
import closeW from '@assets/img/closeWhite.svg'
import { Close } from '../ui'
import { useStore } from 'reto'
import { sceneStore } from '@/store'
import { exit, getUrl, isMobile, stopPropagation } from '@/utils'
import logger from '@/utils/logger'
import { Return, VolumeNotice } from '@icon-park/react'

type VocalRef = {
    replay: () => void
}
const BackLogVocal: FunctionComponent<{ src: string, vocalRef: MutableRefObject<VocalRef | null> }> = ({ src, vocalRef }) => {
    const audio = useRef<HTMLAudioElement | null>(null)
    useImperativeHandle(
        vocalRef,
        () => ({
            replay: () => {
                if (src && audio.current) {
                    audio.current.currentTime = 0;
                    // audio.current!.volume = 0.25;
                    audio.current.play();
                    logger.info("播放回溯语音" + src);
                }
            }
        }),
        [src],
    )
    return (
        <audio ref={audio} src={src} />
    )
}

const BackLogItem: FunctionComponent<{ buttonClassName: string, index: number, size: number, delay: number, showName: string, showText: string, vocalName: string }> = ({ buttonClassName, index, size, delay, showName, showText, vocalName }) => {
    const { jumpFromBacklog } = useStore(sceneStore, () => [])
    const vocalRef = useRef<VocalRef | null>(null)
    const playBacklogVoice = (vocalRef: MutableRefObject<VocalRef | null>) => {
        vocalRef.current?.replay()
    }
    return (
        <div className={'backlog_singleElement'} style={{
            opacity: 0,
            animationFillMode: 'forwards',
            animationDelay: `${20 * delay}ms`
        }}>
            <div className={"backlog_interact"}>
                <div className={buttonClassName} onClick={() => playBacklogVoice(vocalRef)}>
                    <VolumeNotice theme="outline" size={size} fill="#f5f5f7" />
                </div>
                <div className={buttonClassName} onClick={() => {
                    jumpFromBacklog(index)
                }}>
                    <Return theme="outline" size={size} fill="#f5f5f7" />
                </div>
            </div>
            <div className={"backlog_name"}>{showName}</div>
            <div className={"backlog_content"}>
                <div className={"backlog_text"}>{showText}</div>
            </div>
            {vocalName ? <BackLogVocal vocalRef={vocalRef} src={getUrl(vocalName, 'vocal')} /> : ''}
        </div>
    )
}

const BackLogMain: FunctionComponent<{}> = () => {
    const { scene } = useStore(sceneStore, ({ scene }) => [scene.CurrentBacklog])
    let showBacklogList = [];
    let size;
    let buttonClassName;
    if (isMobile()) {
        size = 14;
        buttonClassName = 'backlog_interact_button_mobile';
    } else {
        size = 24;
        buttonClassName = 'backlog_interact_button';
    }

    // console.log(getRuntime().CurrentBacklog)
    for (let i = 0; i < scene.CurrentBacklog.length; i++) {
        const o = scene.CurrentBacklog[i]
        const props = {
            vocalName: o.vocal,
            showName: o.showName,
            showText: o.showText,
            delay: scene.CurrentBacklog.length - i,
            size,
            buttonClassName,
            index: i
        }
        showBacklogList.push(<BackLogItem {...props} key={i} />)
    }

    return <div>{showBacklogList}</div>
}

export const BackLog: FunctionComponent<{}> = () => {
    const { control, setControl } = useStore(sceneStore, ({ control }) => [control.backlogVisible])
    const closeBacklog = useCallback(
        () => {
            setControl(control => ({ ...control, backlogVisible: false }))
        },
        [],
    )

    return (
        <div onClick={stopPropagation} id="backlog" style={{ display: control.backlogVisible ? 'block' : 'none' }}>
            {
                useMemo(() => (
                    <>
                        <Close id="closeBl" src={closeW} onClick={closeBacklog} />
                        <div id="backlogContent">
                            <BackLogMain />
                        </div>
                    </>
                ), [])
            }
        </div >
    )
}