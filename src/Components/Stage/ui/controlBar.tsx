import { FunctionComponent, MouseEvent, useCallback, useEffect } from 'react'
import {
    AlignTextLeftOne,
    DoubleRight, FolderDownload, FolderUpload, Home, PlayOne, ReplayMusic, SettingTwo
} from "@icon-park/react";
import { useStore } from 'reto';
import { sceneStore } from '@/store';
import { runtime } from '@/store/scene'
import { AutoPlayWaitTime, PlaySpeed } from '@/types';
import { useAction } from '@/hooks';

const ControlBar: FunctionComponent<{}> = () => {
    const { control, setControl, setSetting, setScene, gameInfo, setModal, modalCallback, startAutoPlay, stopAutoPlay, vocalControl, bgmControl } = useStore(sceneStore, ({ control }) => [...Object.values(control)])

    const showBacklog = useCallback(
        (e: MouseEvent<HTMLElement>) => {
            e.nativeEvent.stopImmediatePropagation()
            setControl(control => ({ ...control, backlogVisible: true, fastPlay: false, autoPlay: false }))
        },
        [control.autoPlay, control.fastPlay],
    )

    const playVocal = useCallback(
        (e: MouseEvent<HTMLElement>) => {
            e.nativeEvent.stopImmediatePropagation()
            if (control.autoPlay || control.fastPlay) return
            // setControl(control => ({ ...control, playVocalSign: control.playVocalSign + 1 }))
            vocalControl.current?.replay()
        },
        [control.autoPlay, control.fastPlay],
    )

    const autoNext = useCallback(
        (e: MouseEvent<HTMLElement>) => {
            e.nativeEvent.stopImmediatePropagation()
            if (control.fastPlay) return
            setControl(control => ({ ...control, autoPlay: !control.autoPlay }))
        },
        [control.autoPlay, control.fastPlay],
    )
    useAction(() => {
        if (control.autoPlay) startAutoPlay()
        else stopAutoPlay()
    }, [control.autoPlay])

    const fastNext = useCallback(
        (e: MouseEvent<HTMLElement>) => {
            e.nativeEvent.stopImmediatePropagation()
            if (!control.fastPlay) setSetting(setting => ({ ...setting, playSpeed: PlaySpeed.zoom, autoPlayWaitTime: AutoPlayWaitTime.fast }))
            else setSetting(setting => ({ ...setting, playSpeed: PlaySpeed.medium, autoPlayWaitTime: AutoPlayWaitTime.normal }))
            setControl(control => ({ ...control, fastPlay: !control.fastPlay, autoPlay: !control.fastPlay }))
        },
        [control.fastPlay],
    )

    const onSaveGame = useCallback(
        (e: MouseEvent<HTMLElement>) => {
            e.nativeEvent.stopImmediatePropagation()
            if (control.fastPlay) {
                setSetting(setting => ({ ...setting, playSpeed: PlaySpeed.medium, autoPlayWaitTime: AutoPlayWaitTime.normal }))
            }
            setControl(control => ({ ...control, saveVisible: true, fastPlay: false, autoPlay: false }))
        },
        [control.fastPlay],
    )
    const onLoadGame = useCallback(
        (e: MouseEvent<HTMLElement>) => {
            e.nativeEvent.stopImmediatePropagation()
            if (control.fastPlay) {
                setSetting(setting => ({ ...setting, playSpeed: PlaySpeed.medium, autoPlayWaitTime: AutoPlayWaitTime.normal }))
            }
            setControl(control => ({ ...control, loadVisible: true, fastPlay: false, autoPlay: false }))
        },
        [control.fastPlay],
    )
    const onSetting = useCallback(
        (e: MouseEvent<HTMLElement>) => {
            e.nativeEvent.stopImmediatePropagation()
            if (control.fastPlay) {
                setSetting(setting => ({ ...setting, playSpeed: PlaySpeed.medium, autoPlayWaitTime: AutoPlayWaitTime.normal }))
            }
            setControl(control => ({ ...control, settingVisible: true, fastPlay: false, autoPlay: false }))
        },
        [control.fastPlay],
    )

    const Title = useCallback(
        (e: MouseEvent<HTMLElement>) => {
            e.nativeEvent.stopImmediatePropagation()
            control.fastPlay && setSetting(setting => ({ ...setting, playSpeed: PlaySpeed.medium, autoPlayWaitTime: AutoPlayWaitTime.normal }));
            (control.fastPlay || control.autoPlay) && setControl(control => ({ ...control, fastPlay: false, autoPlay: false }))
            modalCallback.current = () => {
                setScene(scene => ({ ...scene, bgm: gameInfo.Title_bgm }))
                bgmControl.current?.replay()
                setControl(control => ({ ...control, titleVisible: true }))
            }
            setModal(modal => ({ ...modal, titleText: '要返回到标题界面吗?', visible: true }))
        },
        [control.fastPlay, control.autoPlay],
    )

    return (
        <div id="controlBar">
            <div className="controlButton" onClick={showBacklog} id="titleButton">
                <AlignTextLeftOne theme="outline" size="28" fill="#f5f5f7" />
            </div>
            <div className="controlButton" onClick={playVocal}>
                <ReplayMusic theme="outline" size="28" fill="#f5f5f7" />
            </div>
            <div className="controlButton" onClick={autoNext} style={control.autoPlay && !control.fastPlay ? { backgroundColor: 'rgba(255,255,255,0.195)', boxShadow: '0 0 25px rgba(255,255,255,0.5)' } : {}} id="autoButton">
                <PlayOne theme="outline" size="28" fill="#f5f5f7" />
            </div>
            <div className="controlButton" onClick={fastNext} style={control.fastPlay ? { backgroundColor: 'rgba(255,255,255,0.195)', boxShadow: '0 0 25px rgba(255,255,255,0.5)' } : {}} id="fastButton">
                <DoubleRight theme="outline" size="28" fill="#f5f5f7" />
            </div>
            <div className="controlButton" onClick={onSaveGame} id="saveButton">
                <FolderDownload theme="outline" size="28" fill="#f5f5f7" />
            </div>
            <div className="controlButton" onClick={onLoadGame} id="loadButton">
                <FolderUpload theme="outline" size="28" fill="#f5f5f7" />
            </div>
            <div className="controlButton" onClick={onSetting}>
                <SettingTwo theme="outline" size="28" fill="#f5f5f7" />
            </div>
            <div className="controlButton" onClick={Title} id="titleButton">
                <Home theme="outline" size="28" fill="#f5f5f7" />
            </div>
        </div>
    )
}
export default ControlBar