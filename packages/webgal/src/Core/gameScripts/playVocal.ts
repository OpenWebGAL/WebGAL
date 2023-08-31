import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { logger } from '@/Core/util/etc/logger';
import { webgalStore } from '@/store/store';
import { setStage } from '@/store/stageReducer';
import { WebGAL } from '@/main';
import { getSentenceArgByKey } from '@/Core/util/getSentenceArg';
import { IStageState } from '@/store/stageInterface';

/**
 * 播放一段语音
 * @param sentence 语句
 */
export const playVocal = (sentence: ISentence) => {
  logger.debug('play vocal');
  const performInitName = 'vocal-play';
  const url = getSentenceArgByKey(sentence, 'vocal'); // 获取语音的url
  const volume = getSentenceArgByKey(sentence, 'volume'); // 获取语音的音量比
  let currentStageState: IStageState;
  currentStageState = webgalStore.getState().stage;
  let pos = '';
  let key = '';

  // 先停止之前的语音
  let VocalControl: any = document.getElementById('currentVocal');
  WebGAL.gameplay.performController.unmountPerform('vocal-play', true);
  if (VocalControl !== null) {
    VocalControl.currentTime = 0;
    VocalControl.pause();
  }

  for (const e of sentence.args) {
    if (e.key === 'left' && e.value === true) {
      pos = 'left';
    }
    if (e.key === 'right' && e.value === true) {
      pos = 'right';
    }
    if (e.key === 'center' && e.value === true) {
      pos = 'center';
    }
    if (e.key === 'figureId') {
      key = `${e.value.toString()}`
    }
  }

  // 获得舞台状态
  webgalStore.dispatch(setStage({ key: 'vocal', value: url }));
  webgalStore.dispatch(setStage({ key: 'figureId',  value: key }));
  webgalStore.dispatch(setStage({ key: 'figurePos',  value: pos }));

    // blinkAnimation
  if(currentStageState.animationFlag === "on"){

    const foundFigure = currentStageState.freeFigure.find(figure => figure.key === key);
    if (foundFigure) {
      pos = foundFigure.basePosition;
    }

    let isBlinking = false;
    let blinkTimerID:any = null;
    let animationEndTime:any = null;

    function blinkAnimation() {
      if (isBlinking || (animationEndTime && Date.now() > animationEndTime)) return;
    
      isBlinking = true;
      WebGAL.gameplay.pixiStage?.performBlinkAnimation(key, currentStageState, 'closed', pos);
    
      setTimeout(() => {
        WebGAL.gameplay.pixiStage?.performBlinkAnimation(key, currentStageState, 'open', pos);
        isBlinking = false;
        const nextBlinkTime = Math.random() * 300 + 3500;
        setTimeout(blinkAnimation, nextBlinkTime);
      }, 200);
    }

    // 5sec
    animationEndTime = Date.now() + 10000;
    blinkAnimation();

    // 5sec
    setTimeout(() => {
      clearTimeout(blinkTimerID);
    }, 10000);
  }

  let isOver = false;
  return {
    arrangePerformPromise: new Promise((resolve) => {
      // 播放语音
      setTimeout(() => {
        let VocalControl: any = document.getElementById('currentVocal');
        // 设置语音音量
        typeof volume === 'number' && volume >= 0 && volume <= 100
          ? webgalStore.dispatch(setStage({ key: 'vocalVolume', value: volume }))
          : webgalStore.dispatch(setStage({ key: 'vocalVolume', value: 100 }));
        // 设置语音
        if (VocalControl !== null) {
          VocalControl.currentTime = 0;
          // 播放并作为一个特别演出加入
          const perform = {
            performName: performInitName,
            duration: 1000 * 60 * 60,
            isOver: false,
            isHoldOn: false,
            stopFunction: () => {
              // 演出已经结束了，所以不用播放语音了
              VocalControl.oncanplay = () => {};
              VocalControl.pause();
            },
            blockingNext: () => false,
            blockingAuto: () => {
              return !isOver;
            },
            skipNextCollect: true,
            stopTimeout: undefined, // 暂时不用，后面会交给自动清除
          };
          WebGAL.gameplay.performController.arrangeNewPerform(perform, sentence, false);
          VocalControl.oncanplay = () => {
            VocalControl?.play();
          };
          VocalControl.onended = () => {
            for (const e of WebGAL.gameplay.performController.performList) {
              if (e.performName === performInitName) {
                isOver = true;
                e.stopFunction();
                WebGAL.gameplay.performController.unmountPerform(e.performName);
              }
            }
          };
        }
      }, 1);
    }),
  };
};
