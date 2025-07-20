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
import { IGuiState } from '@/store/guiInterface';
import { IStageState } from '@/store/stageInterface';
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

function checkMousePosition(event: React.MouseEvent, GUIState: IGuiState, dispatch: ReturnType<typeof useDispatch>) {
  if (!GUIState.controlsVisibility && inTextBox(event)) {
    dispatch(setVisibility({ component: 'controlsVisibility', visibility: true }));
  }
  if (GUIState.controlsVisibility && !inTextBox(event)) {
    dispatch(setVisibility({ component: 'controlsVisibility', visibility: false }));
  }
}

function isTextboxHidden(stageState: IStageState, GUIState: IGuiState) {
  if (!GUIState.showTextBox) {
    return true;
  }

  if (stageState.isDisableTextbox) {
    return true;
  }

  const isText = stageState.showText !== '' || stageState.showName !== '';
  if (!isText) {
    return true;
  }

  const isInIntro = document.getElementById('introContainer')?.style.display === 'block';
  if (isInIntro) {
    return true;
  }

  return false;
}

let timeoutEventHandle: ReturnType<typeof setTimeout> | null = null;

/**
 * 检查并更新控制可见性
 * @param event 鼠标移动事件
 * @param stageState 场景状态
 * @param GUIState GUI状态
 * @param dispatch Redux dispatch函数
 */
// eslint-disable-next-line max-params
function updateControlsVisibility(
  event: React.MouseEvent,
  stageState: IStageState,
  GUIState: IGuiState,
  dispatch: ReturnType<typeof useDispatch>,
) {
  if (isTextboxHidden(stageState, GUIState)) {
    // 当文本框被隐藏时
    // 逻辑：鼠标移动时显示，一段时间（默认：1秒）后隐藏
    if (timeoutEventHandle) {
      clearTimeout(timeoutEventHandle);
    }

    dispatch(setVisibility({ component: 'controlsVisibility', visibility: true }));
    timeoutEventHandle = setTimeout(() => {
      dispatch(setVisibility({ component: 'controlsVisibility', visibility: false }));
    }, 1000);
  } else {
    // 当文本框正常显示时
    // 逻辑：鼠标位置在文本框内时显示
    checkMousePosition(event, GUIState, dispatch);
  }
}

export const Stage: FC = () => {
  const stageState = useSelector((state: RootState) => state.stage);
  const GUIState = useSelector((state: RootState) => state.GUI);
  const dispatch = useDispatch();

  useHotkey();

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
          WebGAL.events.fullscreenDbClick.emit();
        }}
        id="FullScreenClick"
        style={{ width: '100%', height: '100%', position: 'absolute', zIndex: '12', top: '0' }}
        onMouseMove={(e) => !GUIState.showControls && updateControlsVisibility(e, stageState, GUIState, dispatch)}
      />
      <IntroContainer />
    </div>
  );
};
