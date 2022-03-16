import {FC} from 'react'
import styles from './title.module.scss'
import {useStore} from 'reto'
import {GuiStateStore} from "../../Core/store/GUI";

const Title: FC = () => {
    const state = useStore(GuiStateStore);
    return <>
        {state.GuiState.showTitle && <div className={styles.Title_main}>
            Title
            <div onClick={() => state.setVisibility('showTitle', false)}>
                closeTitle
            </div>
        </div>}
    </>
}

export default Title;