import localforage from 'localforage';
import { WebGAL } from '@/Core/WebGAL';
import { logger } from '@/Core/util/logger';
import { webgalStore } from '@/store/store';
import { saveActions } from '@/store/savesReducer';
import { ISaveData } from '@/store/userDataInterface';

export function dumpSavesToStorage(startIndex: number, endIndex: number) {
  for (let i = startIndex; i <= endIndex; i++) {
    const save = webgalStore.getState().saveData.saveData[i];
    localforage.setItem(`${WebGAL.gameKey}-saves${i}`, save).then(() => {
      logger.info(`存档${i}写入本地存储`);
    });
  }
}

export function getSavesFromStorage(startIndex: number, endIndex: number) {
  for (let i = startIndex; i <= endIndex; i++) {
    localforage.getItem(`${WebGAL.gameKey}-saves${i}`).then((save) => {
      webgalStore.dispatch(saveActions.saveGame({ index: i, saveData: save as ISaveData }));
      logger.info(`存档${i}读取自本地存储`);
    });
  }
}

export async function dumpFastSaveToStorage() {
  const save = webgalStore.getState().saveData.quickSaveData;
  await localforage.setItem(`${WebGAL.gameKey}-saves-fast`, save);
  logger.info(`快速存档写入本地存储`);
}

export async function getFastSaveFromStorage() {
  const save = await localforage.getItem(`${WebGAL.gameKey}-saves-fast`);
  webgalStore.dispatch(saveActions.setFastSave(save as ISaveData));
  logger.info(`快速存档读取自本地存储`);
}
