import React, { FC } from 'react';
import styles from './stage.module.scss';
import { TextBox } from './TextBox/TextBox';
import { AudioContainer } from './AudioContainer/AudioContainer';
import { nextSentence } from '@/Core/controller/gamePlay/nextSentence';
import { stopAll } from '@/Core/controller/gamePlay/fastSkip';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, webgalStore } from '@/store/store';
import { setVisibility } from '@/store/GUIReducer';
import { TextBoxFilm } from '@/Stage/TextBox/TextBoxFilm';
import { useHotkey } from '@/hooks/useHotkey';
import { MainStage } from '@/Stage/MainStage/MainStage';
import { isIOS } from '@/Core/initializeScript';
import { WebGAL } from '@/Core/WebGAL';
import useApplyStyle from '@/hooks/useApplyStyle';
import { ControlPanel } from '@/Stage/ControlPanel/controlPanel';
import { Backlog } from '@/Stage/Backlog/Backlog';

export const Stage: FC = () => {
  const stageState = useSelector((state: RootState) => state.stage);
  const GUIState = useSelector((state: RootState) => state.GUI);
  const dispatch = useDispatch();
  const applyStyle = useApplyStyle('Stage/stage.scss');

  useHotkey();

  return (
    <div className={applyStyle('stage_main', styles.stage_main)}>
      <MainStage />
      <div
        id="pixiContianer"
        className={applyStyle('stage_pixi_container', styles.stage_pixi_container)}
        style={{ zIndex: isIOS ? '-5' : undefined }}
      />
      <TextBox />
      <TextBoxFilm />
      <AudioContainer />
      <div id="introContainer" className={applyStyle('stage_intro_container', styles.stage_intro_container)} />
      <div id="videoContainer" className={applyStyle('stage_video_container', styles.stage_video_container)} />
      <div
        className={applyStyle('stage_full_screen_click', styles.stage_full_screen_click)}
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
        id="fullScreenClick"
      />
      <div id="chooseContainer" className={applyStyle('stage_choose_container', styles.stage_choose_container)} />
      <div
        id="getUserInputContainer"
        className={applyStyle('stage_get_user_input_container', styles.stage_get_user_input_container)}
      />
      <ControlPanel />
      <Backlog />
    </div>
  );
};
