import { webgalStore } from '@/store/store';
import { getStorageAsync, setStorageAsync } from '@/Core/controller/storage/storageController';
import { ISaveData } from '@/store/userDataInterface';
import { loadGameFromStageData } from '@/Core/controller/storage/loadGame';
import { generateCurrentStageData } from '@/Core/controller/storage/saveGame';
import cloneDeep from 'lodash/cloneDeep';
import { WebGAL } from '@/Core/WebGAL';
import { saveActions } from '@/store/savesReducer';
import { dumpFastSaveToStorage, getFastSaveFromStorage } from '@/Core/controller/storage/savesController';

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
  const showTitle = webgalStore.getState().GUI.showTitle;
  if (showTitle) {
    // 如果在标题界面，不进行快速保存
    return;
  }
  const saveData: ISaveData = generateCurrentStageData(-1, false);
  const newSaveData = cloneDeep(saveData);
  webgalStore.dispatch(saveActions.setFastSave(newSaveData));
  await dumpFastSaveToStorage();
}

/**
 * 判断是否有无存储紧急回避时的数据
 */
export async function hasFastSaveRecord() {
  // return await localforage.getItem(isFastSaveKey);
  await getStorageAsync();
  return webgalStore.getState().saveData.quickSaveData !== null;
}

/**
 * 加载紧急回避时的数据
 */
export async function loadFastSaveGame() {
  // 获得存档文件
  // const loadFile: ISaveData | null = await localforage.getItem(fastSaveGameKey);
  await getFastSaveFromStorage();
  const loadFile: ISaveData | null = webgalStore.getState().saveData.quickSaveData;
  if (!loadFile) {
    return;
  }
  removeFastSaveGameRecord();
  loadGameFromStageData(loadFile);
}

/**
 * 移除紧急回避的数据
 */
export async function removeFastSaveGameRecord() {
  webgalStore.dispatch(saveActions.resetFastSave());
  await dumpFastSaveToStorage();
}
