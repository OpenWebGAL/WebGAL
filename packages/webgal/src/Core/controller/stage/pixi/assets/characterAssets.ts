import type * as PIXI from 'pixi.js';
import {
  type CharacterCanvas,
  type CharacterLayerSpec,
  type CharacterSelection,
  MAX_CHARACTER_CANVAS_EDGE,
  resolveCharacterComponentUrl,
  resolveCharacterLayers,
} from '@/Core/character/characterTemplate';
import { SCREEN_CONSTANTS } from '@/Core/util/constants';
import { logger } from '@/Core/util/logger';
import type { LoadDependency, PreparedResource } from './resourceTypes';

export interface CharacterTextureLayer extends Omit<CharacterLayerSpec, 'src'> {
  texture: PIXI.Texture;
}

export interface PreparedCharacter {
  canvas: CharacterCanvas;
  layers: CharacterTextureLayer[];
}

function inferCharacterCanvas(layers: readonly CharacterTextureLayer[]): CharacterCanvas {
  let maxRight = 0;
  let maxBottom = 0;
  for (const layer of layers) {
    const tex = layer.texture;
    const drawW = layer.width ?? (layer.scale !== undefined ? tex.width * layer.scale : tex.width);
    const drawH = layer.height ?? (layer.scale !== undefined ? tex.height * layer.scale : tex.height);
    if (Number.isFinite(drawW) && drawW > 0) maxRight = Math.max(maxRight, layer.x + drawW);
    if (Number.isFinite(drawH) && drawH > 0) maxBottom = Math.max(maxBottom, layer.y + drawH);
  }
  const clampEdge = (val: number, fallback: number) =>
    val > 0 ? Math.min(MAX_CHARACTER_CANVAS_EDGE, Math.max(1, Math.ceil(val))) : fallback;
  return {
    width: clampEdge(maxRight, SCREEN_CONSTANTS.width),
    height: clampEdge(maxBottom, SCREEN_CONSTANTS.height),
  };
}

/** 加载组合角色模板及所选图层的纹理，单层失败时跳过并保留其余有效图层。 */
export async function loadCharacterResources(
  templateUrl: string,
  selection: CharacterSelection,
  load: LoadDependency,
): Promise<PreparedResource> {
  const template = await load<unknown>(templateUrl, 'json');
  const composition = resolveCharacterLayers(template, selection);

  // 单层路径越界或纹理加载失败时仅跳过该层，保留其余有效部件。
  const loaded = await Promise.all(
    composition.layers.map(async (spec) => {
      const url = resolveCharacterComponentUrl(spec.src, templateUrl);
      if (!url) return null;
      const texture = await load<PIXI.Texture>(url, 'texture').catch((err) => {
        logger.warn(`角色部件纹理加载失败，已跳过：${url}`, err);
        return null;
      });
      if (!texture) return null;
      const { src: _src, ...rest } = spec;
      return { ...rest, texture } satisfies CharacterTextureLayer;
    }),
  );

  const layers = loaded.filter((item): item is CharacterTextureLayer => item !== null);
  const canvas = composition.canvas ?? inferCharacterCanvas(layers);
  return {
    value: { canvas, layers } satisfies PreparedCharacter,
    textures: [...new Set(layers.map((item) => item.texture))],
  };
}
