import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';

/**
 * 等待 n 毫秒
 * @param sentence
 */
export const wait = (sentence: ISentence): IPerform => {
  const duration = Number(sentence.content);
  const performName = `wait${Math.random().toString()}`;
  return {
    performName,
    duration: duration,
    isHoldOn: false,
    stopFunction: () => {},
    blockingNext: () => false,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };
};
