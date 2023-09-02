import { IAsset } from '@/Core/controller/scene/sceneInterface';
import { logger } from '../etc/logger';
import { WebGAL } from '@/main';

/**
 * 预加载函数
 * @param assetList 场景资源列表
 */
export const assetsPrefetcher = (assetList: Array<IAsset>) => {
  for (const asset of assetList) {
    // 是否要插入这个标签
    let isInsert = true;
    // 判断是否已经存在
    WebGAL.sceneManager.settledAssets.forEach((settledAssetUrl) => {
      if (settledAssetUrl === asset.url) {
        isInsert = false;
      }
    });
    if (!isInsert) {
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
