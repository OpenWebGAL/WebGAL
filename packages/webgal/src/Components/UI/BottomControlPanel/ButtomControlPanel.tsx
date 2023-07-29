import {
  AlignTextLeftOne,
  DoubleRight,
  FolderOpen,
  Home,
  PlayOne,
  PreviewCloseOne,
  PreviewOpen,
  ReplayMusic,
  Save,
  SettingTwo,
  DoubleDown,
  DoubleUp,
} from '@icon-park/react';
import styles from './bottomControlPanel.module.scss';
import { switchAuto } from '@/Core/controller/gamePlay/autoPlay';
import { switchFast } from '@/Core/controller/gamePlay/fastSkip';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setMenuPanelTag, setVisibility } from '@/store/GUIReducer';
import { componentsVisibility, MenuPanelTag } from '@/store/guiInterface';
import { backToTitle } from '@/Core/controller/gamePlay/backToTitle';
import { saveGame } from '@/Core/controller/storage/saveGame';
import { loadGame } from '@/Core/controller/storage/loadGame';
import useTrans from '@/hooks/useTrans';
import { useTranslation } from 'react-i18next';

export const BottomControlPanel = () => {
  const t = useTrans('gaming.');
  const strokeWidth = 2.5;
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const isFr = lang === 'fr';
  let size = 42;
  let fontSize = '150%';
  if (isFr) {
    fontSize = '125%';
    size = 40;
  }
  const GUIStore = useSelector((state: RootState) => state.GUI);
  const stageState = useSelector((state: RootState) => state.stage);
  const dispatch = useDispatch();
  const setComponentVisibility = (component: keyof componentsVisibility, visibility: boolean) => {
    dispatch(setVisibility({ component, visibility }));
  };
  const setMenuPanel = (menuPanel: MenuPanelTag) => {
    dispatch(setMenuPanelTag(menuPanel));
  };

  const saveData = useSelector((state: RootState) => state.userData.saveData);
  let fastSlPreview = (
    <div style={{ height: '100%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ fontSize: '125%' }}>{t('noSaving')}</div>
    </div>
  );
  if (saveData[0]) {
    const data = saveData[0];
    fastSlPreview = (
      <div className={styles.slPreviewMain}>
        <div className={styles.imgContainer}>
          <img style={{ height: '100%' }} alt="q-save-preview image" src={data.previewImage} />
        </div>
        <div className={styles.textContainer}>
          <div>{data.nowStageState.showName}</div>
          <div style={{ fontSize: '75%', color: 'rgb(55,60,56)' }}>{data.nowStageState.showText}</div>
        </div>
      </div>
    );
  }

  return (
    // <div className={styles.ToCenter}>
    <>
      {GUIStore.showTextBox && stageState.enableFilm === '' && (
        <div className={styles.main}>
          {GUIStore.showTextBox && (
            <span
              className={styles.singleButton}
              style={{ fontSize }}
              onClick={() => setComponentVisibility('showTextBox', false)}
            >
              <PreviewCloseOne
                className={styles.button}
                theme="outline"
                size={size}
                fill="#f5f5f7"
                strokeWidth={strokeWidth}
              />
              <span className={styles.button_text}>{t('buttons.hide')}</span>
            </span>
          )}
          {!GUIStore.showTextBox && (
            <span
              className={styles.singleButton}
              style={{ fontSize }}
              onClick={() => setComponentVisibility('showTextBox', true)}
            >
              <PreviewOpen
                className={styles.button}
                theme="outline"
                size={size}
                fill="#f5f5f7"
                strokeWidth={strokeWidth}
              />
              <span className={styles.button_text}>{t('buttons.show')}</span>
            </span>
          )}
          <span
            className={styles.singleButton}
            style={{ fontSize }}
            onClick={() => {
              setComponentVisibility('showBacklog', true);
              setComponentVisibility('showTextBox', false);
            }}
          >
            <AlignTextLeftOne
              className={styles.button}
              theme="outline"
              size={size}
              fill="#f5f5f7"
              strokeWidth={strokeWidth}
            />
            <span className={styles.button_text}>{t('buttons.backlog')}</span>
          </span>
          <span
            className={styles.singleButton}
            style={{ fontSize }}
            onClick={() => {
              let VocalControl: any = document.getElementById('currentVocal');
              if (VocalControl !== null) {
                VocalControl.currentTime = 0;
                VocalControl.pause();
                VocalControl?.play();
              }
            }}
          >
            <ReplayMusic
              className={styles.button}
              theme="outline"
              size={size}
              fill="#f5f5f7"
              strokeWidth={strokeWidth}
            />
            <span className={styles.button_text}>{t('buttons.replay')}</span>
          </span>
          <span id="Button_ControlPanel_auto" className={styles.singleButton} style={{ fontSize }} onClick={switchAuto}>
            <PlayOne className={styles.button} theme="outline" size={size} fill="#f5f5f7" strokeWidth={strokeWidth} />
            <span className={styles.button_text}>{t('buttons.auto')}</span>
          </span>
          <span id="Button_ControlPanel_fast" className={styles.singleButton} style={{ fontSize }} onClick={switchFast}>
            <DoubleRight
              className={styles.button}
              theme="outline"
              size={size}
              fill="#f5f5f7"
              strokeWidth={strokeWidth}
            />
            <span className={styles.button_text}>{t('buttons.forward')}</span>
          </span>
          <span
            className={styles.singleButton + ' ' + styles.fastsave}
            style={{ fontSize }}
            onClick={() => {
              saveGame(0);
            }}
          >
            <DoubleDown
              className={styles.button}
              theme="outline"
              size={size}
              fill="#f5f5f7"
              strokeWidth={strokeWidth}
            />
            <span className={styles.button_text}>{t('buttons.quicklySave')}</span>
            <div className={styles.fastSlPreview + ' ' + styles.fastSPreview}>{fastSlPreview}</div>
          </span>
          <span
            className={styles.singleButton + ' ' + styles.fastload}
            style={{ fontSize }}
            onClick={() => {
              loadGame(0);
            }}
          >
            <DoubleUp className={styles.button} theme="outline" size={size} fill="#f5f5f7" strokeWidth={strokeWidth} />
            <span className={styles.button_text}>{t('buttons.quicklyLoad')}</span>
            <div className={styles.fastSlPreview + ' ' + styles.fastLPreview}>{fastSlPreview}</div>
          </span>
          <span
            className={styles.singleButton}
            style={{ fontSize }}
            onClick={() => {
              setMenuPanel(MenuPanelTag.Save);
              setComponentVisibility('showMenuPanel', true);
            }}
          >
            <Save className={styles.button} theme="outline" size={size} fill="#f5f5f7" strokeWidth={strokeWidth} />
            <span className={styles.button_text}>{t('buttons.save')}</span>
          </span>
          <span
            className={styles.singleButton}
            style={{ fontSize }}
            onClick={() => {
              setMenuPanel(MenuPanelTag.Load);
              setComponentVisibility('showMenuPanel', true);
            }}
          >
            <FolderOpen
              className={styles.button}
              theme="outline"
              size={size}
              fill="#f5f5f7"
              strokeWidth={strokeWidth}
            />
            <span className={styles.button_text}>{t('buttons.load')}</span>
          </span>
          <span
            className={styles.singleButton}
            style={{ fontSize }}
            onClick={() => {
              setMenuPanel(MenuPanelTag.Option);
              setComponentVisibility('showMenuPanel', true);
            }}
          >
            <SettingTwo
              className={styles.button}
              theme="outline"
              size={size}
              fill="#f5f5f7"
              strokeWidth={strokeWidth}
            />
            <span className={styles.button_text}>{t('buttons.options')}</span>
          </span>
          <span
            className={styles.singleButton}
            style={{ fontSize }}
            onClick={() => {
              backToTitle();
            }}
          >
            <Home className={styles.button} theme="outline" size={size} fill="#f5f5f7" strokeWidth={strokeWidth} />
            <span className={styles.button_text}>{t('buttons.title')}</span>
          </span>
        </div>
      )}
    </>
    // </div>
  );
};
