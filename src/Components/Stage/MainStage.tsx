import { FC, useEffect } from 'react';
import styles from './mainStage.module.scss';
import { TextBox } from './TextBox/TextBox';
import { FigureContainer } from './FigureContainer/FigureContainer';
import { AudioContainer } from './AudioContainer/AudioContainer';
import { FullScreenPerform } from './FullScreenPerform/FullScreenPerform';
import { nextSentence } from '@/Core/controller/gamePlay/nextSentence';
import { stopAll } from '@/Core/controller/gamePlay/fastSkip';
import { IEffect } from '@/interface/stateInterface/stageInterface';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setVisibility } from '@/store/GUIReducer';
import { TextBoxFilm } from '@/Components/Stage/TextBox/TextBoxFilm';
import { useHotkey } from '@/hooks/useHotkey';
import { RUNTIME_GAMEPLAY } from '@/Core/runtime/gamePlay';
import { generateBgSoftInFn } from '@/Core/controller/stage/pixi/animations/bgSoftIn';

export const MainStage: FC = () => {
  const stageState = useSelector((state: RootState) => state.stage);
  const GUIState = useSelector((state: RootState) => state.GUI);
  const oldBg = useSelector((state: RootState) => state.stageTemp.oldBg);
  const oldBgKey = useSelector((state: RootState) => state.stageTemp.oldBgKey);
  const dispatch = useDispatch();

  /**
   * 设置效果
   */
  useEffect(() => {
    const effectList: Array<IEffect> = stageState.effects;
    setTimeout(() => {
      effectList.forEach((effect) => {
        const target = document.getElementById(effect.target);
        if (target) {
          if (effect.filter !== '') {
            target.style.filter = effect.filter;
          }
          if (effect.transform !== '') {
            target.style.transform = effect.transform;
          }
        }
      });
    }, 100);
  });

  /**
   * 设置背景
   */
  useEffect(() => {
    if (stageState.bgName !== '') {
      const currentBg = RUNTIME_GAMEPLAY.pixiStage?.getBgByKey('main');
      if (currentBg) {
        if (currentBg.url !== stageState.bgName) {
          RUNTIME_GAMEPLAY.pixiStage?.removeBg('main');
          RUNTIME_GAMEPLAY.pixiStage?.removeTicker('bg-softin');
        }
      }
      RUNTIME_GAMEPLAY.pixiStage?.addBg('main', stageState.bgName).then((res) => {
        if (res) {
          RUNTIME_GAMEPLAY.pixiStage!.getBgByKey('main')!.pixiSprite.alpha = 0;
          RUNTIME_GAMEPLAY.pixiStage!.registerTicker(generateBgSoftInFn('main', 3000), 'bg-softin', 'main');
        }
      });
    } else {
      RUNTIME_GAMEPLAY.pixiStage?.removeBg('main');
      RUNTIME_GAMEPLAY.pixiStage?.removeTicker('bg-softin');
    }
  });
  let stageWidth = '100%';
  let stageHeight = '100%';
  let top = '0';
  if (stageState.enableFilm !== '') {
    stageHeight = '76%';
    top = '12%';
  }
  useHotkey();
  return (
    <div className={styles.MainStage_main}>
      <div
        className={styles.MainStage_main_container}
        style={{ opacity: 0, width: stageWidth, height: stageHeight, top: top }}
      >
        {oldBg !== '' && (
          <div
            key={'bgOld' + oldBg + oldBgKey}
            id="MainStage_bg_OldContainer"
            className={styles.MainStage_oldBgContainer}
            style={{
              backgroundImage: `url("${oldBg}")`,
              backgroundSize: 'cover',
            }}
          />
        )}
        <div
          key={'bgMain' + stageState.bgName}
          id="MainStage_bg_MainContainer"
          className={styles.MainStage_bgContainer}
          style={{
            backgroundImage: `url("${stageState.bgName}")`,
            backgroundSize: 'cover',
          }}
        />
        <FigureContainer />
      </div>
      <FullScreenPerform />
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
        style={{ width: '100%', height: '100%', position: 'absolute', zIndex: '12', top: '0' }}
      />
    </div>
  );
};
