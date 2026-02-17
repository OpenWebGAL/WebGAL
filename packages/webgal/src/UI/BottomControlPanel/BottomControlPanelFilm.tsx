import styles from './bottomControlPanelFilm.module.scss';
import { switchAuto } from '@/Core/controller/gamePlay/autoPlay';
import { switchFast } from '@/Core/controller/gamePlay/fastSkip';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setMenuPanelTag, setVisibility } from '@/store/GUIReducer';
import { componentsVisibility, MenuPanelTag } from '@/store/guiInterface';
import { backToTitle } from '@/Core/controller/gamePlay/backToTitle';
import { useValue } from '@/hooks/useValue';
import { HamburgerButton } from '@icon-park/react';
import useApplyStyle from '@/hooks/useApplyStyle';

export const BottomControlPanelFilm = () => {
  const showPanel = useValue(false);
  const stageState = useSelector((state: RootState) => state.stage);
  const applyStyle = useApplyStyle('bottomControlPanelFilm');
  const dispatch = useDispatch();
  const setComponentVisibility = (component: keyof componentsVisibility, visibility: boolean) => {
    dispatch(setVisibility({ component, visibility }));
  };
  const setMenuPanel = (menuPanel: MenuPanelTag) => {
    dispatch(setMenuPanelTag(menuPanel));
  };
  return (
    <>
      {stageState.enableFilm !== '' && (
        <>
          <div
            className={applyStyle('tag', styles.tag)}
            onClick={() => {
              showPanel.set(!showPanel.value);
            }}
          >
            <HamburgerButton theme="outline" size="32" fill="#fff" />
          </div>
          {showPanel.value && (
            <div className={applyStyle('container', styles.container)}>
              <span
                className={applyStyle('singleButton', styles.singleButton)}
                onClick={() => {
                  setComponentVisibility('showBacklog', true);
                  setComponentVisibility('showTextBox', false);
                  showPanel.set(!showPanel.value);
                }}
              >
                <span className={applyStyle('button_text', styles.button_text)}>剧情回想 / BACKLOG</span>
              </span>
              <span
                className={applyStyle('singleButton', styles.singleButton)}
                onClick={() => {
                  showPanel.set(!showPanel.value);
                  let VocalControl: any = document.getElementById('currentVocal');
                  if (VocalControl !== null) {
                    VocalControl.currentTime = 0;
                    VocalControl.pause();
                    VocalControl?.play();
                  }
                }}
              >
                <span className={applyStyle('button_text', styles.button_text)}>重播语音 / REPLAY VOICE</span>
              </span>
              <span
                id="Button_ControlPanel_auto"
                className={applyStyle('singleButton', styles.singleButton)}
                onClick={() => {
                  switchAuto();
                  showPanel.set(!showPanel.value);
                }}
              >
                <span className={applyStyle('button_text', styles.button_text)}>自动模式 / AUTO</span>
              </span>
              <span
                id="Button_ControlPanel_fast"
                className={applyStyle('singleButton', styles.singleButton)}
                onClick={() => {
                  switchFast();
                  showPanel.set(!showPanel.value);
                }}
              >
                <span className={applyStyle('button_text', styles.button_text)}>快进 / FAST</span>
              </span>
              <span
                className={applyStyle('singleButton', styles.singleButton)}
                onClick={() => {
                  showPanel.set(!showPanel.value);
                  setMenuPanel(MenuPanelTag.Save);
                  setComponentVisibility('showMenuPanel', true);
                }}
              >
                <span className={applyStyle('button_text', styles.button_text)}>存档 / SAVE</span>
              </span>
              <span
                className={applyStyle('singleButton', styles.singleButton)}
                onClick={() => {
                  showPanel.set(!showPanel.value);
                  setMenuPanel(MenuPanelTag.Load);
                  setComponentVisibility('showMenuPanel', true);
                }}
              >
                <span className={applyStyle('button_text', styles.button_text)}>读档 / LOAD</span>
              </span>
              <span
                className={applyStyle('singleButton', styles.singleButton)}
                onClick={() => {
                  showPanel.set(!showPanel.value);
                  setMenuPanel(MenuPanelTag.Option);
                  setComponentVisibility('showMenuPanel', true);
                }}
              >
                <span className={applyStyle('button_text', styles.button_text)}>选项 / OPTIONS</span>
              </span>
              <span
                className={applyStyle('singleButton', styles.singleButton)}
                onClick={() => {
                  showPanel.set(!showPanel.value);
                  backToTitle();
                }}
              >
                <span className={applyStyle('button_text', styles.button_text)}>标题 / TITLE</span>
              </span>
            </div>
          )}
        </>
      )}
    </>
  );
};
