import {FC} from 'react';
import styles from './title.module.scss';
import {playBgm} from '@/Core/controller/stage/playBgm';
import {startGame} from '@/Core/controller/gamePlay/startGame';
import {runtime_currentSceneData} from "@/Core/runtime/sceneData";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@/Core/store/store";
import {setMenuPanelTag, setVisibility} from "@/Core/store/GUIReducer";
import {MenuPanelTag} from '@/interface/stateInterface/guiInterface';
import {nextSentence} from "@/Core/controller/gamePlay/nextSentence";

/**
 * 标题页
 * @constructor
 */
const Title: FC = () => {
  const GUIState = useSelector((state: RootState) => state.GUI);
  const dispatch = useDispatch();
  const background = GUIState.titleBg;
  const showBackground = background === '' ? 'rgba(0,0,0,1)' : `url("${background}")`;
  return (
    <>
      {GUIState.showTitle && <div className={styles.Title_backup_background}/>}
      <div
        id="play_title_bgm_target"
        onClick={() => {
          playBgm(GUIState.titleBgm);
        }}
      />
      {GUIState.showTitle && (
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
            <div className={styles.Title_button} onClick={() => {
              dispatch(setVisibility({component: "showTitle", visibility: false}));
              if (runtime_currentSceneData.currentSentenceId === 0 &&
                runtime_currentSceneData.currentScene.sceneName === 'start.txt') {
                // 如果游戏没有开始，开始游戏
                nextSentence();
              }
            }}>
              <div className={styles.Title_button_text + ' ' + styles.Title_button_text_up}>继续游戏</div>
              <div className={styles.Title_button_text}>CONTINUE</div>
            </div>
            <div
              className={styles.Title_button}
              onClick={() => {
                dispatch(setVisibility({component: 'showMenuPanel', visibility: true}));
                dispatch(setMenuPanelTag(MenuPanelTag.Option));
              }}
            >
              <div className={styles.Title_button_text + ' ' + styles.Title_button_text_up}>游戏选项</div>
              <div className={styles.Title_button_text}>OPTIONS</div>
            </div>
            <div
              className={styles.Title_button}
              onClick={() => {
                dispatch(setVisibility({component: 'showMenuPanel', visibility: true}));
                dispatch(setMenuPanelTag(MenuPanelTag.Load,));
              }}
            >
              <div className={styles.Title_button_text + ' ' + styles.Title_button_text_up}>读取存档</div>
              <div className={styles.Title_button_text}>LOAD</div>
            </div>
            {/* <div */}
            {/*   className={styles.Title_button} */}
            {/*   onClick={() => { */}
            {/*     window.opener = null; */}
            {/*     window.open('', '_self'); */}
            {/*     window.close(); */}
            {/*   }} */}
            {/* > */}
            {/*   <div className={styles.Title_button_text + ' ' + styles.Title_button_text_up}>退出游戏</div> */}
            {/*   <div className={styles.Title_button_text}>EXIT</div> */}
            {/* </div> */}
            <div
              className={styles.Title_button}
              onClick={() => {
                dispatch(setVisibility({component: "showExtra", visibility: true}));
              }}
            >
              <div className={styles.Title_button_text + ' ' + styles.Title_button_text_up}>鉴赏模式</div>
              <div className={styles.Title_button_text}>EXTRA</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Title;
