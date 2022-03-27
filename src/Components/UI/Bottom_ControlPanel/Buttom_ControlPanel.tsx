import {AlignTextLeftOne, DoubleRight, FolderOpen, Home, PlayOne, ReplayMusic, Save, SettingTwo} from '@icon-park/react'
import styles from './bottom_controlPanel.module.scss'
import {useStore} from "reto";
import {GuiStateStore, MenuPanelTag} from "../../../Core/store/GUI";

export const Bottom_ControlPanel = () => {
    const GUIstore = useStore(GuiStateStore);

    return <div className={styles.main}>
        <AlignTextLeftOne theme="outline" size="36" fill="#f5f5f7" strokeWidth={3.5}/>
        <ReplayMusic theme="outline" size="36" fill="#f5f5f7" strokeWidth={3.5}/>
        <PlayOne theme="outline" size="36" fill="#f5f5f7" strokeWidth={3.5}/>
        <DoubleRight theme="outline" size="36" fill="#f5f5f7" strokeWidth={3.5}/>
        <Save onClick={() => {
            GUIstore.setMenuPanelTag(MenuPanelTag.Save);
            GUIstore.setVisibility('showMenuPanel', true);
        }} theme="outline" size="36" fill="#f5f5f7" strokeWidth={3.5}/>
        <FolderOpen onClick={() => {
            GUIstore.setMenuPanelTag(MenuPanelTag.Load);
            GUIstore.setVisibility('showMenuPanel', true);
        }} theme="outline" size="36" fill="#f5f5f7" strokeWidth={3.5}/>
        <SettingTwo onClick={() => {
            GUIstore.setMenuPanelTag(MenuPanelTag.Option);
            GUIstore.setVisibility('showMenuPanel', true);
        }} theme="outline" size="36" fill="#f5f5f7" strokeWidth={3.5}/>
        <Home onClick={() => {
            GUIstore.setVisibility('showTitle', true);
        }} theme="outline" size="36" fill="#f5f5f7" strokeWidth={3.5}/>
    </div>
}