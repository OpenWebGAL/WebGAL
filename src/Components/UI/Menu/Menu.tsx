import {FC, ReactElement} from 'react';
import {useStore} from 'reto';
import {GuiStateStore, MenuPanelTag} from '../../../Core/store/GUI';
import styles from './menu.module.scss';
import {MenuPanel} from './MenuPanel/MenuPanel';
import {Save} from './SaveAndLoad/Save/Save';
import {Load} from './SaveAndLoad/Load/Load';
import {Options} from './Options/Options';

/**
 * Menu 页面，包括存读档、选项等
 * @constructor
 */
const Menu: FC = () => {
    const GuiStore = useStore(GuiStateStore);
    let currentTag;
    let menuBgColor = 'linear-gradient(135deg, rgba(253,251,251,0.95) 0%, rgba(235,237,238,1) 100%)';
    switch (GuiStore.GuiState.currentMenuTag) {
        case MenuPanelTag.Save:
            currentTag = <Save />;
            // menuBgColor = 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)';
            break;
        case MenuPanelTag.Load:
            currentTag = <Load />;
            // menuBgColor = 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)';
            break;
        case MenuPanelTag.Option:
            currentTag = <Options />;
            // menuBgColor = 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)';
            break;
    }
    return (
        <>
            {GuiStore.GuiState.showMenuPanel && (
                <div className={styles.Menu_main} style={{background: menuBgColor}}>
                    <div className={styles.Menu_TagContent}>{currentTag}</div>
                    <MenuPanel/>
                </div>
            )}
        </>
    );
};

export default Menu;
