import styles from './backlog.module.scss'
import {useStore} from "reto";
import {GuiStateStore} from "../../../Core/store/GUI";

export export const Backlog = () => {
    const GUIStore = useStore(GuiStateStore)
    return <>
        {GUIStore.GuiState.showBacklog && < div className={styles.Backlog_main}>

        </div>}
    </>
}