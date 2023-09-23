import { webgalStore } from '@/store/store';
import { setFastSave } from '@/store/userDataReducer';
import { getStorageAsync, setStorageAsync } from '@/Core/controller/storage/storageController';
import { ISaveData } from '@/store/userDataInterface';
import { loadGameFromStageData } from '@/Core/controller/storage/loadGame';
import { generateCurrentStageData } from '@/Core/controller/storage/saveGame';
import cloneDeep from 'lodash/cloneDeep';
import { WebGAL } from '@/Core/WebGAL';

export let fastSaveGameKey = '';
export let isFastSaveKey = '';
let lock = true;

export function initKey() {
  lock = false;
  fastSaveGameKey = `FastSaveKey-${WebGAL.gameName}-${WebGAL.gameKey}`;
  isFastSaveKey = `FastSaveActive-${WebGAL.gameName}-${WebGAL.gameKey}`;
}

/**
 * 用于紧急回避时的数据存储 & 快速保存
 */
export async function fastSaveGame() {
  const saveData: ISaveData = generateCurrentStageData(-1);
  const newSaveData = cloneDeep(saveData);
  // localStorage.setItem(fastSaveGameKey, JSON.stringify(newSaveData));
  // localStorage.setItem(isFastSaveKey, JSON.stringify(true));
  // localStorage.setItem('currentSentenceId', JSON.stringify(runtime_currentSceneData.currentSentenceId));
  // await localforage.setItem(fastSaveGameKey, newSaveData);
  // await localforage.setItem(isFastSaveKey, true);
  webgalStore.dispatch(setFastSave(newSaveData));
  await setStorageAsync();
}

/**
 * 判断是否有无存储紧急回避时的数据
 */
export async function hasFastSaveRecord() {
  // return await localforage.getItem(isFastSaveKey);
  await getStorageAsync();
  return webgalStore.getState().userData.quickSaveData !== null;
}

/**
 * 加载紧急回避时的数据
 */
export async function loadFastSaveGame() {
  // 获得存档文件
  // const loadFile: ISaveData | null = await localforage.getItem(fastSaveGameKey);
  await getStorageAsync();
  const loadFile: ISaveData | null = webgalStore.getState().userData.quickSaveData;
  if (!loadFile) {
    return;
  }
  loadGameFromStageData(loadFile);
}

/**
 * 移除紧急回避的数据
 */
export async function removeFastSaveGameRecord() {
  webgalStore.dispatch(setFastSave(null));
  await setStorageAsync();
  // await localforage.setItem(isFastSaveKey, false);
  // await localforage.setItem(fastSaveGameKey, null);
}
