import { controlStore, sceneStore } from '@/store'
import { getUrl, stopPropagation } from '@/utils'
import { FunctionComponent } from 'react'
import { useStore } from 'reto'

const miniAvatar: FunctionComponent<{}> = () => {
    const { scene } = useStore(sceneStore)
    return (
        <div id="miniAvatar" onClick={stopPropagation} >
            {scene.miniAvatar && scene.miniAvatar !== 'none' ? <img src={getUrl(scene.miniAvatar, 'figure')} className="miniAvatar_pic" alt="miniAvatar"></img> : ''}
        </div>
    )
}
export default miniAvatar