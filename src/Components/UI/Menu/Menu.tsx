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
    let menuBgColor: string = '';
    switch (GuiStore.GuiState.currentMenuTag) {
        case MenuPanelTag.Save:
            currentTag = <Save/>;
            menuBgColor = 'rgba(74,34,93,0.95)';
            break;
        case MenuPanelTag.Load:
            currentTag = <Load/>;
            menuBgColor = 'rgba(11,52,110,0.95)';
            break;
        case MenuPanelTag.Option:
            currentTag = <Options/>;
            menuBgColor = 'rgba(255,255,255,0.95)';
            break;
    }
    return <>
        {GuiStore.GuiState.showMenuPanel &&
            <div className={styles.Menu_main} style={{backgroundColor: menuBgColor}}>
                <div className={styles.Menu_TagContent}>
                    {currentTag}
                </div>
                <MenuPanel/>
            </div>}
    </>
}

export default Menu