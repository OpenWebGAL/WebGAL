import {FC} from "react";
import {useStore} from "reto";
import {GuiStateStore} from "../../../Core/store/GUI";
import styles from './menu.module.scss'

const Menu: FC = () => {
    const GuiStore = useStore(GuiStateStore);
    return <>
        {GuiStore.GuiState.showMenuPanel &&
            <div className={styles.Menu_main}>
                Menu
            </div>}
    </>
}

export default Menu