/**
 * 场景预加载
 * @param sceneList 需要预加载的场景文件列表
 */
import { sceneFetcher } from '../../controller/scene/sceneFetcher';
import { sceneParser } from '../../parser/sceneParser';
import { logger } from '@/Core/util/logger';

import { WebGAL } from '@/Core/WebGAL';

const SCENE_PREFETCH_INTERVAL_MS = 320;
const scenePrefetchQueue: Array<string> = [];
const queuedSceneUrlSet = new Set<string>();
let isScenePrefetchQueueRunning = false;

const uniqueSceneUrls = (sceneList: Array<string>) => [...new Set(sceneList.filter((sceneUrl) => !!sceneUrl))];

const runScenePrefetchQueue = () => {
  if (isScenePrefetchQueueRunning || scenePrefetchQueue.length === 0) {
    return;
  }
  isScenePrefetchQueueRunning = true;
  const sceneUrl = scenePrefetchQueue.shift() as string;
  setTimeout(async () => {
    queuedSceneUrlSet.delete(sceneUrl);
    if (WebGAL.sceneManager.settledScenes.includes(sceneUrl)) {
      isScenePrefetchQueueRunning = false;
      runScenePrefetchQueue();
      return;
    }
    WebGAL.sceneManager.settledScenes.push(sceneUrl);
    try {
      logger.info(`现在预加载场景${sceneUrl}`);
      const rawScene = await sceneFetcher(sceneUrl);
      // 注意：这里只做深度 1。sceneParser 内部会触发 assetsPrefetcher，
      // 并只预加载该子场景前 N 行资源（由 assetsPrefetcher 的 line gate 控制）。
      sceneParser(rawScene, sceneUrl, sceneUrl);
    } catch (e) {
      logger.error(`场景预加载失败：${sceneUrl}`, e);
      const settledIndex = WebGAL.sceneManager.settledScenes.indexOf(sceneUrl);
      if (settledIndex !== -1) {
        WebGAL.sceneManager.settledScenes.splice(settledIndex, 1);
      }
    } finally {
      isScenePrefetchQueueRunning = false;
      runScenePrefetchQueue();
    }
  }, SCENE_PREFETCH_INTERVAL_MS);
};

export const scenePrefetcher = (sceneList: Array<string>): void => {
  for (const sceneUrl of uniqueSceneUrls(sceneList)) {
    if (WebGAL.sceneManager.settledScenes.includes(sceneUrl) || queuedSceneUrlSet.has(sceneUrl)) {
      continue;
    }
    queuedSceneUrlSet.add(sceneUrl);
    scenePrefetchQueue.push(sceneUrl);
  }
  runScenePrefetchQueue();
};
