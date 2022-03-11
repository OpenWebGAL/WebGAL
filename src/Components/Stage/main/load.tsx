import { FunctionComponent, MouseEvent, useState } from 'react'
import closeW from "@assets/img/closeWhite.svg";
import { Close } from '../ui';
import { useStore } from 'reto';
import { runtime, sceneStore } from '@/store';
import { deepClone, getSaveState, getTime, getUrl, saveGame, stopPropagation } from '@/utils';
import type { SaveState } from '@/types';
import { getRuntime } from '@/store';
import { State } from '@/hooks/sceneScripts';
import { getScene } from '@/scripts';

const MiniPic: FunctionComponent<{ save: SaveState, i: number }> = ({ save, i }) => {
    const leftFigUrl = getUrl(save["fig_Name_left"], 'figure')
    const FigUrl = getUrl(save["fig_Name"], 'figure')
    const rightFigUrl = getUrl(save["fig_Name_right"], 'figure')
    const renderList = [];
    if (leftFigUrl) {
        renderList.push((
            <span className={"mini_fig mini_fig_left"} key={'figLeft'}>
                <img src={leftFigUrl} alt={"mini_fig"} className={"mini_fig_pic"} />
            </span>
        ));
    }
    if (FigUrl) {
        renderList.push((
            <span className={"mini_fig mini_fig_center"} key={'fig'}>
                <img src={FigUrl} alt={"mini_fig"} className={"mini_fig_pic"} />
            </span>
        ));
    }
    if (rightFigUrl) {
        renderList.push((
            <span className={"mini_fig mini_fig_right"} key={'figRight'}>
                <img src={rightFigUrl} alt={"mini_fig"} className={"mini_fig_pic"} />
            </span>
        ));
    }
    return (
        <div id={"ren_SE" + i} className={"miniPic"}>
            {renderList}
        </div>
    )
}

const PageBtns: FunctionComponent<{ pageQty: number, currentPage: number, setPage: (i: number) => void }> = ({ pageQty, currentPage, setPage }) => {
    const pageBtns = []
    for (let i = 0; i < pageQty; i++) {
        pageBtns.push(
            i === currentPage ?
                <span className="SaveIndexButtonOn LS_indexButtonOn" key={i + 'saceListButtonOn'}>{i + 1}</span>
                : <span className="SaveIndexButton LS_indexButton" onClick={() => { setPage(i) }} key={i + 'saveListButton'}>{i + 1}</span>
        )
    }
    return (
        <>
            {pageBtns}
        </>
    )
}

const LoadItem: FunctionComponent<{ currentPage: number }> = ({ currentPage }) => {
    const { scene, setScene, setModal, modalCallback, control, setControl, setting, gameInfo } = useStore(sceneStore, ({ scene, control, setting }) => [scene.Saves, control.saveVisible, control.loadVisible, setting.fontSize, setting.playSpeed])
    const { Saves } = scene
    const saveBtns: JSX.Element[] = []
    for (let i = currentPage * 6 + 1; i <= currentPage * 6 + 6; i++) {
        const Save = Saves[i]
        const msgClick = async () => {
            if (control.saveVisible && !control.loadVisible) {
                modalCallback.current = () => {
                    setScene(scene => {
                        const Saves = deepClone(scene.Saves)
                        Saves[i] = { ...getSaveState(getRuntime(), scene), saveTime: getTime(), SentenceID: runtime.SentenceID + 1 }
                        runtime.SavedBacklog[i] = deepClone(scene.CurrentBacklog)

                        saveGame(gameInfo, {
                            SavedGame: Saves,
                            SavedBacklog: runtime.SavedBacklog,
                            LP: 0,
                            SP: 0,
                            cSettings: {
                                playSpeed: setting.playSpeed,
                                fontSize: setting.fontSize
                            }
                        })
                        return {
                            ...scene,
                            Saves
                        }
                    })
                }
                setModal(modal => ({ ...modal, visible: true, titleText: '你要覆盖这个存档吗？', Left: '覆盖', Right: '不' }))
            } else if (!control.saveVisible && control.loadVisible) {
                const o = scene.Saves[i]
                runtime.SentenceID = o.SentenceID - 1
                const scripts = await getScene(getUrl(o.SceneName, 'scene'))
                runtime.sceneScripts = scripts
                setScene(scene => {
                    const Saves = deepClone(scene.Saves)
                    let obj: Record<string, unknown> = deepClone(scene)
                    const keys = Object.keys(scene) as Array<keyof State>
                    keys.forEach(key => {
                        obj[key] = Saves[i][key as keyof SaveState] as State ?? obj[key]
                    })
                    // Saves.splice(i, 1, getSaveState(getRuntime(), scene))
                    runtime.SentenceID = Saves[i].SentenceID - 1
                    // getScene(getUrl(Saves[i].SceneName, 'scene'), runtime.SentenceID + 1).then((scripts) => {
                    //     runtime.sceneScripts = scripts
                    // })
                    return { ...scene, ...obj, CurrentBacklog: getRuntime().SavedBacklog[i] }
                })
                setControl(control => ({ ...control, loadVisible: false, titleVisible: false }))
            }
        }
        const emptyClick = () => {
            if (control.saveVisible && !control.loadVisible) {
                setScene(scene => {
                    const Saves = deepClone(scene.Saves)
                    Saves[i] = { ...getSaveState(getRuntime(), scene), saveTime: getTime(), SentenceID: runtime.SentenceID + 1 }
                    runtime.SavedBacklog[i] = deepClone(scene.CurrentBacklog)
                    saveGame(gameInfo, {
                        SavedGame: Saves,
                        SavedBacklog: runtime.SavedBacklog,
                        LP: 0,
                        SP: 0,
                        cSettings: {
                            playSpeed: setting.playSpeed,
                            fontSize: setting.fontSize
                        }
                    })
                    return {
                        ...scene,
                        Saves
                    }
                })
            }
        }
        if (Save) {
            const thisButtonName = Save["showName"];
            const thisButtonText = Save["showText"];
            const backUrl = getUrl(Save["bg_Name"], 'background')

            const temp = (
                <div className={`${control.loadVisible ? 'Load' : 'Save'}SingleElement LS_singleElement`} key={i} onClick={msgClick}>
                    <div className={"LS_Title"}>
                        <span className={`LS_Title_index ${control.loadVisible ? '' : 'S_Title_index'}`}>{i}</span>
                        <span className={`LS_Title_time ${control.loadVisible ? '' : 'S_Title_time'}`}>{Save.saveTime}</span>
                    </div>
                    <div className={"LS_infoArea"}>
                        <div className={"ren"} key={i} style={{ backgroundImage: `url(${backUrl})` }}>
                            <MiniPic save={Save} i={i} />
                        </div>
                        <div className={"LS_textArea"}>
                            <div className="LSE_top">
                                <span className={"LSE_index"}>{i}</span>
                                <span className={"LSE_name"}>{thisButtonName}</span>
                            </div>
                            <div className="LSE_bottom">
                                {thisButtonText}
                            </div>
                        </div>
                    </div>
                </div>
            )
            saveBtns.push(temp);
        } else {
            let temp = <div className="LoadSingleElement LS_singleElement" key={i} onClick={emptyClick}></div>
            saveBtns.push(temp);
        }
    }
    return (
        <>
            {saveBtns}
        </>
    )
}

export const Load: FunctionComponent<{ pageQty: number }> = ({ pageQty }) => {
    const { control, setControl } = useStore(sceneStore, ({ control }) => [control.loadVisible, control.saveVisible])
    const closeLoad = () => {
        setControl(control => ({ ...control, loadVisible: false, saveVisible: false }))
    }
    const [currentPage, setCurrentPage] = useState(0)

    return (
        <div onClick={stopPropagation} id={control.loadVisible ? 'Load' : 'Save'} className="LS_Main" style={{ display: control.loadVisible || control.saveVisible ? 'block' : 'none' }}>
            <div id={control.loadVisible ? 'loadMainBox' : 'saveMainBox'} className="LS_mainBox">
                <Close id="closeLS" src={closeW} onClick={closeLoad} />
                <div id={control.loadVisible ? 'LoadItems' : 'SaveItems'} className="LS_Items">
                    <div id={control.loadVisible ? 'LoadMain' : 'SaveMain'} className={"LS_renderMain"}>
                        <div className={'LS_Title_and_Button'}>
                            <div id={control.loadVisible ? 'LoadTitle' : 'SaveTitle'}>
                                {control.loadVisible ? '读档' : '存档'}
                            </div>
                            <div id={control.loadVisible ? 'LoadIndex' : 'SaveIndex'} className={"LS_Index"}>
                                <PageBtns pageQty={pageQty} currentPage={currentPage} setPage={setCurrentPage} />
                            </div>
                        </div>
                        <div className={"LS_ButtonList"}>
                            <LoadItem currentPage={currentPage} />
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}