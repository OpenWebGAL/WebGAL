import {ISentence} from '@/Core/interface/coreInterface/sceneInterface';
import {IPerform} from '@/Core/interface/coreInterface/performInterface';
import {webgalStore} from "@/Core/store/store";
import {unlockBgmInUserData} from '../store/userDataReducer';
import localforage from "localforage";
import {gameInfo} from "@/Core/runtime/etc";
import {logger} from "@/Core/util/logger";

/**
 * 解锁bgm
 * @param sentence
 */
export const unlockBgm = (sentence: ISentence): IPerform => {
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
  webgalStore.dispatch(unlockBgmInUserData({name, url, series}));
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
