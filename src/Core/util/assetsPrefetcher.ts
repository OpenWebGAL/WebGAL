import {IAsset} from "../interface/coreInterface/sceneInterface";
import {logger} from "./logger";

/**
 * 预加载函数
 * @param assetList 场景资源列表
 */
export const assetsPrefetcher = (assetList: Array<IAsset>) => {
    //TODO: 实现预加载函数
    for (const asset of assetList) {
        const newLink = document.createElement('link');
        newLink.setAttribute('rel', 'prefetch');
        newLink.setAttribute('href', asset.url);
        const head = document.getElementsByTagName('head');
        if (head.length) {
            head[0].appendChild(newLink);
        }
    }
}