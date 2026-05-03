import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { getNumberArgByKey, getStringArgByKey } from '@/Core/util/getSentenceArg';
import { webgalStore } from '@/store/store';
import { unlockBgmInUserData } from '@/store/userDataReducer';
import localforage from 'localforage';
import { WebGAL } from '../WebGAL';
import bgmManager from '../Modules/audio/bgmManager';

/**
 * 播放一段bgm
 * @param sentence
 */
export const bgm = (sentence: ISentence): IPerform => {
  let url: string = sentence.content; // 获取bgm的url
  const name = getStringArgByKey(sentence, 'unlockname') ?? '';
  const series = getStringArgByKey(sentence, 'series') ?? 'default';
  let volume = getNumberArgByKey(sentence, 'volume') ?? 100; // 获取bgm的音量比
  volume = Math.max(0, Math.min(volume, 100)); // 限制音量在 0-100 之间
  let enter = getNumberArgByKey(sentence, 'enter') ?? 0; // 获取bgm的淡入时间
  enter = Math.max(0, enter); // 限制淡入时间在 0 以上
  let exit = getNumberArgByKey(sentence, 'exit') ?? enter; // 获取bgm的淡出时间
  exit = Math.max(0, exit); // 限制淡出时间在 0 以上

  if (name !== '') {
    webgalStore.dispatch(unlockBgmInUserData({ name, url, series }));
    const userDataState = webgalStore.getState().userData;
    localforage.setItem(WebGAL.gameKey, userDataState).then(() => { });
  }

  bgmManager.play({ src: url, volume, enter, exit });

  return {
    performName: 'none',
    duration: 0,
    isHoldOn: true,
    stopFunction: () => { },
    blockingNext: () => false,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };
};
