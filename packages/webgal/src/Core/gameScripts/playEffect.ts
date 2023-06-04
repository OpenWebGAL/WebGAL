import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { RUNTIME_GAMEPLAY } from '@/Core/runtime/gamePlay';
import { logger } from '@/Core/util/etc/logger';
import { webgalStore } from '@/store/store';
import { getSentenceArgByKey } from '@/Core/util/getSentenceArg';
import { PerformController } from '@/Core/controller/perform/performController';

/**
 * 播放一段效果音
 * @param sentence 语句
 */
export const playEffect = (sentence: ISentence) => {
  logger.debug('播放效果音');
  // 如果有ID，这里被覆写，一般用于循环的情况
  // 有循环参数且有 ID，就循环
  let performInitName = 'effect-sound';
  // 清除先前的效果音
  PerformController.unmountPerform(performInitName, true);
  let url = sentence.content;
  let isLoop = false;
  // 清除带 id 的效果音
  if (getSentenceArgByKey(sentence, 'id')) {
    const id = getSentenceArgByKey(sentence, 'id');
    performInitName = `effect-sound-${id}`;
    PerformController.unmountPerform(performInitName, true);
    isLoop = true;
  }
  return {
    performName: 'none',
    arrangePerformPromise: new Promise((resolve) => {
      // 播放语音
      setTimeout(() => {
        let VocalControl = document.createElement('audio');
        VocalControl.src = url;
        if (isLoop) {
          VocalControl.loop = true;
        }
        const userDataState = webgalStore.getState().userData;
        const mainVol = userDataState.optionData.volumeMain;
        VocalControl.volume = mainVol * 0.01 * userDataState.optionData.vocalVolume * 0.01;
        VocalControl.currentTime = 0;
        const perform = {
          performName: performInitName,
          duration: 1000 * 60 * 60,
          isOver: false,
          isHoldOn: isLoop,
          skipNextCollect: true,
          stopFunction: () => {
            // 演出已经结束了，所以不用播放语音了
            VocalControl.oncanplay = () => {};
            VocalControl.pause();
          },
          blockingNext: () => false,
          blockingAuto: () => true,
          stopTimeout: undefined, // 暂时不用，后面会交给自动清除
        };
        resolve(perform);
        VocalControl.oncanplay = () => {
          VocalControl.play().then();
        };
        VocalControl.onended = () => {
          for (const e of RUNTIME_GAMEPLAY.performList) {
            if (e.performName === performInitName) {
              e.isOver = true;
              e.stopFunction();
              PerformController.unmountPerform(e.performName);
            }
          }
        };
      }, 1);
    }),
  };
};
