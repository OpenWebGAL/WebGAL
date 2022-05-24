import {ISentence} from '@/Core/interface/coreInterface/sceneInterface';
import {IPerform} from '@/Core/interface/coreInterface/performInterface';
import {webgalStore} from "@/Core/store/store";
import {unlockCgInUserData} from '../store/userDataReducer';
import {logger} from "@/Core/util/logger";
import localforage from "localforage";
import {gameInfo} from "@/Core/runtime/etc";

/**
 * 解锁cg
 * @param sentence
 */
export const unlockCg = (sentence: ISentence): IPerform => {
  logger.debug('解锁cg');
  const url = sentence.content;
  let name = sentence.content;
  let series = 'default';
  sentence.args.forEach(e => {
    if (e.key === 'name') {
      name = e.value.toString();
    }
    if (e.key === 'series') {
      series = e.value.toString();
    }
  });
  webgalStore.dispatch(unlockCgInUserData({name, url, series}));
  const userDataState = webgalStore.getState().userData;
  localforage.setItem(gameInfo.gameKey, userDataState).then(() => {
    logger.info('写入本地存储',userDataState);
  });
  return {
    performName: 'none',
    duration: 0,
    isOver: false,
    isHoldOn: false,
    stopFunction: () => {
    },
    blockingNext: () => false,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };
};
