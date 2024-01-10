import React, { FC } from 'react';
import styles from './stage.module.scss';
import { TextBox } from './TextBox/TextBox';
import { AudioContainer } from './AudioContainer/AudioContainer';
import { FullScreenPerform } from './FullScreenPerform/FullScreenPerform';
import { nextSentence } from '@/Core/controller/gamePlay/nextSentence';
import { stopAll } from '@/Core/controller/gamePlay/fastSkip';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setVisibility } from '@/store/GUIReducer';
import { TextBoxFilm } from '@/Stage/TextBox/TextBoxFilm';
import { useHotkey } from '@/hooks/useHotkey';
import { MainStage } from '@/Stage/MainStage/MainStage';
import IntroContainer from '@/Stage/introContainer/IntroContainer';
import { isIOS } from '@/Core/initializeScript';
import { WebGAL } from '@/Core/WebGAL';
// import OldStage from '@/Components/Stage/OldStage/OldStage';

function inTextBox(event: React.MouseEvent) {
  const tb = document.getElementById('textBoxMain');
  if (!tb) {
    return false;
  }
  let bounds = tb.getBoundingClientRect();
  return (
    event.clientX > bounds.left &&
    event.clientX < bounds.right &&
    event.clientY > bounds.top &&
    event.clientY < bounds.bottom
  );
}

export const Stage: FC = () => {
  const stageState = useSelector((state: RootState) => state.stage);
  const GUIState = useSelector((state: RootState) => state.GUI);
  const dispatch = useDispatch();

  useHotkey();

  const checkPosition = (event: React.MouseEvent) => {
    if (!GUIState.controlsVisibility && inTextBox(event)) {
      dispatch(setVisibility({ component: 'controlsVisibility', visibility: true }));
    }
    if (GUIState.controlsVisibility && !inTextBox(event)) {
      dispatch(setVisibility({ component: 'controlsVisibility', visibility: false }));
    }
  };

  return (
    <div className={styles.MainStage_main}>
      <FullScreenPerform />
      {/* 已弃用旧的立绘与背景舞台 */}
      {/* <OldStage /> */}
      <MainStage />
      <div id="pixiContianer" className={styles.pixiContainer} style={{ zIndex: isIOS ? '-5' : undefined }} />
      <div id="chooseContainer" className={styles.chooseContainer} />
      {GUIState.showTextBox && stageState.enableFilm === '' && !stageState.isDisableTextbox && <TextBox />}
      {GUIState.showTextBox && stageState.enableFilm !== '' && <TextBoxFilm />}
      <AudioContainer />
      <div
        onClick={() => {
          // 如果文本框没有显示，则显示文本框
          if (!GUIState.showTextBox) {
            dispatch(setVisibility({ component: 'showTextBox', visibility: true }));
            return;
          }
          stopAll();
          nextSentence();
        }}
        onDoubleClick={() => {
          WebGAL.eventBus.emit('fullscreen-dbclick');
        }}
        id="FullScreenClick"
        style={{ width: '100%', height: '100%', position: 'absolute', zIndex: '12', top: '0' }}
        onMouseMove={(e) => !GUIState.showControls && checkPosition(e)}
      />
      <IntroContainer />
    </div>
  );
};
