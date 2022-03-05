import { sceneStore } from '@/store'
import { getUrl } from '@/utils'
import { FunctionComponent, MouseEvent, useCallback, useState } from 'react'
import { useStore } from 'reto'

export const StartPage: FunctionComponent<{}> = () => {
    const { setScene, gameInfo } = useStore(sceneStore, ({ gameInfo }) => [gameInfo.Title_bgm])
    const [startPageVisible, setStartPageVisible] = useState(true)
    const setStartPage = useCallback(
        (e: MouseEvent<HTMLElement>) => {
            e.nativeEvent.stopImmediatePropagation()
            // setBgmUrl(getUrl(gameInfo.Title_bgm, 'bgm'))
            setScene(scene => ({ ...scene, bgm: gameInfo.Title_bgm }))
            setStartPageVisible(false)
        },
        [],
    )
    return (
        <>
            {startPageVisible ? <div id="WG_startPage" style={{ backgroundImage: gameInfo.Title_img ? getUrl(gameInfo.Title_img, 'background') : 'none' }} onClick={setStartPage}></div> : ''}
        </>
    )
}