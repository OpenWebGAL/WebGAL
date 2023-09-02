import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { logger } from '@/Core/util/etc/logger';
import { RootState, webgalStore } from '@/store/store';
import { getSentenceArgByKey } from '@/Core/util/getSentenceArg';
import { WebGAL } from '@/main';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { useSelector } from 'react-redux';

/**
 * 播放一段效果音
 * @param sentence 语句
 */
export const playEffect = (sentence: ISentence): IPerform => {
  logger.debug('play SE');
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
      // 播放效果音
      setTimeout(() => {
        const volumeArg = getSentenceArgByKey(sentence, 'volume');
        let seElement = document.createElement('audio');
        seElement.src = url;
        if (isLoop) {
          seElement.loop = true;
        }
        const userDataState = webgalStore.getState().userData;
        const mainVol = userDataState.optionData.volumeMain;
        // Work when volumeArg is a number between 0 and 100
        const volume = typeof volumeArg === 'number' && volumeArg >= 0 && volumeArg <= 100 ? volumeArg : 100;
        const seVol = mainVol * 0.01 * (userDataState.optionData?.seVolume ?? 100) * 0.01 * volume * 0.01;
        seElement.volume = seVol;
        seElement.currentTime = 0;
        const perform = {
          performName: performInitName,
          duration: 1000 * 60 * 60,
          isHoldOn: isLoop,
          skipNextCollect: true,
          stopFunction: () => {
            // 演出已经结束了，所以不用播放效果音了
            seElement.oncanplay = () => {};
            seElement.pause();
          },
          blockingNext: () => false,
          blockingAuto: () => {
            return !isOver;
          },
          stopTimeout: undefined, // 暂时不用，后面会交给自动清除
        };
        resolve(perform);
        seElement.oncanplay = () => {
          seElement?.play();
        };
        seElement.onended = () => {
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
