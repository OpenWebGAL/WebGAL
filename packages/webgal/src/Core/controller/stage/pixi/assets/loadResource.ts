import { Texture } from 'pixi.js';
import { Assets, decodeData } from './assetParsers';
import { LoadDependency, PreparedResource, ResourceRequest } from './resourceTypes';

export async function loadResource(request: ResourceRequest, dependency: LoadDependency): Promise<PreparedResource> {
  if (request.kind === 'live2d') {
    const { loadLive2dResources } = await import('./live2dAssets');
    return loadLive2dResources(request.url, dependency);
  }
  if (request.kind === 'spine') {
    const { loadSpineResources } = await import('./spineAssets');
    return loadSpineResources(request.url, dependency);
  }
  // 直接使用 loader：AssetManager 已按 kind + URL 管理条目，不需要 Resolver 的别名表。
  const loaded = await Assets.loader.load({ src: request.url, data: { webgalKind: request.kind } });
  const value = loaded instanceof Texture ? loaded : decodeData(loaded, request.kind);
  return {
    value,
    textures: value instanceof Texture ? [value] : [],
    dispose: () => Assets.loader.unload(request.url),
  };
}
