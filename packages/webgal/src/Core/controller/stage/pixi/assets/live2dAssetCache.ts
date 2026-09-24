import type { Live2DLoader, ModelSettings } from 'pixi-live2d-display-webgal';
import { Assets, decodeData } from './assetParsers';
import { resourceUrl } from './resourceTypes';

interface Live2dSdk {
  Live2DLoader: typeof Live2DLoader;
  ModelSettings: typeof ModelSettings;
}

/** SDK 继续创建独立模型，只复用预加载数据；每次解码出独立副本，避免实例相互修改。 */
export function installLive2dAssetCache({ Live2DLoader, ModelSettings }: Live2dSdk) {
  // 与预加载使用同一套 URL 解析规则，SDK 创建纹理时才能命中 TextureCache 中已上传的纹理。
  ModelSettings.prototype.resolveURL = function (path: string) {
    return new URL(path, resourceUrl(this.url)).href;
  };
  Live2DLoader.middlewares.unshift(async (context, next) => {
    const url = resourceUrl(context.settings ? context.settings.resolveURL(context.url) : context.url);
    const pending = Assets.loader.promiseCache[url]?.promise;
    if (pending && (context.type === 'json' || context.type === 'arraybuffer')) {
      try {
        const buffer = await pending;
        if (buffer instanceof ArrayBuffer) {
          context.result = decodeData(buffer, context.type === 'json' ? 'json' : 'binary');
          return;
        }
      } catch {
        // 预取失败后交还 SDK，保留它原有的错误处理与按需加载行为。
      }
    }
    await next();
  });
}
