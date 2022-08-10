import { ISentence } from '@/interface/coreInterface/sceneInterface';
import { IPerform } from '@/interface/coreInterface/performInterface';
import { webgalStore } from '@/store/store';
import { unlockCgInUserData } from '@/store/userDataReducer';
import { logger } from '@/Core/util/etc/logger';
import localforage from 'localforage';
import { gameInfo } from '@/Core/runtime/etc';

/**
 * 解锁cg
 * @param sentence
 */
export const unlockCg = (sentence: ISentence): IPerform => {
  const url = sentence.content;
  let name = sentence.content;
  let series = 'default';
  sentence.args.forEach((e) => {
    if (e.key === 'name') {
      name = e.value.toString();
    }
    if (e.key === 'series') {
      series = e.value.toString();
    }
  });
  logger.info(`解锁CG：${name}，路径：${url}，所属系列：${series}`);
  webgalStore.dispatch(unlockCgInUserData({ name, url, series }));
  const userDataState = webgalStore.getState().userData;
  localforage.setItem(gameInfo.gameKey, userDataState).then(() => {});
  return {
    performName: 'none',
    duration: 0,
    isOver: false,
    isHoldOn: false,
    stopFunction: () => {},
    blockingNext: () => false,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };
};
