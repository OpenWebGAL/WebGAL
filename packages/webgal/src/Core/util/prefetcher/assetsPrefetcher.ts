import { IAsset } from '@/Core/controller/scene/sceneInterface';
import { logger } from '../logger';

import { WebGAL } from '@/Core/WebGAL';

/**
 * 预加载函数
 * @param assetList 场景资源列表
 */
export const assetsPrefetcher = (assetList: Array<IAsset>) => {
  for (const asset of assetList) {
    // 判断是否已经存在
    const hasPrefetch = WebGAL.sceneManager.settledAssets.includes(asset.url);
    if (hasPrefetch) {
      logger.warn('该资源已在预加载列表中，无需重复加载');
    } else {
      const newLink = document.createElement('link');
      newLink.setAttribute('rel', 'prefetch');
      newLink.setAttribute('href', asset.url);
      const head = document.getElementsByTagName('head');
      if (head.length) {
        head[0].appendChild(newLink);
      }
      WebGAL.sceneManager.settledAssets.push(asset.url);
    }
  }
};
