import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { webgalStore } from '@/store/store';
import { unlockBgmInUserData } from '@/store/userDataReducer';
import localforage from 'localforage';
import { logger } from '@/Core/util/logger';

import { WebGAL } from '@/Core/WebGAL';
import { getStringArgByKey } from '../util/getSentenceArg';

/**
 * 解锁bgm
 * @param sentence
 */
export const unlockBgm = (sentence: ISentence): IPerform => {
  const url = sentence.content;
  const name = getStringArgByKey(sentence, 'name') ?? sentence.content;
  const series = getStringArgByKey(sentence, 'series') ?? 'default';
  logger.info(`解锁BGM：${name}，路径：${url}，所属系列：${series}`);
  webgalStore.dispatch(unlockBgmInUserData({ name, url, series }));
  const userDataState = webgalStore.getState().userData;
  localforage.setItem(WebGAL.gameKey, userDataState).then(() => {});
  return {
    performName: 'none',
    duration: 0,
    isHoldOn: false,
    stopFunction: () => {},
    blockingNext: () => false,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };
};
