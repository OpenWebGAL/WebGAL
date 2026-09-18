import { Renderer, Texture } from 'pixi.js';
import { logger } from '@/Core/util/logger';
import { loadResource } from './loadResource';
import { PreparedResource, ResourceRequest, resourceKey, resourceUrl } from './resourceTypes';

interface ResourceEntry {
  request: ResourceRequest;
  dependencies: Set<string>;
  resource?: PreparedResource;
  operation?: Promise<unknown>;
  ready: boolean;
  loading?: boolean;
}

/** 舞台对象持有资源，剧情窗口只表达预取意愿；两者都不再需要时才释放。 */
export class AssetManager {
  private entries = new Map<string, ResourceEntry>();
  private owners = new Map<string, Set<string>>();
  private future = new Set<string>();
  private queue: ResourceRequest[] = [];
  private running = false;
  private renderer?: Renderer;
  private contextVersion = 0;

  public attach(renderer: Renderer) {
    this.renderer = renderer;
    renderer.runners.prerender.add(this);
    renderer.runners.contextChange.add(this);
  }

  public retain(owner: string, request: ResourceRequest) {
    const keys = this.owners.get(owner) ?? new Set<string>();
    keys.add(resourceKey(request));
    this.owners.set(owner, keys);
  }

  public release(owner: string) {
    this.owners.delete(owner);
    this.collect();
  }

  public preload(requests: ResourceRequest[]) {
    const unique = new Map(requests.map((request) => [resourceKey(request), request]));
    this.future = new Set(unique.keys());
    // 每次用最新窗口替换等待队列，窗口内部仍按最近剧情优先。
    this.queue = [...unique.values()];
    this.collect();
    void this.runQueue();
  }

  public getReady<T>(request: ResourceRequest): T | undefined {
    const entry = this.entries.get(resourceKey(request));
    return entry?.ready ? (entry.resource?.value as T) : undefined;
  }

  public async ensureReady<T>(request: ResourceRequest): Promise<T> {
    const key = resourceKey(request);
    let entry = this.entries.get(key);
    if (!entry) {
      entry = { request: { ...request, url: resourceUrl(request.url) }, dependencies: new Set(), ready: false };
      this.entries.set(key, entry);
    }
    // 包括卸载：新的请求必须等旧操作结束，再判断是否需要重新加载。
    if (entry.operation) {
      await entry.operation;
      return this.ensureReady<T>(request);
    }
    if (entry.ready) return entry.resource!.value as T;
    const current = entry;
    current.loading = true;
    current.operation = this.load(current).finally(() => {
      current.operation = undefined;
      current.loading = false;
      queueMicrotask(() => this.collect());
    });
    return (await current.operation) as T;
  }

  private async load(entry: ResourceEntry) {
    try {
      entry.resource ??= await loadResource(entry.request, async <T>(url: string, kind: ResourceRequest['kind']) => {
        const request = { url, kind };
        entry.dependencies.add(resourceKey(request));
        return this.ensureReady<T>(request);
      });
      let version: number;
      do {
        version = this.contextVersion;
        await this.prepare(entry.resource.textures ?? []);
      } while (version !== this.contextVersion);
      entry.ready = true;
      return entry.resource.value;
    } catch (error) {
      // 清掉失败结果，下一次显示或预取请求可以重试。
      await entry.resource?.dispose?.();
      entry.resource = undefined;
      entry.dependencies.clear();
      throw error;
    }
  }

  public async prepare(textures: Texture[]) {
    const prepare = this.renderer?.plugins.prepare;
    if (!prepare || textures.length === 0) return;
    textures.forEach((texture) => prepare.add(texture));
    await new Promise<void>((resolve) => prepare.upload(resolve));
  }

  private wanted() {
    const wanted = new Set([...this.future, ...[...this.owners.values()].flatMap((keys) => [...keys])]);
    // 被新剧情淘汰的加载仍可能正在解析图集，依赖必须保留到解析结束。
    for (const [key, entry] of this.entries) if (entry.loading) wanted.add(key);
    for (const key of wanted) {
      this.entries.get(key)?.dependencies.forEach((dependency) => wanted.add(dependency));
    }
    return wanted;
  }

  public collect() {
    const wanted = this.wanted();
    for (const [key, entry] of this.entries) {
      if (wanted.has(key) || entry.operation) continue;
      entry.operation = Promise.resolve()
        .then(async () => {
          // 给同一轮舞台替换机会重新持有资源，避免无谓卸载。
          if (this.wanted().has(key)) return;
          entry.ready = false;
          await entry.resource?.dispose?.();
          entry.resource = undefined;
          entry.dependencies.clear();
          this.entries.delete(key);
        })
        .catch((error) => logger.warn('释放 Pixi 资源失败', error))
        .finally(() => {
          entry.operation = undefined;
          if (entry.resource) entry.ready = true;
        });
    }
  }

  private async runQueue() {
    if (this.running) return;
    this.running = true;
    try {
      while (this.queue.length) {
        const request = this.queue.shift()!;
        try {
          await this.ensureReady(request);
        } catch (error) {
          logger.warn(`预加载失败，显示时允许重试：${request.url}`, error);
        }
        this.collect();
      }
    } finally {
      this.running = false;
    }
  }

  /** 只保护仍被持有的纹理，不关闭其他 Pixi 资源的自动 GC。 */
  public prerender() {
    for (const key of this.wanted()) {
      this.entries.get(key)?.resource?.textures?.forEach((texture) => {
        texture.baseTexture.touched = this.renderer!.textureGC.count;
      });
    }
  }

  public contextChange() {
    this.contextVersion++;
    for (const entry of this.entries.values()) entry.ready = false;
    this.queue = [...this.wanted()].flatMap((key) => {
      const entry = this.entries.get(key);
      return entry ? [entry.request] : [];
    });
    void this.runQueue();
  }
}
