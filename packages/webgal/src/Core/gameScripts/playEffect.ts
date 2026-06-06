import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { logger } from '@/Core/util/logger';
import { webgalStore } from '@/store/store';
import { getNumberArgByKey, getStringArgByKey } from '@/Core/util/getSentenceArg';
import { createNonePerform, IPerform } from '@/Core/Modules/perform/performInterface';
import { WebGAL } from '@/Core/WebGAL';
import { WEBGAL_NONE } from '@/Core/constants';

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
  const id = getStringArgByKey(sentence, 'id') ?? '';
  if (id) {
    performInitName = `effect-sound-${id}`;
    WebGAL.gameplay.performController.unmountPerform(performInitName, true);
    isLoop = true;
  }
  let isOver = false;
  let seElement: HTMLAudioElement | null = null;
  if (!url || url === WEBGAL_NONE) {
    return createNonePerform({ blockingAuto: false });
  }
  return {
    performName: performInitName,
    duration: 1000 * 60 * 60,
    isHoldOn: isLoop,
    skipNextCollect: true,
    startFunction: () => {
      let volume = getNumberArgByKey(sentence, 'volume') ?? 100; // 获取音量比
      volume = Math.max(0, Math.min(volume, 100)); // 限制音量在 0-100 之间
      seElement = document.createElement('audio');
      seElement.src = url;
      if (isLoop) {
        seElement.loop = true;
      }
      const userDataState = webgalStore.getState().userData;
      const mainVol = userDataState.optionData.volumeMain;
      const seVol = mainVol * 0.01 * (userDataState.optionData?.seVolume ?? 100) * 0.01 * volume * 0.01;
      seElement.volume = seVol;
      seElement.currentTime = 0;
      const endFunc = () => {
        isOver = true;
        WebGAL.gameplay.performController.unmountPerform(performInitName);
      };
      seElement.onended = endFunc;
      seElement.addEventListener('error', () => {
        logger.error(`播放效果音失败: ${url}`);
        endFunc();
      });
      seElement.play().catch(() => {});
    },
    blockingAuto(): boolean {
      if (isLoop) return false;
      return !isOver;
    },
    blockingNext(): boolean {
      return false;
    },
    stopFunction(): void {
      if (!seElement) return;
      seElement.onended = null;
      seElement.pause();
      seElement.remove();
      seElement = null;
    },
  };
};
