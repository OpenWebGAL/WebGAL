import { ALPHA_MODES, LoaderResource, Texture } from 'pixi.js';
import { LoadDependency, PreparedResource, resourceExtension } from './resourceTypes';

/** 可选运行时仍由 spine.ts 的显式启用入口提供，不引入 Spine 包依赖。 */
export async function loadSpineResources(url: string, load: LoadDependency): Promise<PreparedResource> {
  const { loadPixiSpine } = await import('../spine');
  const runtime = await loadPixiSpine();
  if (!runtime) throw new Error('Spine 未启用，请按 WebGAL Spine 文档安装并启用运行时');
  const binary = resourceExtension(url) === 'skel';
  const data = await load(url, binary ? 'binary' : 'json');
  const atlasUrl = new URL(url);
  atlasUrl.pathname = atlasUrl.pathname.replace(/\.[^.]+$/, '.atlas');
  atlasUrl.search = '';
  atlasUrl.hash = '';
  const atlasText = await load<string>(atlasUrl.href, 'text');
  const textures: Texture[] = [];
  const atlas = await new Promise<InstanceType<typeof runtime.TextureAtlas>>((resolve, reject) => {
    new runtime.TextureAtlas(
      atlasText,
      (path: string, done: (base: Texture['baseTexture']) => void) => {
        void load<Texture>(new URL(path, atlasUrl).href, 'texture')
          .then((texture) => {
            if (path.includes('-pma.') && texture.baseTexture.alphaMode !== ALPHA_MODES.PMA) {
              texture.baseTexture.alphaMode = ALPHA_MODES.PMA;
              // 页面可能已由依赖加载预热，解析出 PMA 属性后须重新上传。
              texture.baseTexture.dispose();
            }
            textures.push(texture);
            done(texture.baseTexture);
          })
          .catch(reject);
      },
      resolve,
    );
  });
  const parser = new runtime.SpineParser();
  const resource = new LoaderResource(url, url);
  parser.parseData(
    resource,
    binary ? parser.createBinaryParser() : parser.createJsonParser(),
    atlas,
    binary ? new Uint8Array(data as ArrayBuffer) : data,
  );
  // 图集页纹理由 dependency 管理，不能 atlas.dispose() 误销毁共享页面。
  return { value: resource, textures };
}
