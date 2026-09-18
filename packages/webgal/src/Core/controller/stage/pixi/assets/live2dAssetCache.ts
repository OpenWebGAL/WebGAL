import type { Live2DLoader } from 'pixi-live2d-display-webgal';
import cloneDeep from 'lodash/cloneDeep';
import { Assets } from './assetParsers';
import { resourceUrl } from './resourceTypes';

/** SDK 继续创建独立模型，只复用预加载数据；克隆 JSON 避免实例相互修改。 */
export function installLive2dAssetCache(loader: typeof Live2DLoader) {
  loader.middlewares.unshift(async (context, next) => {
    const url = resourceUrl(context.settings ? context.settings.resolveURL(context.url) : context.url);
    if (Assets.cache.has(url)) {
      context.result = cloneDeep(Assets.get(url));
      return;
    }
    const pending = Assets.loader.promiseCache[url]?.promise;
    if (pending) {
      try {
        context.result = cloneDeep(await pending);
        return;
      } catch {
        // 预取失败后交还 SDK，保留它原有的错误处理与按需加载行为。
      }
    }
    await next();
  });
}
