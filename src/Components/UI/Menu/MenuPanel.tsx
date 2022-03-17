import styles from './menuPanel.module.scss'
import {useStore} from "reto";
import {GuiStateStore, MenuPanelTag} from "../../../Core/store/GUI";

export const MenuPanel = () => {
    const GuiStore = useStore(GuiStateStore);
    //设置Menu按钮的高亮
    const SaveTagOn = GuiStore.GuiState.currentMenuTag === MenuPanelTag.Save ? ` ${styles.MenuPanel_button_hl}` : ``;
    const LoadTagOn = GuiStore.GuiState.currentMenuTag === MenuPanelTag.Load ? ` ${styles.MenuPanel_button_hl}` : ``;
    const OptionTagOn = GuiStore.GuiState.currentMenuTag === MenuPanelTag.Option ? ` ${styles.MenuPanel_button_hl}` : ``;
    return <div className={styles.MenuPanel_main}>
        <div className={styles.MenuPanel_button + SaveTagOn}
             onClick={() => {
                 GuiStore.setMenuPanelTag(MenuPanelTag.Save)
             }}
        >
            <div>存档</div>
            <div>SAVE</div>
        </div>
        <div className={styles.MenuPanel_button + LoadTagOn}
             onClick={() => {
                 GuiStore.setMenuPanelTag(MenuPanelTag.Load)
             }}
        >
            <div>读档</div>
            <div>LOAD</div>
        </div>
        <div className={styles.MenuPanel_button + OptionTagOn}
             onClick={() => {
                 GuiStore.setMenuPanelTag(MenuPanelTag.Option)
             }}
        >
            <div>选项</div>
            <div>OPTIONS</div>
        </div>
        <div className={styles.MenuPanel_button}>
            <div>标题</div>
            <div>TITLE</div>
        </div>
        <div className={styles.MenuPanel_button}>
            <div>结束</div>
            <div>EXIT</div>
        </div>
    </div>
}