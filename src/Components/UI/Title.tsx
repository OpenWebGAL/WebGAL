import {FC} from 'react'
import styles from './title.module.scss'
import {useStore} from 'reto'
import {GuiStateStore} from "../../Core/store/GUI";

const Title: FC = () => {
    const GuiStore = useStore(GuiStateStore);
    return <>
        {GuiStore.GuiState.showTitle &&
            <div className={styles.Title_main}
                 style={{
                     backgroundImage: `url("${GuiStore.GuiState.titleBg}")`,
                     backgroundSize: "cover"
                 }}>
                Title
                <div onClick={() => GuiStore.setVisibility('showTitle', false)}>
                    closeTitle
                </div>
            </div>}
    </>
}

export default Title;