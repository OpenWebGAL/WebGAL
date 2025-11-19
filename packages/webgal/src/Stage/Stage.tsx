import React, { FC } from 'react';
import styles from './stage.module.scss';
import { TextBox } from './TextBox/TextBox';
import { AudioContainer } from './AudioContainer/AudioContainer';
import { FullScreenPerform } from './FullScreenPerform/FullScreenPerform';
import { nextSentence } from '@/Core/controller/gamePlay/nextSentence';
import { stopAll } from '@/Core/controller/gamePlay/fastSkip';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, webgalStore } from '@/store/store';
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

let timeoutEventHandle: ReturnType<typeof setTimeout> | null = null;
// 视为“未移动”的最小移动阈值（像素^2），例如 4px -> 16
const MOVE_THRESHOLD_SQ = 16;
let lastMouseX = 0;
let lastMouseY = 0;
let hasLastMousePos = false;

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
  // 新逻辑：超过阈值的鼠标移动立刻显示，2s 无操作后隐藏（未锁定时）
  const { clientX, clientY } = event;
  let movedEnough = false;
  if (!hasLastMousePos) {
    movedEnough = true; // 第一次移动视为足够
    hasLastMousePos = true;
  } else {
    const dx = clientX - lastMouseX;
    const dy = clientY - lastMouseY;
    movedEnough = dx * dx + dy * dy >= MOVE_THRESHOLD_SQ;
  }
  lastMouseX = clientX;
  lastMouseY = clientY;

  if (!movedEnough) {
    // 微小移动，视为无操作，不重置计时器
    return;
  }

  if (timeoutEventHandle) {
    clearTimeout(timeoutEventHandle);
  }

  if (!GUIState.controlsVisibility) {
    dispatch(setVisibility({ component: 'controlsVisibility', visibility: true }));
  }

  timeoutEventHandle = setTimeout(() => {
    if (!webgalStore.getState().GUI.showControls) {
      dispatch(setVisibility({ component: 'controlsVisibility', visibility: false }));
    }
  }, 2000);
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
