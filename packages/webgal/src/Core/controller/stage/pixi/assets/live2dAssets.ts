import type { Texture } from 'pixi.js';
import { Live2D } from '@/Core/WebGAL';
import type { LoadDependency, PreparedResource } from './resourceTypes';

interface Live2dSettings {
  model?: string;
  textures?: string[];
  physics?: string;
  pose?: string;
  expressions?: { file: string }[];
  motions?: Record<string, { file: string; sound?: string }[]>;
  FileReferences?: {
    Moc: string;
    Textures: string[];
    Physics?: string;
    Pose?: string;
    Expressions?: { File: string }[];
    Motions?: Record<string, { File: string; Sound?: string }[]>;
  };
}

/** 只加载数据和纹理；模型实例、动作起点和自定义 bounds 仍由舞台决定。 */
export async function loadLive2dResources(url: string, load: LoadDependency): Promise<PreparedResource> {
  // 未引入 SDK 时不下载模型；舞台 setup 同样会因不可用而跳过，不产生错误。
  await Live2D.ready;
  if (!Live2D.isAvailable) return { value: undefined };
  const settings = await load<Live2dSettings>(url, 'json');
  const files = settings.FileReferences;
  const resolve = (file: string) => new URL(file, url).href;
  const rawTextures = await Promise.all(
    (files?.Textures ?? settings.textures ?? []).map((file) => load<Texture>(resolve(file), 'texture')),
  );
  const adaptor = Live2D.createCubism2Texture;
  const textures = files?.Moc || !adaptor ? rawTextures : rawTextures.map((texture) => adaptor(texture));

  const model = files?.Moc ?? settings.model;
  if (model) await load(resolve(model), 'binary');
  // 可选动作损坏不应让本来能显示的模型加载失败；SDK 会在使用时重试。
  const optional = files
    ? [files.Physics, files.Pose, ...(files.Expressions ?? []).map((item) => item.File)]
    : [settings.physics, settings.pose, ...(settings.expressions ?? []).map((item) => item.file)];
  const motions = files
    ? Object.values(files.Motions ?? {})
        .flat()
        .map((item) => item.File)
    : Object.values(settings.motions ?? {})
        .flat()
        .map((item) => item.file);
  void Promise.allSettled([
    ...optional.filter((file): file is string => Boolean(file)).map((file) => load(resolve(file), 'json')),
    // Cubism 2 的动作 SDK 要求 ArrayBuffer，即使文件本身看起来像文本。
    ...motions.map((file) => load(resolve(file), files ? 'json' : 'binary')),
  ]);
  return { value: settings, textures };
}
