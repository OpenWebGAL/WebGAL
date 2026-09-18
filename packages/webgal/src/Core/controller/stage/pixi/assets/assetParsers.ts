import { Assets } from '@pixi/assets';
import { BaseTexture, Texture, VideoResource } from 'pixi.js';
import { GifResource } from '../GifResource';
import { resourceExtension } from './resourceTypes';
import { loadVideoResource } from './videoTexture';

// 保留 Pixi 6 的图片解码、GIF 和视频语义，Assets 负责请求去重和卸载。
Assets.loader.parsers.unshift({
  test: (_url, asset) => Boolean(asset?.data?.webgalKind),
  load: async <T>(url: string, asset?: { data?: { webgalKind?: string } }) => {
    const kind = asset?.data?.webgalKind;
    if (kind !== 'texture') {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`资源加载失败 ${response.status}: ${url}`);
      const value =
        kind === 'binary'
          ? await response.arrayBuffer()
          : kind === 'text'
          ? await response.text()
          : await response.json();
      return value as T;
    }
    const ext = resourceExtension(url);
    let texture: Texture | undefined;
    try {
      if (ext === 'gif') {
        const resource = new GifResource(url, { autoLoad: false, autoPlay: false });
        resource.internal = true;
        texture = new Texture(new BaseTexture(resource));
        await resource.load();
      } else if (['mp4', 'webm', 'mkv'].includes(ext ?? '')) {
        const resource = new VideoResource(url, { autoLoad: false, autoPlay: false });
        resource.internal = true;
        resource.source.muted = true;
        resource.source.loop = true;
        texture = new Texture(new BaseTexture(resource));
        await loadVideoResource(resource);
      } else {
        texture = Texture.from(url, { resourceOptions: { autoLoad: false } });
        await texture.baseTexture.resource.load();
      }
      Texture.addToCache(texture, url);
      return texture as T;
    } catch (error) {
      texture?.destroy(true);
      throw error;
    }
  },
  unload: (asset) => {
    if (asset instanceof Texture) asset.destroy(true);
  },
});

export { Assets };
