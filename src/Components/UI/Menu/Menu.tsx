import {FC} from "react";
import {useStore} from "reto";
import {GuiStateStore, MenuPanelTag} from "../../../Core/store/GUI";
import styles from './menu.module.scss'
import {MenuPanel} from "./MenuPanel/MenuPanel";
import {Save} from "./SaveAndLoad/Save/Save";
import {Load} from "./SaveAndLoad/Load/Load";
import {Options} from "./Options/Options";

/**
 * Menu 页面，包括存读档、选项等
 * @constructor
 */
const Menu: FC = () => {
    const GuiStore = useStore(GuiStateStore);
    let currentTag;
    let menuBgColor: string = '';
    switch (GuiStore.GuiState.currentMenuTag) {
        case MenuPanelTag.Save:
            currentTag = <Save/>;
            menuBgColor = 'rgba(74,34,93,0.9)';
            break;
        case MenuPanelTag.Load:
            currentTag = <Load/>;
            menuBgColor = 'rgba(11,52,110,0.9)';
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