import * as localforage from 'localforage';
import { IUserData } from '@/store/userDataInterface';
import { logger } from '../../util/logger';
import { webgalStore } from '@/store/store';
import { initState, resetUserData } from '@/store/userDataReducer';
import cloneDeep from 'lodash/cloneDeep';

import { WebGAL } from '@/Core/WebGAL';

/**
 * 写入本地存储
 */
export const setStorage = debounce(() => {
  const userDataState = webgalStore.getState().userData;
  localforage.setItem(WebGAL.gameKey, userDataState).then(() => {
    logger.info('写入本地存储');
  });
}, 100);

/**
 * 从本地存储获取数据
 */
export const getStorage = debounce(() => {
  localforage.getItem(WebGAL.gameKey).then((newUserData) => {
    // 如果没有数据，重新初始化
    if (!newUserData) {
      logger.warn('现在重置数据');
      setStorage();
      return;
    }
    const shouldMigrate = !checkUserDataProperty(newUserData);
    const normalizedUserData = normalizeUserData(newUserData as Partial<IUserData>);
    webgalStore.dispatch(resetUserData(normalizedUserData));
    if (shouldMigrate) {
      logger.warn('检测到旧版本用户数据，已补齐默认字段');
      setStorage();
    }
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

export const dumpToStorageFast = () => {
  const userDataState = webgalStore.getState().userData;
  localforage.setItem(WebGAL.gameKey, userDataState).then(() => {
    localforage.getItem(WebGAL.gameKey).then((newUserData) => {
      // 如果没有数据，初始化
      if (!newUserData) {
        setStorage();
        return;
      }
      webgalStore.dispatch(resetUserData(normalizeUserData(newUserData as Partial<IUserData>)));
    });
    logger.info('同步本地存储');
  });
};

/**
 * 检查用户数据属性是否齐全
 * @param userData 需要检查的数据
 */
function checkUserDataProperty(userData: any) {
  return (
    checkStateProperty(userData, initState) &&
    checkStateProperty(userData.optionData, initState.optionData) &&
    checkStateProperty(userData.appreciationData, initState.appreciationData)
  );
}

function checkStateProperty(currentData: any, templateData: object) {
  if (!isObject(currentData)) {
    return false;
  }
  for (const key in templateData) {
    if (!Object.prototype.hasOwnProperty.call(currentData, key)) {
      return false;
    }
  }
  return true;
}

function normalizeUserData(userData: Partial<IUserData>): IUserData {
  const defaultUserData = cloneDeep(initState);
  const optionData: Record<string, any> = isObject(userData.optionData) ? userData.optionData : {};
  const appreciationData: Record<string, any> = isObject(userData.appreciationData) ? userData.appreciationData : {};

  return {
    ...defaultUserData,
    ...userData,
    scriptManagedGlobalVar: Array.isArray(userData.scriptManagedGlobalVar) ? userData.scriptManagedGlobalVar : [],
    globalGameVar: isObject(userData.globalGameVar) ? userData.globalGameVar : {},
    optionData: {
      ...defaultUserData.optionData,
      ...optionData,
    },
    appreciationData: {
      ...defaultUserData.appreciationData,
      ...appreciationData,
      bgm: Array.isArray(appreciationData.bgm) ? appreciationData.bgm : defaultUserData.appreciationData.bgm,
      cg: Array.isArray(appreciationData.cg) ? appreciationData.cg : defaultUserData.appreciationData.cg,
    },
    gameConfigInit: isObject(userData.gameConfigInit) ? userData.gameConfigInit : {},
    readHistory: isObject(userData.readHistory) ? userData.readHistory : {},
  };
}

function isObject(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function setStorageAsync() {
  const userDataState = webgalStore.getState().userData;
  return await localforage.setItem(WebGAL.gameKey, userDataState);
}

export async function getStorageAsync() {
  const newUserData = await localforage.getItem(WebGAL.gameKey);
  if (!newUserData) {
    const userDataState = webgalStore.getState().userData;
    logger.warn('现在重置数据');
    return await localforage.setItem(WebGAL.gameKey, userDataState);
  }
  const shouldMigrate = !checkUserDataProperty(newUserData);
  const normalizedUserData = normalizeUserData(newUserData as Partial<IUserData>);
  webgalStore.dispatch(resetUserData(normalizedUserData));
  if (shouldMigrate) {
    logger.warn('检测到旧版本用户数据，已补齐默认字段');
    return await localforage.setItem(WebGAL.gameKey, normalizedUserData);
  }
  return;
}
