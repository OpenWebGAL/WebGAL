import {FC} from 'react';
import styles from './title.module.scss';
import {useStore} from 'reto';
import {GuiStateStore, MenuPanelTag} from '../../../Core/store/GUI';
import {playBgm} from '../../../Core/util/playBgm';
import {startGame} from '../../../Core/controller/gamePlay/startGame';

/**
 * 标题页
 * @constructor
 */
const Title: FC = () => {
    const GuiStore = useStore(GuiStateStore);
    const background = GuiStore.GuiState.titleBg;
    const showBackground = background === '' ? 'rgba(0,0,0,1)' : `url("${background}")`;
    return (
        <>
            {GuiStore.GuiState.showTitle &&<div className={styles.Title_backup_background}/>}
            <div
                id="play_title_bgm_target"
                onClick={() => {
                    playBgm(GuiStore.GuiState.titleBgm);
                }}
            />
            {GuiStore.GuiState.showTitle && (
                <div
                    className={styles.Title_main}
                    style={{
                        backgroundImage: showBackground,
                        backgroundSize: 'cover',
                    }}
                >
                    <div className={styles.Title_buttonList}>
                        <div className={styles.Title_button} onClick={startGame}>
                            <div className={styles.Title_button_text + ' ' + styles.Title_button_text_up}>开始游戏</div>
                            <div className={styles.Title_button_text}>START</div>
                        </div>
                        <div className={styles.Title_button} onClick={() => GuiStore.setVisibility('showTitle', false)}>
                            <div className={styles.Title_button_text + ' ' + styles.Title_button_text_up}>继续游戏</div>
                            <div className={styles.Title_button_text}>CONTINUE</div>
                        </div>
                        <div
                            className={styles.Title_button}
                            onClick={() => {
                                GuiStore.setVisibility('showMenuPanel', true);
                                GuiStore.setMenuPanelTag(MenuPanelTag.Option);
                            }}
                        >
                            <div className={styles.Title_button_text + ' ' + styles.Title_button_text_up}>游戏选项</div>
                            <div className={styles.Title_button_text}>OPTIONS</div>
                        </div>
                        <div
                            className={styles.Title_button}
                            onClick={() => {
                                GuiStore.setVisibility('showMenuPanel', true);
                                GuiStore.setMenuPanelTag(MenuPanelTag.Load);
                            }}
                        >
                            <div className={styles.Title_button_text + ' ' + styles.Title_button_text_up}>读取存档</div>
                            <div className={styles.Title_button_text}>LOAD</div>
                        </div>
                        <div
                            className={styles.Title_button}
                            onClick={() => {
                                window.opener = null;
                                window.open('', '_self');
                                window.close();
                            }}
                        >
                            <div className={styles.Title_button_text + ' ' + styles.Title_button_text_up}>退出游戏</div>
                            <div className={styles.Title_button_text}>EXIT</div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Title;
