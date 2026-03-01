import { IAsset } from '@/Core/controller/scene/sceneInterface';
import { logger } from '../logger';

import { WebGAL } from '@/Core/WebGAL';
import { fileType } from '@/Core/util/gameAssetsAccess/assetSetter';

interface IAssetsPrefetcherOptions {
  /**
   * 默认会限制为“场景开头窗口”资源，避免 parser 一次性触发整场景预加载。
   */
  ignoreLineGate?: boolean;
}

const INITIAL_PARSE_LINE_LOOKAHEAD = 24;
const ASSET_PREFETCH_INTERVAL_MS = 220;
const assetPrefetchQueue: Array<IAsset> = [];
const queuedAssetUrlSet = new Set<string>();
let isAssetPrefetchQueueRunning = false;

const uniqueAssetsByUrl = (assetList: Array<IAsset>) => {
  const seenUrlSet = new Set<string>();
  return assetList.filter((asset) => {
    if (!asset.url || seenUrlSet.has(asset.url)) {
      return false;
    }
    seenUrlSet.add(asset.url);
    return true;
  });
};

const inferPrefetchAs = (assetType: fileType): string => {
  switch (assetType) {
    case fileType.background:
    case fileType.figure:
      return 'image';
    case fileType.bgm:
    case fileType.vocal:
      return 'audio';
    case fileType.video:
      return 'video';
    default:
      return '';
  }
};

const prefetchByLinkElement = (asset: IAsset) => {
  const newLink = document.createElement('link');
  newLink.setAttribute('rel', 'prefetch');
  newLink.setAttribute('href', asset.url);
  const prefetchAs = inferPrefetchAs(asset.type);
  if (prefetchAs) {
    newLink.setAttribute('as', prefetchAs);
  }
  const head = document.getElementsByTagName('head');
  if (!head.length) {
    return;
  }
  try {
    head[0].appendChild(newLink);
  } catch (e) {
    logger.warn('预加载资源挂载 link 失败：', e);
  }
};

const prefetchByServiceWorkerMessage = (assetUrl: string): boolean => {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }
  const controller = navigator.serviceWorker.controller;
  if (!controller) {
    return false;
  }
  try {
    controller.postMessage({
      type: 'WEBGAL_PREFETCH_ASSET',
      url: assetUrl,
    });
    return true;
  } catch (e) {
    logger.warn('通过 Service Worker 发送预加载消息失败，将回退 link prefetch：', e);
    return false;
  }
};

const runAssetsPrefetchQueue = () => {
  if (isAssetPrefetchQueueRunning || assetPrefetchQueue.length === 0) {
    return;
  }
  isAssetPrefetchQueueRunning = true;
  const nextAsset = assetPrefetchQueue.shift() as IAsset;
  setTimeout(() => {
    const useServiceWorker = prefetchByServiceWorkerMessage(nextAsset.url);
    if (!useServiceWorker) {
      prefetchByLinkElement(nextAsset);
    }
    queuedAssetUrlSet.delete(nextAsset.url);
    isAssetPrefetchQueueRunning = false;
    runAssetsPrefetchQueue();
  }, ASSET_PREFETCH_INTERVAL_MS);
};

/**
 * 预加载函数
 * @param assetList 场景资源列表
 */
export const assetsPrefetcher = (assetList: Array<IAsset>, options: IAssetsPrefetcherOptions = {}) => {
  // @ts-ignore
  // 未必要移除，加载到内存里也有用
  // if (window?.isElectron) {
  //   return;
  // }
  const filteredAssetList = uniqueAssetsByUrl(assetList).filter((asset) => {
    if (options.ignoreLineGate) {
      return true;
    }
    return asset.lineNumber <= INITIAL_PARSE_LINE_LOOKAHEAD;
  });
  for (const asset of filteredAssetList) {
    // 判断是否已经存在
    const hasPrefetch = WebGAL.sceneManager.settledAssets.includes(asset.url) || queuedAssetUrlSet.has(asset.url);
    if (hasPrefetch) {
      logger.debug(`该资源${asset.url}已在预加载列表中，无需重复加载`);
    } else {
      logger.info(`现在预加载资源${asset.url}，触发行号：${asset.lineNumber}`);
      WebGAL.sceneManager.settledAssets.push(asset.url);
      queuedAssetUrlSet.add(asset.url);
      assetPrefetchQueue.push(asset);
      runAssetsPrefetchQueue();
    }
  }
};
