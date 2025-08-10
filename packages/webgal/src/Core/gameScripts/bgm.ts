import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { playBgm } from '@/Core/controller/stage/playBgm';
import { getNumberArgByKey, getStringArgByKey } from '@/Core/util/getSentenceArg';
import { webgalStore } from '@/store/store';
import { unlockBgmInUserData } from '@/store/userDataReducer';

/**
 * 播放一段bgm
 * @param sentence
 */
export const bgm = (sentence: ISentence): IPerform => {
  let url: string = sentence.content; // 获取bgm的url
  const name = getStringArgByKey(sentence, 'unlockname') ?? '';
  const series = getStringArgByKey(sentence, 'series') ?? 'default';
  let enter = getNumberArgByKey(sentence, 'enter') ?? 0; // 获取bgm的淡入时间
  enter = Math.max(0, enter); // 限制淡入时间在 0 以上
  let volume = getNumberArgByKey(sentence, 'volume') ?? 100; // 获取bgm的音量比
  volume = Math.max(0, Math.min(volume, 100)); // 限制音量在 0-100 之间

  if (name !== '') {
    webgalStore.dispatch(unlockBgmInUserData({ name, url, series }));
  }

  playBgm(url, enter, volume);

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
