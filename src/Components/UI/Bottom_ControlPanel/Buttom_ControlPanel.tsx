import {AlignTextLeftOne, DoubleRight, FolderOpen, Home, PlayOne, ReplayMusic, Save, SettingTwo} from '@icon-park/react'
import styles from './bottom_controlPanel.module.scss'
import {useStore} from "reto";
import {GuiStateStore, MenuPanelTag} from "../../../Core/store/GUI";
import {switchAuto} from "../../../Core/controller/gamePlay/autoPlay";
import {switchFast} from '../../../Core/controller/gamePlay/fastSkip';
import {runScript} from "../../../Core/controller/gamePlay/runScript";
import {getRef} from "../../../Core/store/storeRef";

export const Bottom_ControlPanel = () => {
    const GUIstore = useStore(GuiStateStore);
    const restoreOne = (index: number) => {
        runScript(getRef('stageRef').stageState.PerformList[index].script);
    }
    const restorePerform = () => {
        const len = getRef('stageRef').stageState.PerformList.length;
        for (let i = 0; i < len; i++) {
            const event = new MouseEvent('click', {
                'view': window,
                'bubbles': true,
                'cancelable': true,
                'clientX': i,
            });
            const textBox = document.getElementById('restoreOne_target');
            if (textBox !== null) {
                textBox.dispatchEvent(event);
            }
        }
    }

    return <div className={styles.main}>
        <AlignTextLeftOne theme="outline" size="36" fill="#f5f5f7" strokeWidth={3.5}/>
        <ReplayMusic theme="outline" size="36" fill="#f5f5f7" strokeWidth={3.5}/>
        <PlayOne onClick={switchAuto} theme="outline" size="36" fill="#f5f5f7" strokeWidth={3.5}/>
        <DoubleRight onClick={switchFast} theme="outline" size="36" fill="#f5f5f7" strokeWidth={3.5}/>
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
        <div id={'restoreOne_target'} style={{display: 'none'}} onClick={(event) => restoreOne(event.clientX)}/>
        <div id={'restorePerform_target'} onClick={restorePerform} style={{display: 'none'}}/>
    </div>
}