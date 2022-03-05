import { sceneStore } from '@/store'
import { getUrl, stopPropagation } from '@/utils'
import { FunctionComponent, useCallback } from 'react'
import { useStore } from 'reto'

export const Title: FunctionComponent<{}> = () => {
    // const { setModal, modalCallback } = useStore(modalStore, () => [])
    const { gameInfo, StartGame, control, setControl, setModal, modalCallback } = useStore(sceneStore, ({ control, gameInfo }) => [control.titleVisible, gameInfo.Title_img])
    return (
        <div id="Title" onClick={stopPropagation} style={{ backgroundImage: `url(${getUrl(gameInfo.Title_img,'background')})`, display: control.titleVisible ? 'block' : 'none' }}>
            <div id="TitleModel">
                <div id="setButtonBottom">
                    <div className="TitleSingleButton">
                        <div className='TitleButtonENG' onClick={useCallback(
                            () => {
                                setControl(control => ({ ...control, titleVisible: false }))
                                StartGame()
                            },
                            [],
                        )
                        }>START</div>
                        <div className='TitleButtonCHN'>从头开始</div>
                    </div>
                    <div className="TitleSingleButton">
                        <div className='TitleButtonENG'>CONTINUE</div>
                        <div className='TitleButtonCHN'>继续游戏</div>
                    </div>
                    <div className="TitleSingleButton" onClick={useCallback(
                        () => {
                            setControl(control => ({ ...control, loadVisible: true }))
                        },
                        [],
                    )
                    }>
                        <div className='TitleButtonENG'>LOAD</div>
                        <div className='TitleButtonCHN'>读取游戏</div>
                    </div>
                    <div className="TitleSingleButton" onClick={useCallback(
                        () => {
                            setControl(control => ({ ...control, settingVisible: true }))
                        },
                        [])}>
                        <div className='TitleButtonENG'>CONFIG</div>
                        <div className='TitleButtonCHN'>偏好设置</div>
                    </div>
                    <div className="TitleSingleButton" onClick={useCallback(
                        () => {
                            modalCallback!.current = () => window.close()
                            setModal({ Left: '退出', Right: '留在本页', titleText: '你确定要退出吗？', visible: true })
                        },
                        [],
                    )
                    }>
                        <div className='TitleButtonENG'>EXIT</div>
                        <div className='TitleButtonCHN'>结束游戏</div>
                    </div>
                </div>

            </div>
        </div>
    )
}