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
    const sx = layer.scaleX ?? layer.scale ?? 1;
    const sy = layer.scaleY ?? layer.scale ?? 1;
    const drawW = layer.width ?? tex.width * sx;
    const drawH = layer.height ?? tex.height * sy;
    if (!Number.isFinite(drawW) || !Number.isFinite(drawH) || drawW <= 0 || drawH <= 0) continue;

    const r = layer.rotation ?? 0;
    if (!r) {
      maxRight = Math.max(maxRight, layer.x + drawW);
      maxBottom = Math.max(maxBottom, layer.y + drawH);
      continue;
    }
    // 围绕图层中心旋转后的轴对齐包围盒右/下边界，确保画布能完整容纳旋转部件
    const cx = layer.x + drawW / 2;
    const cy = layer.y + drawH / 2;
    const cos = Math.abs(Math.cos(r));
    const sin = Math.abs(Math.sin(r));
    maxRight = Math.max(maxRight, cx + (cos * drawW + sin * drawH) / 2);
    maxBottom = Math.max(maxBottom, cy + (sin * drawW + cos * drawH) / 2);
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
