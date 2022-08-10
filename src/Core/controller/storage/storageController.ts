import * as localforage from 'localforage';
import { IUserData } from '@/interface/stateInterface/userDataInterface';
import { RUNTIME_GAME_INFO } from '../../runtime/etc';
import { logger } from '../../util/etc/logger';
import { webgalStore } from '@/store/store';
import { initState, resetUserData } from '@/store/userDataReducer';

/**
 * 写入本地存储
 */
export const setStorage = debounce(() => {
  const userDataState = webgalStore.getState().userData;
  localforage.setItem(RUNTIME_GAME_INFO.gameKey, userDataState).then(() => {
    logger.info('写入本地存储');
  });
}, 100);

/**
 * 从本地存储获取数据
 */
export const getStorage = debounce(() => {
  localforage.getItem(RUNTIME_GAME_INFO.gameKey).then((newUserData) => {
    // 如果没有数据或者属性不完全，重新初始化
    if (!newUserData || !checkUserDataProperty(newUserData)) {
      logger.warn('现在重置数据');
      setStorage();
      return;
    }
    webgalStore.dispatch(resetUserData(newUserData as IUserData));
  });
}, 100);

/**
 * 防抖函数
 * @param func 要执行的函数
 * @param wait 防抖等待时间
 */
function debounce<T, K>(func: (...args: T[]) => K, wait: number) {
  let timeout: ReturnType<typeof setTimeout>;

  function context(...args: T[]): K {
    clearTimeout(timeout);
    let ret!: K;
    timeout = setTimeout(() => {
      ret = func.apply(context, args);
    }, wait);
    return ret;
  }

  return context;
}

export const syncStorageFast = () => {
  const userDataState = webgalStore.getState().userData;
  localforage.setItem(RUNTIME_GAME_INFO.gameKey, userDataState).then(() => {
    localforage.getItem(RUNTIME_GAME_INFO.gameKey).then((newUserData) => {
      // 如果没有数据，初始化
      if (!newUserData) {
        setStorage();
        return;
      }
      webgalStore.dispatch(resetUserData(newUserData as IUserData));
    });
    logger.info('同步本地存储');
  });
};

/**
 * 检查用户数据属性是否齐全
 * @param userData 需要检查的数据
 */
function checkUserDataProperty(userData: any) {
  let result = true;
  for (const key in initState) {
    if (!userData.hasOwnProperty(key)) {
      result = false;
    }
  }
  return result;
}

export async function setStorageAsync() {
  const userDataState = webgalStore.getState().userData;
  return await localforage.setItem(RUNTIME_GAME_INFO.gameKey, userDataState);
}

export async function getStorageAsync() {
  const newUserData = await localforage.getItem(RUNTIME_GAME_INFO.gameKey);
  if (!newUserData || !checkUserDataProperty(newUserData)) {
    const userDataState = webgalStore.getState().userData;
    logger.warn('现在重置数据');
    return await localforage.setItem(RUNTIME_GAME_INFO.gameKey, userDataState);
  } else webgalStore.dispatch(resetUserData(newUserData as IUserData));
  return;
}
