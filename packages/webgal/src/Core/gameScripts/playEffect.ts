import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { logger } from '@/Core/util/etc/logger';
import { webgalStore } from '@/store/store';
import { getSentenceArgByKey } from '@/Core/util/getSentenceArg';
import { WebGAL } from '@/main';
import { IPerform } from '@/Core/Modules/perform/performInterface';

/**
 * 播放一段效果音
 * @param sentence 语句
 */
export const playEffect = (sentence: ISentence): IPerform => {
  logger.debug('播放效果音');
  // 如果有ID，这里被覆写，一般用于循环的情况
  // 有循环参数且有 ID，就循环
  let performInitName = 'effect-sound';
  // 清除先前的效果音
  WebGAL.gameplay.performController.unmountPerform(performInitName, true);
  let url = sentence.content;
  let isLoop = false;
  // 清除带 id 的效果音
  if (getSentenceArgByKey(sentence, 'id')) {
    const id = getSentenceArgByKey(sentence, 'id');
    performInitName = `effect-sound-${id}`;
    WebGAL.gameplay.performController.unmountPerform(performInitName, true);
    isLoop = true;
  }
  let isOver = false;
  return {
    performName: 'none',
    blockingAuto(): boolean {
      return false;
    },
    blockingNext(): boolean {
      return false;
    },
    isHoldOn: false,
    stopFunction(): void {},
    stopTimeout: undefined,

    duration: 1000 * 60 * 60,
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
          isHoldOn: isLoop,
          skipNextCollect: true,
          stopFunction: () => {
            // 演出已经结束了，所以不用播放语音了
            VocalControl.oncanplay = () => {};
            VocalControl.pause();
          },
          blockingNext: () => false,
          blockingAuto: () => {
            return !isOver;
          },
          stopTimeout: undefined, // 暂时不用，后面会交给自动清除
        };
        resolve(perform);
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
      }, 1);
    }),
  };
};
