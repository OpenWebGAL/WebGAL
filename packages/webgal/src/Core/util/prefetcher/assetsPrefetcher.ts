import { IAsset } from '@/Core/controller/scene/sceneInterface';
import { logger } from '../logger';

import { WebGAL } from '@/Core/WebGAL';

/**
 * 预加载函数
 * @param assetList 场景资源列表
 */
export const assetsPrefetcher = (assetList: Array<IAsset>) => {
  // @ts-ignore
  // 未必要移除，加载到内存里也有用
  // if (window?.isElectron) {
  //   return;
  // }

  for (const asset of assetList) {
    // 判断是否已经存在
    const hasPrefetch = WebGAL.sceneManager.settledAssets.includes(asset.url);
    if (hasPrefetch) {
      logger.debug(`该资源${asset.url}已在预加载列表中，无需重复加载`);
    } else {
      const newLink = document.createElement('link');
      newLink.setAttribute('rel', 'prefetch');
      newLink.setAttribute('href', asset.url);
      const head = document.getElementsByTagName('head');
      if (head.length) {
        try {
          head[0].appendChild(newLink);
        } catch (e) {
          console.log('预加载出错', e);
        }
      }
      WebGAL.sceneManager.settledAssets.push(asset.url);
    }
  }
};
