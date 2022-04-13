import {
    AlignTextLeftOne,
    DoubleRight,
    FolderOpen,
    Home,
    PlayOne,
    ReplayMusic,
    Save,
    SettingTwo,
} from '@icon-park/react';
import styles from './bottomControlPanel.module.scss';
import { useStore } from 'reto';
import { GuiStateStore, MenuPanelTag } from '../../../Core/store/GUI';
import { switchAuto } from '../../../Core/controller/gamePlay/autoPlay';
import { switchFast } from '../../../Core/controller/gamePlay/fastSkip';
import { playBgm } from '../../../Core/util/playBgm';

export const BottomControlPanel = () => {
    const GUIstore = useStore(GuiStateStore);

    return (
        <div className={styles.main}>
            <span className={styles.singleButton} onClick={() => GUIstore.setVisibility('showBacklog', true)}>
                <AlignTextLeftOne
                    className={styles.button}
                    theme="outline"
                    size="30"
                    fill="#f5f5f7"
                    strokeWidth={3.5}
                />
                <span className={styles.button_text}>回想</span>
            </span>
            <span className={styles.singleButton} onClick={()=>{
                let VocalControl: any = document.getElementById('currentVocal');
                if (VocalControl !== null) {
                    VocalControl.currentTime = 0;
                    VocalControl.pause();
                    VocalControl.play();
                }
            }}>
                <ReplayMusic className={styles.button} theme="outline" size="30" fill="#f5f5f7" strokeWidth={3.5} />
                <span className={styles.button_text}>重播</span>
            </span>
            <span id="Button_ControlPanel_auto" className={styles.singleButton} onClick={switchAuto}>
                <PlayOne className={styles.button} theme="outline" size="30" fill="#f5f5f7" strokeWidth={3.5} />
                <span className={styles.button_text}>自动</span>
            </span>
            <span id="Button_ControlPanel_fast" className={styles.singleButton} onClick={switchFast}>
                <DoubleRight className={styles.button} theme="outline" size="30" fill="#f5f5f7" strokeWidth={3.5} />
                <span className={styles.button_text}>快进</span>
            </span>
            <span
                className={styles.singleButton}
                onClick={() => {
                    GUIstore.setMenuPanelTag(MenuPanelTag.Save);
                    GUIstore.setVisibility('showMenuPanel', true);
                }}
            >
                <Save className={styles.button} theme="outline" size="30" fill="#f5f5f7" strokeWidth={3.5} />
                <span className={styles.button_text}>存档</span>
            </span>
            <span
                className={styles.singleButton}
                onClick={() => {
                    GUIstore.setMenuPanelTag(MenuPanelTag.Load);
                    GUIstore.setVisibility('showMenuPanel', true);
                }}
            >
                <FolderOpen className={styles.button} theme="outline" size="30" fill="#f5f5f7" strokeWidth={3.5} />
                <span className={styles.button_text}>读档</span>
            </span>
            <span
                className={styles.singleButton}
                onClick={() => {
                    GUIstore.setMenuPanelTag(MenuPanelTag.Option);
                    GUIstore.setVisibility('showMenuPanel', true);
                }}
            >
                <SettingTwo className={styles.button} theme="outline" size="30" fill="#f5f5f7" strokeWidth={3.5} />
                <span className={styles.button_text}>选项</span>
            </span>
            <span
                className={styles.singleButton}
                onClick={() => {
                    GUIstore.setVisibility('showTitle', true);
                    playBgm(GUIstore.GuiState.titleBgm);
                }}
            >
                <Home className={styles.button} theme="outline" size="30" fill="#f5f5f7" strokeWidth={3.5} />
                <span className={styles.button_text}>标题</span>
            </span>
        </div>
    );
};
