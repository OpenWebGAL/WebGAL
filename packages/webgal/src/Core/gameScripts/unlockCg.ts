import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { createNonePerform, IPerform } from '@/Core/Modules/perform/performInterface';
import { webgalStore } from '@/store/store';
import { unlockCgInUserData } from '@/store/userDataReducer';
import { logger } from '@/Core/util/logger';
import localforage from 'localforage';

import { WebGAL } from '@/Core/WebGAL';
import { getStringArgByKey, getNumberArgByKey } from '../util/getSentenceArg';

/**
 * 解锁cg
 * @param sentence
 */
export const unlockCg = (sentence: ISentence): IPerform => {
  const url = sentence.content;
  const name = getStringArgByKey(sentence, 'name') ?? sentence.content;
  const series = getStringArgByKey(sentence, 'series') ?? 'default';
  const order = getNumberArgByKey(sentence, 'order') ?? 0;
  logger.info(`解锁CG：${name}，路径：${url}，所属系列：${series}，排序：${order}`);
  webgalStore.dispatch(unlockCgInUserData({ name, url, series, order }));
  const userDataState = webgalStore.getState().userData;
  localforage.setItem(WebGAL.gameKey, userDataState).then(() => {});
  return createNonePerform();
};
