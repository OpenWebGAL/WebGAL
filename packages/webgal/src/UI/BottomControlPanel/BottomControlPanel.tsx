import { switchAuto } from '@/Core/controller/gamePlay/autoPlay';
import { backToTitle } from '@/Core/controller/gamePlay/backToTitle';
import { switchFast } from '@/Core/controller/gamePlay/fastSkip';
import { loadGame } from '@/Core/controller/storage/loadGame';
import { saveGame } from '@/Core/controller/storage/saveGame';
import { showGlogalDialog, switchControls } from '@/UI/GlobalDialog/GlobalDialog';
import { easyCompile } from '@/UI/Menu/SaveAndLoad/Save/Save';
import useFullScreen from '@/hooks/useFullScreen';
import useSoundEffect from '@/hooks/useSoundEffect';
import useTrans from '@/hooks/useTrans';
import { setMenuPanelTag, setVisibility } from '@/store/GUIReducer';
import { componentsVisibility, MenuPanelTag } from '@/store/guiInterface';
import { RootState } from '@/store/store';
import {
  AlignTextLeftOne,
  DoubleDown,
  DoubleRight,
  DoubleUp,
  FolderOpen,
  FullScreen,
  Home,
  Lock,
  OffScreen,
  PlayOne,
  PreviewCloseOne,
  PreviewOpen,
  ReplayMusic,
  Save,
  SettingTwo,
  Unlock,
} from '@icon-park/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import styles from './bottomControlPanel.module.scss';
import useApplyStyle from '@/hooks/useApplyStyle';

export const BottomControlPanel = () => {
  const t = useTrans('gaming.');
  const strokeWidth = 2.5;
  const { i18n } = useTranslation();
  const { playSeEnter, playSeClick, playSeDialogOpen } = useSoundEffect();
  const applyStyle = useApplyStyle('bottomControlPanel');
  const lang = i18n.language;
  const isFr = lang === 'fr';
  const [showFastSavePreview, setShowFastSavePreview] = useState(false);
  const [showFastLoadPreview, setShowFastLoadPreview] = useState(false);
  let size = 42;
  let fontSize = '150%';
  if (isFr) {
    fontSize = '125%';
    size = 40;
  }
  const { isSupported: isFullscreenSupport, isFullScreen, toggle: toggleFullscreen } = useFullScreen();
  const GUIStore = useSelector((state: RootState) => state.GUI);
  const stageState = useSelector((state: RootState) => state.stage);
  const dispatch = useDispatch();
  const setComponentVisibility = (component: keyof componentsVisibility, visibility: boolean) => {
    dispatch(setVisibility({ component, visibility }));
  };
  const setMenuPanel = (menuPanel: MenuPanelTag) => {
    dispatch(setMenuPanelTag(menuPanel));
  };

  const saveData = useSelector((state: RootState) => state.saveData.saveData);
  let fastSlPreview = (
    <div style={{ height: '100%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ fontSize: '125%' }}>{t('noSaving')}</div>
    </div>
  );
  if (saveData[0]) {
    const data = saveData[0];
    fastSlPreview = (
      <div className={applyStyle('slPreviewMain', styles.slPreviewMain)}>
        <div className={applyStyle('imgContainer', styles.imgContainer)}>
          <img style={{ height: '100%' }} alt="q-save-preview image" src={data.previewImage} />
        </div>
        <div className={applyStyle('textContainer', styles.textContainer)}>
          <div>{easyCompile(data.nowStageState.showName)}</div>
          <div style={{ fontSize: '75%', color: 'rgb(55,60,56)' }}>{easyCompile(data.nowStageState.showText)}</div>
        </div>
      </div>
    );
  }

  return (
    // <div className={styles.ToCenter}>
    <>
      {GUIStore.showTextBox && stageState.enableFilm === '' && (
        <div
          className={applyStyle('main', styles.main)}
          style={{ visibility: GUIStore.controlsVisibility ? 'visible' : 'hidden' }}
        >
          {GUIStore.showTextBox && (
            <span
              className={applyStyle('singleButton', styles.singleButton)}
              style={{ fontSize }}
              onClick={() => {
                setComponentVisibility('showTextBox', false);
                playSeClick();
              }}
              onMouseEnter={playSeEnter}
            >
              <PreviewCloseOne
                className={applyStyle('button', styles.button)}
                theme="outline"
                size={size}
                fill="#f5f5f7"
                strokeWidth={strokeWidth}
              />
              <span className={applyStyle('button_text', styles.button_text)}>{t('buttons.hide')}</span>
            </span>
          )}
          {!GUIStore.showTextBox && (
            <span
              className={applyStyle('singleButton', styles.singleButton)}
              style={{ fontSize }}
              onClick={() => {
                setComponentVisibility('showTextBox', true);
                playSeClick();
              }}
              onMouseEnter={playSeEnter}
            >
              <PreviewOpen
                className={applyStyle('button', styles.button)}
                theme="outline"
                size={size}
                fill="#f5f5f7"
                strokeWidth={strokeWidth}
              />
              <span className={applyStyle('button_text', styles.button_text)}>{t('buttons.show')}</span>
            </span>
          )}
          <span
            className={applyStyle('singleButton', styles.singleButton)}
            style={{ fontSize }}
            onClick={() => {
              setComponentVisibility('showBacklog', true);
              setComponentVisibility('showTextBox', false);
              playSeClick();
            }}
            onMouseEnter={playSeEnter}
          >
            <AlignTextLeftOne
              className={applyStyle('button', styles.button)}
              theme="outline"
              size={size}
              fill="#f5f5f7"
              strokeWidth={strokeWidth}
            />
            <span className={applyStyle('button_text', styles.button_text)}>{t('buttons.backlog')}</span>
          </span>
          <span
            className={applyStyle('singleButton', styles.singleButton)}
            style={{ fontSize }}
            onClick={() => {
              let VocalControl: any = document.getElementById('currentVocal');
              if (VocalControl !== null) {
                VocalControl.currentTime = 0;
                VocalControl.pause();
                VocalControl?.play();
              }
              playSeClick();
            }}
            onMouseEnter={playSeEnter}
          >
            <ReplayMusic
              className={applyStyle('button', styles.button)}
              theme="outline"
              size={size}
              fill="#f5f5f7"
              strokeWidth={strokeWidth}
            />
            <span className={applyStyle('button_text', styles.button_text)}>{t('buttons.replay')}</span>
          </span>
          <span
            id="Button_ControlPanel_auto"
            className={applyStyle('singleButton', styles.singleButton)}
            style={{ fontSize }}
            onClick={() => {
              switchAuto();
              playSeClick();
            }}
            onMouseEnter={playSeEnter}
          >
            <PlayOne
              className={applyStyle('button', styles.button)}
              theme="outline"
              size={size}
              fill="#f5f5f7"
              strokeWidth={strokeWidth}
            />
            <span className={applyStyle('button_text', styles.button_text)}>{t('buttons.auto')}</span>
          </span>
          <span
            id="Button_ControlPanel_fast"
            className={applyStyle('singleButton', styles.singleButton)}
            style={{ fontSize }}
            onClick={() => {
              switchFast();
              playSeClick();
            }}
            onMouseEnter={playSeEnter}
          >
            <DoubleRight
              className={applyStyle('button', styles.button)}
              theme="outline"
              size={size}
              fill="#f5f5f7"
              strokeWidth={strokeWidth}
            />
            <span className={applyStyle('button_text', styles.button_text)}>{t('buttons.forward')}</span>
          </span>
          <span
            className={`${applyStyle('singleButton', styles.singleButton)} ${applyStyle('fastsave', styles.fastsave)}`}
            style={{ fontSize }}
            onClick={() => {
              saveGame(0);
              playSeClick();
            }}
            onMouseEnter={() => {
              setShowFastSavePreview(true);
              setShowFastLoadPreview(false);
              playSeEnter();
            }}
            onMouseLeave={() => {
              setShowFastSavePreview(false);
            }}
          >
            <DoubleDown
              className={applyStyle('button', styles.button)}
              theme="outline"
              size={size}
              fill="#f5f5f7"
              strokeWidth={strokeWidth}
            />
            <span className={applyStyle('button_text', styles.button_text)}>{t('buttons.quicklySave')}</span>
            <div
              className={`${applyStyle('fastSlPreview', styles.fastSlPreview)} ${applyStyle('fastSPreview', styles.fastSPreview)}`}
              style={showFastSavePreview ? undefined : { display: 'none' }}
            >
              {fastSlPreview}
            </div>
          </span>
          <span
            className={`${applyStyle('singleButton', styles.singleButton)} ${applyStyle('fastload', styles.fastload)}`}
            style={{ fontSize }}
            onClick={() => {
              loadGame(0);
              playSeClick();
            }}
            onMouseEnter={() => {
              setShowFastLoadPreview(true);
              setShowFastSavePreview(false);
              playSeEnter();
            }}
            onMouseLeave={() => {
              setShowFastLoadPreview(false);
            }}
          >
            <DoubleUp
              className={applyStyle('button', styles.button)}
              theme="outline"
              size={size}
              fill="#f5f5f7"
              strokeWidth={strokeWidth}
            />
            <span className={applyStyle('button_text', styles.button_text)}>{t('buttons.quicklyLoad')}</span>
            <div
              className={`${applyStyle('fastSlPreview', styles.fastSlPreview)} ${applyStyle('fastLPreview', styles.fastLPreview)}`}
              style={showFastLoadPreview ? undefined : { display: 'none' }}
            >
              {fastSlPreview}
            </div>
          </span>
          <span
            className={applyStyle('singleButton', styles.singleButton)}
            style={{ fontSize }}
            onClick={() => {
              setMenuPanel(MenuPanelTag.Save);
              setComponentVisibility('showMenuPanel', true);
              playSeClick();
            }}
            onMouseEnter={playSeEnter}
          >
            <Save
              className={applyStyle('button', styles.button)}
              theme="outline"
              size={size}
              fill="#f5f5f7"
              strokeWidth={strokeWidth}
            />
            <span className={applyStyle('button_text', styles.button_text)}>{t('buttons.save')}</span>
          </span>
          <span
            className={applyStyle('singleButton', styles.singleButton)}
            style={{ fontSize }}
            onClick={() => {
              setMenuPanel(MenuPanelTag.Load);
              setComponentVisibility('showMenuPanel', true);
              playSeClick();
            }}
            onMouseEnter={playSeEnter}
          >
            <FolderOpen
              className={applyStyle('button', styles.button)}
              theme="outline"
              size={size}
              fill="#f5f5f7"
              strokeWidth={strokeWidth}
            />
            <span className={applyStyle('button_text', styles.button_text)}>{t('buttons.load')}</span>
          </span>
          <span
            className={applyStyle('singleButton', styles.singleButton)}
            style={{ fontSize }}
            onClick={() => {
              setMenuPanel(MenuPanelTag.Option);
              setComponentVisibility('showMenuPanel', true);
              playSeClick();
            }}
            onMouseEnter={playSeEnter}
          >
            <SettingTwo
              className={applyStyle('button', styles.button)}
              theme="outline"
              size={size}
              fill="#f5f5f7"
              strokeWidth={strokeWidth}
            />
            <span className={applyStyle('button_text', styles.button_text)}>{t('buttons.options')}</span>
          </span>
          <span
            className={applyStyle('singleButton', styles.singleButton)}
            style={{ fontSize }}
            onClick={() => {
              playSeDialogOpen();
              showGlogalDialog({
                title: t('buttons.titleTips'),
                leftText: t('$common.yes'),
                rightText: t('$common.no'),
                leftFunc: () => {
                  backToTitle();
                },
                rightFunc: () => {},
              });
            }}
            onMouseEnter={playSeEnter}
          >
            <Home
              className={applyStyle('button', styles.button)}
              theme="outline"
              size={size}
              fill="#f5f5f7"
              strokeWidth={strokeWidth}
            />
            <span className={applyStyle('button_text', styles.button_text)}>{t('buttons.title')}</span>
          </span>
          {isFullscreenSupport && (
            <span
              className={applyStyle('singleButton', styles.singleButton)}
              style={{ fontSize }}
              onClick={toggleFullscreen}
              onMouseEnter={playSeEnter}
            >
              {!isFullScreen && (
                <FullScreen
                  className={applyStyle('button', styles.button)}
                  theme="outline"
                  size={size}
                  fill="#f5f5f7"
                  strokeWidth={strokeWidth}
                />
              )}
              {isFullScreen && (
                <OffScreen
                  className={applyStyle('button', styles.button)}
                  theme="outline"
                  size={size}
                  fill="#f5f5f7"
                  strokeWidth={strokeWidth}
                />
              )}
              <span className={applyStyle('button_text', styles.button_text)}>{t('buttons.fullscreen')}</span>
            </span>
          )}
          <span
            className={applyStyle('singleButton', styles.singleButton)}
            style={{ fontSize }}
            onClick={() => {
              switchControls();
              playSeClick();
            }}
            onMouseEnter={playSeEnter}
          >
            {GUIStore.showControls ? (
              <Lock
                className={applyStyle('button', styles.button)}
                theme="outline"
                size={size}
                fill="#f5f5f7"
                strokeWidth={strokeWidth}
              />
            ) : (
              <Unlock
                className={applyStyle('button', styles.button)}
                theme="outline"
                size={size}
                fill="#f5f5f7"
                strokeWidth={strokeWidth}
              />
            )}
          </span>
        </div>
      )}
    </>
    // </div>
  );
};
