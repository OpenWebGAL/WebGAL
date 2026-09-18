import { Texture } from 'pixi.js';
import { Assets } from './assetParsers';
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
  const value = await Assets.load({ src: request.url, data: { webgalKind: request.kind } });
  return {
    value,
    textures: value instanceof Texture ? [value] : [],
    dispose: () => Assets.unload(request.url),
  };
}
