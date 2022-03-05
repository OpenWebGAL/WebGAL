import { FunctionComponent, useMemo } from 'react'
import TopControl from '../ui/topControl'
import MainTextWindow from '../ui/mainTextWindow'
import ControlBar from '../ui/controlBar'
import MiniAvatar from '../ui/miniAvatar'
import { useStore } from 'reto'
import { sceneStore } from '@/store'
const BottomBox: FunctionComponent<{}> = () => {
    const { control } = useStore(sceneStore, ({ control }) => [control.bottomBoxVisible])
    return (
        <div id="bottomBox" style={{ display: control.bottomBoxVisible ? 'flex' : 'none' }}>
            {useMemo(() => (
                <>
                    <TopControl />
                    <MainTextWindow />
                    <ControlBar />
                    <MiniAvatar />
                </>
            ), [])}
        </div>
    )
}
export default BottomBox