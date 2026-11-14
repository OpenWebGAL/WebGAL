import { BaseTexture, Texture, VideoResource } from 'pixi.js';

const playingTextures = new WeakSet<Texture>();

/** Pixi 6 的 VideoResource.load 在 error 时不 reject，需要补上失败通路。 */
export function loadVideoResource(resource: VideoResource): Promise<void> {
  return new Promise((resolve, reject) => {
    const video = resource.source;
    const fail = () => finish(new Error(`视频加载失败：${resource.src}`));
    const timeout = window.setTimeout(fail, 30000);
    const finish = (error?: unknown) => {
      clearTimeout(timeout);
      video.removeEventListener('error', fail);
      if (error) reject(error);
      else resolve();
    };
    video.addEventListener('error', fail, { once: true });
    void resource.load().then(() => finish(), finish);
  });
}

/** 视频有播放进度；重叠退场时创建独立实例，不能像普通图片一样共享播放状态。 */
export async function acquireVideoTexture(prepared: Texture, url: string) {
  const shared = !playingTextures.has(prepared);
  const texture = shared
    ? prepared
    : new Texture(
        new BaseTexture(
          new VideoResource(url, {
            autoLoad: false,
            autoPlay: false,
          }),
        ),
      );
  playingTextures.add(texture);
  const resource = texture.baseTexture.resource as VideoResource;
  resource.internal = true;
  const video = resource.source;
  const release = () => {
    if (!playingTextures.has(texture)) return;
    video.pause();
    playingTextures.delete(texture);
    if (!shared) texture.destroy(true);
  };
  try {
    video.muted = true;
    video.loop = true;
    await loadVideoResource(resource);
    video.currentTime = 0;
    return { texture, video, release };
  } catch (error) {
    release();
    throw error;
  }
}
