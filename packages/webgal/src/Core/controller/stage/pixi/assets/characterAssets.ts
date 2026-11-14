import type * as PIXI from 'pixi.js';
import {
  CharacterTemplateError,
  type ICharacterCanvas,
  type ICharacterCompositionLayer,
  type ICharacterTemplate,
  resolveCharacterComponentUrl,
  resolveCharacterTemplateSelection,
  validateCharacterTemplate,
} from '@/Core/character/characterTemplate';
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

/** 加载组合角色模板及所选图层的纹理，图集由 AssetManager 统一去重与回收。 */
export async function loadCharacterResources(
  templateUrl: string,
  items: readonly string[],
  load: LoadDependency,
): Promise<IPreparedCharacterFigureResource> {
  if (items.length === 0) {
    throw new CharacterTemplateError('组合列表不能为空');
  }

  const template = await load<ICharacterTemplate>(templateUrl, 'json');
  validateCharacterTemplate(template);
  const composition = resolveCharacterTemplateSelection(template, [...items]);

  // 先校验并解析全部图层路径，避免部分纹理已发请求才发现路径越界。
  const layerRequests = composition.layers.map((layer) => ({
    layer,
    url: resolveCharacterComponentUrl(layer.src, templateUrl),
  }));
  const layers = await Promise.all(
    layerRequests.map(async ({ layer, url }) => {
      const texture = await load<PIXI.Texture>(url, 'texture');
      return toPreparedLayer(layer, texture);
    }),
  );

  return {
    value: { canvas: composition.canvas, layers },
    textures: [...new Set(layers.map((layer) => layer.texture))],
  };
}
