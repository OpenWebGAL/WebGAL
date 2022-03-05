import { controlStore, sceneStore } from '@/store'
import { getUrl } from '@/utils'
import { FunctionComponent } from 'react'
import { useStore } from 'reto'

export const FigureImage: FunctionComponent<{}> = () => {
    const { scene } = useStore(sceneStore, ({ scene }) => [scene.fig_Name, scene.fig_Name_left, scene.fig_Name_right, scene.fig_ani, scene.fig_ani_left, scene.fig_ani_right])
    return (
        <>
            <div id="figureImage_left" className="figureContainerleft" style={{ animation: scene.fig_ani_left }}>
                {scene.fig_Name_left ? <img src={getUrl(scene.fig_Name_left, 'figure')} alt="figure" className="p_center"></img> : ''}
            </div>
            <div id="figureImage" className="figureContainercenter" style={{ animation: scene.fig_ani }}>
                {scene.fig_Name ? <img src={getUrl(scene.fig_Name, 'figure')} alt="figure" className="p_center"></img> : ''}
            </div>
            <div id="figureImage_right" className="figureContainerright" style={{ animation: scene.fig_ani_right }}>
                {scene.fig_Name_right ? <img src={getUrl(scene.fig_Name_right, 'figure')} alt="figure" className="p_center"></img> : ''}
            </div>
        </>
    )
}