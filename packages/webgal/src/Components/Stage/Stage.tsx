import { FC } from 'react';
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
import { WebGAL } from '@/Core/WebGAL';
// import OldStage from '@/Components/Stage/OldStage/OldStage';

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
          WebGAL.eventBus.emit('fullscreen-dbclick');
        }}
        id="FullScreenClick"
        style={{ width: '100%', height: '100%', position: 'absolute', zIndex: '12', top: '0' }}
      />
      <IntroContainer />
    </div>
  );
};
