import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { playBgm } from '@/Core/controller/stage/playBgm';
import { getSentenceArgByKey } from '@/Core/util/getSentenceArg';
import { WebGAL } from '@/main';

/**
 * 播放一段bgm
 * @param sentence
 */
export const bgm = (sentence: ISentence): IPerform => {
  let url: string = sentence.content; // 获取bgm的url
  const enter = getSentenceArgByKey(sentence, 'enter'); // 获取bgm的淡入时间
  if (enter && typeof enter === 'number' && enter >= 0) {
    // 已正确设置淡入时间时，进行淡入
    playBgm(url, enter);
  } else {
    // 否则直接播放
    playBgm(url);
  }
  return {
    performName: 'none',
    duration: 0,
    isHoldOn: true,
    stopFunction: () => {},
    blockingNext: () => false,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };
};
