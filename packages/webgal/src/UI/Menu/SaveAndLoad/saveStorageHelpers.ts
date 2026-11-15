import localforage from 'localforage';
import { WebGAL } from '@/Core/WebGAL';
import { logger } from '@/Core/util/logger';
import { webgalStore } from '@/store/store';
import { saveActions, ISavesData } from '@/store/savesReducer';
import { ISaveData, IUserData } from '@/store/userDataInterface';
import { dumpFastSaveToStorage, getFastSaveFromStorage } from '@/Core/controller/storage/savesController';

export interface ExportGameData {
  userData: IUserData;
  saves: ISavesData;
}

function getSavePrefix(): string {
  return `${WebGAL.gameKey}-saves`;
}

function parseSaveIndexFromKey(key: string, prefix: string): number | null {
  if (!key.startsWith(prefix)) return null;
  const suffix = key.slice(prefix.length);
  if (!/^\d+$/.test(suffix)) return null;
  const index = Number(suffix);
  return Number.isSafeInteger(index) ? index : null;
}

/**
 * 动态扫描本地存储中全部以 `${gameKey}-saves` 开头的数字存档序号，摆脱 0..200 限制
 */
export async function listSaveSlotIndicesFromStorage(): Promise<number[]> {
  const prefix = getSavePrefix();
  const keys = await localforage.keys();
  const indices: number[] = [];
  for (const key of keys) {
    const idx = parseSaveIndexFromKey(key, prefix);
    if (idx !== null) indices.push(idx);
  }
  indices.sort((a, b) => a - b);
  return indices;
}

export async function getMaxSaveSlotIndexFromStorage(): Promise<number> {
  const indices = await listSaveSlotIndicesFromStorage();
  return indices.length > 0 ? indices[indices.length - 1] : 0;
}

export async function loadAllSavesFromStorage(): Promise<void> {
  const prefix = getSavePrefix();
  const indices = await listSaveSlotIndicesFromStorage();
  await Promise.all([
    getFastSaveFromStorage(),
    ...indices.map(async (index) => {
      const save = await localforage.getItem<ISaveData>(`${prefix}${index}`);
      webgalStore.dispatch(saveActions.saveGame({ index, saveData: save as ISaveData }));
      logger.info(`存档${index}读取自本地存储`);
    }),
  ]);
}

export async function clearAllSavesFromStorage(): Promise<void> {
  const prefix = getSavePrefix();
  const keys = await localforage.keys();
  await Promise.all(keys.filter((key) => key.startsWith(prefix)).map((key) => localforage.removeItem(key)));
  webgalStore.dispatch(saveActions.resetSaves());
  await dumpFastSaveToStorage();
}

export async function persistImportedSavesToStorage(
  saveDataMap: Record<number, ISaveData | null | undefined> | ISaveData[],
): Promise<void> {
  const prefix = getSavePrefix();
  const existingKeys = await localforage.keys();
  const existingNumericKeys = existingKeys.filter((key) => parseSaveIndexFromKey(key, prefix) !== null);
  await Promise.all(existingNumericKeys.map((key) => localforage.removeItem(key)));

  const writes: Promise<unknown>[] = [dumpFastSaveToStorage()];
  for (const [rawKey, value] of Object.entries(saveDataMap ?? {})) {
    if (!/^\d+$/.test(rawKey) || !value) continue;
    const index = Number(rawKey);
    writes.push(localforage.setItem(`${prefix}${index}`, value));
  }
  await Promise.all(writes);
}
