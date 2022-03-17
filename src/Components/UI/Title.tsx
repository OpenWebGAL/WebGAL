import {FC} from 'react'
import styles from './title.module.scss'
import {useStore} from 'reto'
import {GuiStateStore} from "../../Core/store/GUI";

const Title: FC = () => {
    const GUIstate = useStore(GuiStateStore);
    return <>
        {GUIstate.GuiState.showTitle &&
            <div className={styles.Title_main}
                 style={{
                     backgroundImage: `url("${GUIstate.GuiState.titleBg}")`,
                     backgroundSize: "cover"
                 }}>
                Title
                <div onClick={() => GUIstate.setVisibility('showTitle', false)}>
                    closeTitle
                </div>
            </div>}
    </>
}

export default Title;