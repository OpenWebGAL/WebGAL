import type * as PIXI from 'pixi.js';
import {
  type ICharacterCanvas,
  type ICharacterCompositionLayer,
  type ICharacterSelection,
  resolveCharacterComponentUrl,
  resolveCharacterTemplateSelection,
} from '@/Core/character/characterTemplate';
import { logger } from '@/Core/util/logger';
import type { LoadDependency, PreparedResource } from './resourceTypes';

export interface IPreparedCharacterLayer {
  name: string;
  texture: PIXI.Texture;
  x: number;
  y: number;
  scale?: number;
  width?: number;
  height?: number;
}

export interface IPreparedCharacterFigure {
  canvas: ICharacterCanvas;
  layers: IPreparedCharacterLayer[];
}

export interface IPreparedCharacterFigureResource extends PreparedResource {
  value: IPreparedCharacterFigure;
}

function toPreparedLayer(layer: ICharacterCompositionLayer, texture: PIXI.Texture): IPreparedCharacterLayer {
  const prepared: IPreparedCharacterLayer = {
    name: layer.name,
    texture,
    x: layer.x,
    y: layer.y,
  };
  if (layer.scale !== undefined) {
    prepared.scale = layer.scale;
  }
  if (layer.width !== undefined && layer.height !== undefined) {
    prepared.width = layer.width;
    prepared.height = layer.height;
  }
  return prepared;
}

const DEFAULT_CHARACTER_CANVAS_WIDTH = 2560;
const DEFAULT_CHARACTER_CANVAS_HEIGHT = 1440;
const MAX_CHARACTER_CANVAS_EDGE = 8192;

function inferCharacterCanvas(layers: readonly IPreparedCharacterLayer[]): ICharacterCanvas {
  let maxRight = 0;
  let maxBottom = 0;
  for (const layer of layers) {
    const texW = layer.texture.width;
    const texH = layer.texture.height;
    const drawWidth = layer.width ?? (layer.scale !== undefined ? texW * layer.scale : texW);
    const drawHeight = layer.height ?? (layer.scale !== undefined ? texH * layer.scale : texH);
    if (Number.isFinite(drawWidth) && drawWidth > 0) {
      maxRight = Math.max(maxRight, layer.x + drawWidth);
    }
    if (Number.isFinite(drawHeight) && drawHeight > 0) {
      maxBottom = Math.max(maxBottom, layer.y + drawHeight);
    }
  }
  const width =
    maxRight > 0
      ? Math.min(MAX_CHARACTER_CANVAS_EDGE, Math.max(1, Math.ceil(maxRight)))
      : DEFAULT_CHARACTER_CANVAS_WIDTH;
  const height =
    maxBottom > 0
      ? Math.min(MAX_CHARACTER_CANVAS_EDGE, Math.max(1, Math.ceil(maxBottom)))
      : DEFAULT_CHARACTER_CANVAS_HEIGHT;
  return { width, height };
}

/** 加载组合角色模板及所选图层的纹理，单层失败时跳过并保留其余有效图层。 */
export async function loadCharacterResources(
  templateUrl: string,
  selection: ICharacterSelection,
  load: LoadDependency,
): Promise<IPreparedCharacterFigureResource> {
  const template = await load<unknown>(templateUrl, 'json');
  const composition = resolveCharacterTemplateSelection(template, selection);

  // 先解析全部图层路径；单层越界或纹理加载失败时仅跳过该层，保留其余有效部件。
  const layerRequests = composition.layers.flatMap((layer) => {
    const url = resolveCharacterComponentUrl(layer.src, templateUrl);
    return url ? [{ layer, url }] : [];
  });
  const loadedLayers = await Promise.all(
    layerRequests.map(async ({ layer, url }) => {
      const texture = await load<PIXI.Texture>(url, 'texture').catch((err) => {
        logger.warn(`角色部件纹理加载失败，已跳过：${url}`, err);
        return null;
      });
      return texture ? toPreparedLayer(layer, texture) : null;
    }),
  );
  const layers = loadedLayers.filter((layer): layer is IPreparedCharacterLayer => layer !== null);
  const canvas = composition.canvas ?? inferCharacterCanvas(layers);

  return {
    value: { canvas, layers },
    textures: [...new Set(layers.map((layer) => layer.texture))],
  };
}
