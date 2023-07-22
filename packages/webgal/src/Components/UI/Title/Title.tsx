import { FC } from 'react';
import styles from './title.module.scss';
import { playBgm } from '@/Core/controller/stage/playBgm';
import { continueGame, startGame } from '@/Core/controller/gamePlay/startContinueGame';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, webgalStore } from '@/store/store';
import { setMenuPanelTag, setVisibility } from '@/store/GUIReducer';
import { MenuPanelTag } from '@/store/guiInterface';
import { nextSentence } from '@/Core/controller/gamePlay/nextSentence';
import { restorePerform } from '@/Core/controller/storage/jumpFromBacklog';
import { setEbg } from '@/Core/util/setEbg';
import useTrans from '@/hooks/useTrans';
// import { resize } from '@/Core/util/resize';
import { WebGAL } from '@/main';
import { hasFastSaveRecord, loadFastSaveGame } from '@/Core/controller/storage/fastSaveLoad';

/**
 * 标题页
 * @constructor
 */
const Title: FC = () => {
  const GUIState = useSelector((state: RootState) => state.GUI);
  const dispatch = useDispatch();
  const background = GUIState.titleBg;
  const showBackground = background === '' ? 'rgba(0,0,0,1)' : `url("${background}")`;
  const t = useTrans('title.');

  return (
    <>
      {GUIState.showTitle && <div className={styles.Title_backup_background} />}
      <div
        id="enter_game_target"
        onClick={() => {
          playBgm(GUIState.titleBgm);
          dispatch(setVisibility({ component: 'isEnterGame', visibility: true }));
          // setTimeout(resize, 2000);
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
              <div className={styles.Title_button_text + ' ' + styles.Title_button_text_up}>{t('start.title')}</div>
              <div className={styles.Title_button_text}>{t('start.subtitle')}</div>
            </div>
            <div
              className={styles.Title_button}
              onClick={async () => {
                dispatch(setVisibility({ component: 'showTitle', visibility: false }));
                continueGame();
              }}
            >
              <div className={styles.Title_button_text + ' ' + styles.Title_button_text_up}>{t('continue.title')}</div>
              <div className={styles.Title_button_text}>{t('continue.subtitle')}</div>
            </div>
            <div
              className={styles.Title_button}
              onClick={() => {
                dispatch(setVisibility({ component: 'showMenuPanel', visibility: true }));
                dispatch(setMenuPanelTag(MenuPanelTag.Option));
              }}
            >
              <div className={styles.Title_button_text + ' ' + styles.Title_button_text_up}>{t('options.title')}</div>
              <div className={styles.Title_button_text}>{t('options.subtitle')}</div>
            </div>
            <div
              className={styles.Title_button}
              onClick={() => {
                dispatch(setVisibility({ component: 'showMenuPanel', visibility: true }));
                dispatch(setMenuPanelTag(MenuPanelTag.Load));
              }}
            >
              <div className={styles.Title_button_text + ' ' + styles.Title_button_text_up}>{t('load.title')}</div>
              <div className={styles.Title_button_text}>{t('load.subtitle')}</div>
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
                dispatch(setVisibility({ component: 'showExtra', visibility: true }));
              }}
            >
              <div className={styles.Title_button_text + ' ' + styles.Title_button_text_up}>{t('extra.title')}</div>
              <div className={styles.Title_button_text}>{t('extra.subtitle')}</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Title;
