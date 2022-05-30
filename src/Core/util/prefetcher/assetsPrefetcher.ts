import {IAsset} from '../../../interface/coreInterface/sceneInterface';
import {logger} from '../etc/logger';

/**
 * 预加载函数
 * @param assetList 场景资源列表
 */
export const assetsPrefetcher = (assetList: Array<IAsset>) => {

  for (const asset of assetList) {
    // 是否要插入这个标签
    let isInsert = true;
    // 判断是否已经存在
    // 查询所有 link 标签，检查是否有相同的 href 属性
    const links = document.querySelectorAll('link');
    links.forEach(element => {
      if (element.getAttribute('href') === asset.url) {
        return;
      }
    });
    if (!isInsert) {
      logger.warn('已经存在相同的链接，不再插入');
    } else {
      const newLink = document.createElement('link');
      newLink.setAttribute('rel', 'prefetch');
      newLink.setAttribute('href', asset.url);
      const head = document.getElementsByTagName('head');
      if (head.length) {
        head[0].appendChild(newLink);
      }
    }
  }
};
