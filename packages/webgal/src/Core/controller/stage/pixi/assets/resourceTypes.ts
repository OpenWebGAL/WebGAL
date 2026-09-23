import type { Texture } from 'pixi.js';

export type ResourceKind = 'texture' | 'live2d' | 'spine' | 'json' | 'binary' | 'text';
export interface ResourceRequest {
  url: string;
  kind: ResourceKind;
}
export interface PreparedResource {
  value: unknown;
  textures?: Texture[];
  dispose?: () => void | Promise<void>;
}
export type LoadDependency = <T>(url: string, kind: ResourceKind) => Promise<T>;

export const resourceUrl = (url: string) => new URL(url, document.baseURI).href;
export const resourceKey = ({ url, kind }: ResourceRequest) => `${kind}:${resourceUrl(url)}`;
export const resourceExtension = (url: string) =>
  new URL(url, document.baseURI).pathname.split('.').pop()?.toLowerCase();

export function stageResource(url: string): ResourceRequest {
  const parsed = new URL(url, document.baseURI);
  const ext = resourceExtension(url);
  const kind =
    parsed.searchParams.get('type') === 'spine' || ext === 'skel' ? 'spine' : ext === 'json' ? 'live2d' : 'texture';
  return { url, kind };
}
