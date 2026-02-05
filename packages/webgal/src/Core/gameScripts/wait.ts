import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { setWaitNoBreak } from '@/store/GUIReducer';
import { webgalStore } from '@/store/store';
import { getBooleanArgByKey } from '../util/getSentenceArg';

/**
 * 等待 n 毫秒
 * @param sentence
 */
export const wait = (sentence: ISentence): IPerform => {
  const duration = Number(sentence.content);
  const performName = `wait${Math.random().toString()}`;
  const nobreak = getBooleanArgByKey(sentence, 'nobreak') ?? false;

  if (nobreak) {
    webgalStore.dispatch(setWaitNoBreak(true));
    setTimeout(() => {
      webgalStore.dispatch(setWaitNoBreak(false));
    }, duration);
  }

  return {
    performName,
    duration: duration,
    goNextWhenOver: true,
    isHoldOn: false,
    stopFunction: () => {},
    blockingNext: () => false,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };
};
