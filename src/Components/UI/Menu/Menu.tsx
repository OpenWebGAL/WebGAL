import {FC} from "react";
import {useStore} from "reto";
import {GuiStateStore, MenuPanelTag} from "../../../Core/store/GUI";
import styles from './menu.module.scss'
import {MenuPanel} from "./MenuPanel";
import {Save} from "./Save";
import {Load} from "./Load";
import {Options} from "./Options";

const Menu: FC = () => {
    const GuiStore = useStore(GuiStateStore);
    let currentTag;
    switch (GuiStore.GuiState.currentMenuTag) {
        case MenuPanelTag.Save:
            currentTag = <Save/>;
            break;
        case MenuPanelTag.Load:
            currentTag = <Load/>;
            break;
        case MenuPanelTag.Option:
            currentTag = <Options/>;
            break;
    }
    return <>
        {GuiStore.GuiState.showMenuPanel &&
            <div className={styles.Menu_main}>
                <div className={styles.Menu_TagContent}>
                    {currentTag}
                </div>
                <MenuPanel/>
            </div>}
    </>
}

export default Menu