import { FC, useEffect, useState } from 'react';
import styles from './stage.module.scss';
import { TextBox } from './TextBox/TextBox';
import { AudioContainer } from './AudioContainer/AudioContainer';
import { FullScreenPerform } from './FullScreenPerform/FullScreenPerform';
import { nextSentence } from '@/Core/controller/gamePlay/nextSentence';
import { stopAll } from '@/Core/controller/gamePlay/fastSkip';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setVisibility } from '@/store/GUIReducer';
import { TextBoxFilm } from '@/Components/Stage/TextBox/TextBoxFilm';
import { useHotkey } from '@/hooks/useHotkey';
import { MainStage } from '@/Components/Stage/MainStage/MainStage';
import IntroContainer from '@/Components/Stage/introContainer/IntroContainer';
import { isIOS } from '@/Core/initializeScript';
import { PointerEvents } from 'pixi.js';
// import OldStage from '@/Components/Stage/OldStage/OldStage';

export const Stage: FC = () => {
  const stageState = useSelector((state: RootState) => state.stage);
  const GUIState = useSelector((state: RootState) => state.GUI);
  const dispatch = useDispatch();
  const [pointerEvents, setPointerEvents] = useState('auto');

  useHotkey();

  // 控制是否可以继续解析
  useEffect(() => {
    setPointerEvents(stageState.isPause ? 'none' : 'auto');
  }, [stageState.isPause]);

  return (
    <div className={styles.MainStage_main}>
      <FullScreenPerform />
      {/* 已弃用旧的立绘与背景舞台 */}
      {/* <OldStage /> */}
      <MainStage />
      <div id="pixiContianer" className={styles.pixiContainer} style={{ zIndex: isIOS ? '-5' : undefined }} />
      <div id="chooseContainer" className={styles.chooseContainer} />
      <div id="uiContainer" />
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
        id="FullScreenClick"
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          zIndex: '12',
          top: '0',
          pointerEvents: pointerEvents as PointerEvents,
        }}
      />
      <IntroContainer />
    </div>
  );
};
