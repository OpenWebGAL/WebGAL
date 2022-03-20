import styles from './menuPanel.module.scss'
import {useStore} from "reto";
import {GuiStateStore, MenuPanelTag} from "../../../../Core/store/GUI";
import {MenuPanelButton} from "./MenuPanelButton";
import {logger} from '../../../../Core/util/logger';

/**
 * Menu页的底栏
 * @constructor
 */
export const MenuPanel = () => {
    const GuiStore = useStore(GuiStateStore);
    //设置Menu按钮的高亮
    const SaveTagOn = GuiStore.GuiState.currentMenuTag === MenuPanelTag.Save ? ` ${styles.MenuPanel_button_hl}` : ``;
    const LoadTagOn = GuiStore.GuiState.currentMenuTag === MenuPanelTag.Load ? ` ${styles.MenuPanel_button_hl}` : ``;
    const OptionTagOn = GuiStore.GuiState.currentMenuTag === MenuPanelTag.Option ? ` ${styles.MenuPanel_button_hl}` : ``;

    //设置Menu按钮的颜色
    const SaveTagColor = GuiStore.GuiState.currentMenuTag === MenuPanelTag.Save ? `rgba(74, 34, 93, 0.9)` : `rgba(8, 8, 8, 0.3)`;
    const LoadTagColor = GuiStore.GuiState.currentMenuTag === MenuPanelTag.Load ? `rgba(11, 52, 110, 0.9)` : `rgba(8, 8, 8, 0.3)`;
    const OptionTagColor = GuiStore.GuiState.currentMenuTag === MenuPanelTag.Option ? `rgba(81, 110, 65, 0.9)` : `rgba(8, 8, 8, 0.3)`;

    //设置Menu图标的颜色
    const SaveIconColor = GuiStore.GuiState.currentMenuTag === MenuPanelTag.Save ? `rgba(74, 34, 93, 0.9)` : `rgba(185, 185, 185, 1)`;
    const LoadIconColor = GuiStore.GuiState.currentMenuTag === MenuPanelTag.Load ? `rgba(11, 52, 110, 0.9)` : `rgba(185, 185, 185, 1)`;
    const OptionIconColor = GuiStore.GuiState.currentMenuTag === MenuPanelTag.Option ? `rgba(81, 110, 65, 0.9)` : `rgba(185, 185, 185, 1)`;

    return <div className={styles.MenuPanel_main}>
        <MenuPanelButton iconName={'save'} buttonOnClassName={SaveTagOn} iconColor={SaveIconColor}
                         tagColor={SaveTagColor}
                         clickFunc={() => {
                             GuiStore.setMenuPanelTag(MenuPanelTag.Save)
                         }}
                         tagName={'存档'} key={'saveButton'}/>
        <MenuPanelButton iconName={'load'} buttonOnClassName={LoadTagOn} iconColor={LoadIconColor}
                         tagColor={LoadTagColor}
                         clickFunc={() => {
                             GuiStore.setMenuPanelTag(MenuPanelTag.Load)
                         }}
                         tagName={'读档'} key={'loadButton'}/>
        <MenuPanelButton iconName={'option'} buttonOnClassName={OptionTagOn} iconColor={OptionIconColor}
                         tagColor={OptionTagColor}
                         clickFunc={() => {
                             GuiStore.setMenuPanelTag(MenuPanelTag.Option)
                         }}
                         tagName={'选项'} key={'optionButton'}/>
        <MenuPanelButton iconName={'title'}
                         clickFunc={() => {
                             GuiStore.setVisibility('showTitle', true);
                             GuiStore.setVisibility('showMenuPanel', false);
                         }
                         }
                         tagName={'标题'} key={'titleIcon'}/>
        <MenuPanelButton iconName={'exit'}
                         clickFunc={() => {
                             logger.info('退出');
                         }
                         }
                         tagName={'结束'} key={'exitIcon'}/>
    </div>
}