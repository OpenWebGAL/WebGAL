import styles from './menuPanel.module.scss'
import {useStore} from "reto";
import {GuiStateStore, MenuPanelTag} from "../../../Core/store/GUI";
import {Save, SettingTwo, FolderOpen, Home, Logout} from "@icon-park/react";

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
    const SaveIconColor = GuiStore.GuiState.currentMenuTag === MenuPanelTag.Save ? `rgba(74, 34, 93, 0.9)` : `rgba(185,185,185,1)`;
    const LoadIconColor = GuiStore.GuiState.currentMenuTag === MenuPanelTag.Load ? `rgba(11, 52, 110, 0.9)` : `rgba(185,185,185,1)`;
    const OptionIconColor = GuiStore.GuiState.currentMenuTag === MenuPanelTag.Option ? `rgba(81, 110, 65, 0.9)` : `rgba(185,185,185,1)`;

    return <div className={styles.MenuPanel_main}>
        <div className={styles.MenuPanel_button + SaveTagOn}
             onClick={() => {
                 GuiStore.setMenuPanelTag(MenuPanelTag.Save)
             }}
             style={{color: SaveTagColor}}
        >
            <div className={styles.MenuPanel_button_icon}>
                <Save theme="outline" size="1.2em" fill={SaveIconColor}
                      strokeWidth={2}/>
            </div>
            存档
        </div>
        <div className={styles.MenuPanel_button + LoadTagOn}
             onClick={() => {
                 GuiStore.setMenuPanelTag(MenuPanelTag.Load)
             }}
             style={{color: LoadTagColor}}
        >
            <div className={styles.MenuPanel_button_icon}>
                <FolderOpen theme="outline" size="1.2em" fill={LoadIconColor}
                            strokeWidth={2}/>
            </div>
            读档
        </div>
        <div className={styles.MenuPanel_button + OptionTagOn}
             onClick={() => {
                 GuiStore.setMenuPanelTag(MenuPanelTag.Option)
             }}
             style={{color: OptionTagColor}}
        >
            <div className={styles.MenuPanel_button_icon}>
                <SettingTwo theme="outline" size="1.2em" fill={OptionIconColor}
                            strokeWidth={2}/>
            </div>
            选项
        </div>
        <div className={styles.MenuPanel_button}>
            <div className={styles.MenuPanel_button_icon}>
                <Home theme="outline" size="1.2em" fill={'rgba(185,185,185,1)'}
                      strokeWidth={2}/>
            </div>
            标题
        </div>
        <div className={styles.MenuPanel_button}>
            <div className={styles.MenuPanel_button_icon}>
                <Logout theme="outline" size="1.2em" fill={'rgba(185,185,185,1)'}
                      strokeWidth={2}/>
            </div>
            结束
        </div>
    </div>
}