import { FunctionComponent, useContext } from 'react'
import { showText } from '@/utils'
import { useStore } from 'reto'
import { sceneStore } from '@/store'
const MainTextWindow: FunctionComponent<{}> = () => {
    const { scene, setting } = useStore(sceneStore, ({ scene, setting }) => [scene.showText, scene.showName, scene.showingText, setting.playSpeed, setting.fontSize])
    const textArray = scene.showText?.split('') ?? []
    return (
        <div id="mainTextWindow">
            <div id="pName">{scene.showName}</div>
            <div id="SceneText" style={{ fontSize: setting.fontSize }}>
                {showText(textArray, setting.playSpeed)(scene.showingText)}
            </div>
        </div>
    )
}
export default MainTextWindow