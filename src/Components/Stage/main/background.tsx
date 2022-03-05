import { controlStore, sceneStore } from '@/store'
import { getUrl } from '@/utils'
import { FunctionComponent } from 'react'
import { useStore } from 'reto'

export const Background: FunctionComponent<{}> = () => {
    const clickOnBack = () => { }
    const { scene } = useStore(sceneStore, ({ scene }) => [scene.bg_ani, scene.bg_transform, scene.bg_filter, scene.bg_Name])
    // console.log(scene)
    return (
        <div id="BackgroundContainer" onClick={clickOnBack}>
            <div id='oldBG' />
            <div id='mainBackground' style={{ backgroundImage: `url(${getUrl(scene.bg_Name, 'background')})`, animation: scene.bg_ani, filter: scene.bg_filter, transform: scene.bg_transform }} />
        </div>
    )
}