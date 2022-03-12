import { FunctionComponent, MouseEvent, useCallback } from 'react'
// import up from "@assets/img/up.svg";
import cross from "@assets/img/cross.svg";
import { useStore } from 'reto';
import { sceneStore } from '@/store';

const TopControl: FunctionComponent<{}> = () => {
    const { control, setControl } = useStore(sceneStore, ({ control }) => [control.bottomBoxVisible])
    const hideTextBox = useCallback(
        (e:MouseEvent<HTMLSpanElement>) => {
            e.nativeEvent.stopImmediatePropagation()
            setControl(control => ({ ...control, bottomBoxVisible: false }))
        },
        [],
    )

    // const showBacklog = () => { }
    return (
        <div id="top_control">
            <span className="top_button" onClick={hideTextBox}>
                <img alt={"cross"} src={cross} style={{ width: "22px", height: "22px" }} />
            </span>
            {/* <span className="top_button" onClick={showBacklog}>
                <img alt={"up"} src={up} style={{ width: "25px", height: "25px" }} />
            </span> */}
        </div>
    )
}
export default TopControl