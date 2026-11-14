import * as PIXI from 'pixi.js';
import { v4 as uuid } from 'uuid';
import type { ICharacterCanvas } from '@/Core/character/characterTemplate';
import type PixiStage from '@/Core/controller/stage/pixi/PixiController';
import { WebGALPixiContainer } from '@/Core/controller/stage/pixi/WebGALPixiContainer';
import type {
  IPreparedCharacterFigure,
  IPreparedCharacterLayer,
} from '@/Core/controller/stage/pixi/assets/characterAssets';
import { getFigureBaseX, type IFigurePosition } from '@/Core/Modules/stage/stageInterface';
import { logger } from '@/Core/util/logger';

export interface ICharacterStageLayout {
  targetScale: number;
  targetWidth: number;
  targetHeight: number;
  pivotY: number;
  baseX: number;
  baseY: number;
}

export interface ICharacterRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ICharacterLayerPlacement {
  x: number;
  y: number;
  width: number;
  height: number;
  crop?: ICharacterRect;
}

/** 计算组合角色在舞台上的基准坐标与缩放，与单图立绘 addFigure 保持一致。 */
export function computeCharacterStageLayout(
  canvas: ICharacterCanvas,
  stageWidth: number,
  stageHeight: number,
  presetPosition: IFigurePosition = 'center',
): ICharacterStageLayout {
  const targetScale =
    canvas.width > 0 && canvas.height > 0 ? Math.min(stageWidth / canvas.width, stageHeight / canvas.height) : 1;
  const targetWidth = canvas.width * targetScale;
  const targetHeight = canvas.height * targetScale;
  const pivotY = stageHeight / 2;
  const baseY = targetHeight < stageHeight ? pivotY + (stageHeight - targetHeight) / 2 : pivotY;
  const baseX = getFigureBaseX(presetPosition, stageWidth, targetWidth);
  return { targetScale, targetWidth, targetHeight, pivotY, baseX, baseY };
}

/** 计算图层在逻辑画布中的绘制矩形；超出裁剪画布时按比例裁剪源纹理 frame。 */
export function computeCharacterLayerPlacement(
  layer: Pick<IPreparedCharacterLayer, 'x' | 'y' | 'scale' | 'width' | 'height'>,
  textureSize: { width: number; height: number },
  canvas: ICharacterCanvas,
  textureFrame: ICharacterRect = { x: 0, y: 0, width: textureSize.width, height: textureSize.height },
): ICharacterLayerPlacement | null {
  if (textureSize.width <= 0 || textureSize.height <= 0 || canvas.width <= 0 || canvas.height <= 0) {
    return null;
  }
  const drawW = layer.width ?? (layer.scale !== undefined ? textureSize.width * layer.scale : textureSize.width);
  const drawH = layer.height ?? (layer.scale !== undefined ? textureSize.height * layer.scale : textureSize.height);
  if (drawW <= 0 || drawH <= 0) {
    return null;
  }

  if (layer.x >= 0 && layer.y >= 0 && layer.x + drawW <= canvas.width && layer.y + drawH <= canvas.height) {
    return { x: layer.x, y: layer.y, width: drawW, height: drawH };
  }

  const visX0 = Math.max(0, layer.x);
  const visY0 = Math.max(0, layer.y);
  const visX1 = Math.min(canvas.width, layer.x + drawW);
  const visY1 = Math.min(canvas.height, layer.y + drawH);
  const visW = visX1 - visX0;
  const visH = visY1 - visY0;
  if (visW <= 0 || visH <= 0) {
    return null;
  }

  const u0 = (visX0 - layer.x) / drawW;
  const v0 = (visY0 - layer.y) / drawH;
  const u1 = (visX1 - layer.x) / drawW;
  const v1 = (visY1 - layer.y) / drawH;
  const cropX = textureFrame.x + u0 * textureFrame.width;
  const cropY = textureFrame.y + v0 * textureFrame.height;
  const cropW = Math.min(textureFrame.x + textureFrame.width - cropX, (u1 - u0) * textureFrame.width);
  const cropH = Math.min(textureFrame.y + textureFrame.height - cropY, (v1 - v0) * textureFrame.height);
  if (cropW <= 0 || cropH <= 0) {
    return null;
  }

  return {
    x: visX0,
    y: visY0,
    width: visW,
    height: visH,
    crop: { x: cropX, y: cropY, width: cropW, height: cropH },
  };
}

/** 承载固定逻辑画布尺寸的组合立绘容器，保证滤镜与参考包围盒按画布整体计算。 */
export class CharacterCanvasContainer extends PIXI.Container {
  private readonly ownedSubTextures: PIXI.Texture[] = [];

  public constructor(public readonly canvasWidth: number, public readonly canvasHeight: number) {
    super();
  }

  public trackOwnedTexture(texture: PIXI.Texture): void {
    this.ownedSubTextures.push(texture);
  }

  protected override _calculateBounds(): void {
    this._bounds.addFrame(this.transform, 0, 0, this.canvasWidth, this.canvasHeight);
  }

  public override destroy(options?: PIXI.IDestroyOptions | boolean): void {
    super.destroy(options);
    // 仅销毁裁剪出的子纹理引用，保留 AssetManager 管理的共享 BaseTexture。
    for (const subTexture of this.ownedSubTextures) {
      subTexture.destroy(false);
    }
    this.ownedSubTextures.length = 0;
  }
}

function mountPreparedCharacterFigure(
  stage: PixiStage,
  figureContainer: WebGALPixiContainer,
  prepared: IPreparedCharacterFigure,
  presetPosition: IFigurePosition,
): void {
  const { canvas, layers } = prepared;
  const layout = computeCharacterStageLayout(canvas, stage.stageWidth, stage.stageHeight, presetPosition);
  const canvasContainer = new CharacterCanvasContainer(canvas.width, canvas.height);
  canvasContainer.pivot.set(canvas.width / 2, canvas.height / 2);
  canvasContainer.scale.set(layout.targetScale, layout.targetScale);
  canvasContainer.position.set(0, layout.pivotY);

  for (const layer of layers) {
    const placement = computeCharacterLayerPlacement(
      layer,
      { width: layer.texture.width, height: layer.texture.height },
      canvas,
      layer.texture.frame,
    );
    if (!placement) {
      continue;
    }
    let spriteTexture = layer.texture;
    if (placement.crop) {
      const { x, y, width, height } = placement.crop;
      spriteTexture = new PIXI.Texture(layer.texture.baseTexture, new PIXI.Rectangle(x, y, width, height));
      canvasContainer.trackOwnedTexture(spriteTexture);
    }
    const sprite = new PIXI.Sprite(spriteTexture);
    sprite.position.set(placement.x, placement.y);
    sprite.width = placement.width;
    sprite.height = placement.height;
    canvasContainer.addChild(sprite);
  }

  figureContainer.setBaseY(layout.baseY);
  figureContainer.setBaseX(layout.baseX);
  figureContainer.pivot.set(0, layout.pivotY);
  figureContainer.addChild(canvasContainer);
}

/** 同步注册组合角色舞台对象，资源就绪后按模板图层装配到画布容器中。 */
export function addCharacterFigureImpl(
  this: PixiStage,
  key: string,
  url: string,
  presetPosition: IFigurePosition = 'center',
): void {
  const thisFigureContainer = new WebGALPixiContainer();

  if (this.figureObjects.some((entry) => entry.key === key)) {
    this.removeStageObjectByKey(key);
  }

  const metadata = this.getFigureMetadataByKey(key);
  if (metadata) {
    if (metadata.zIndex !== undefined) {
      thisFigureContainer.zIndex = metadata.zIndex;
    }
    if (metadata.blendMode !== undefined) {
      thisFigureContainer.blendMode = metadata.blendMode;
    }
  }

  // 冷启动加载前先写入默认预设槽位坐标，确保同步挂载的动画与变换基准一致。
  thisFigureContainer.setBaseX(getFigureBaseX(presetPosition, this.stageWidth, 0));
  thisFigureContainer.setBaseY(this.stageHeight / 2);
  thisFigureContainer.pivot.set(0, this.stageHeight / 2);

  this.figureContainer.addChild(thisFigureContainer);
  const figureUuid = uuid();
  this.figureObjects.push({
    uuid: figureUuid,
    key,
    pixiContainer: thisFigureContainer,
    sourceUrl: url,
    sourceType: 'character',
    sourceExt: 'json',
  });

  const request = { url, kind: 'character' } as const;
  const setup = () => {
    const prepared = this.assets.getReady<IPreparedCharacterFigure>(request);
    const stageObj = this.getStageObjByUuid(figureUuid);
    if (!prepared || !stageObj) {
      return;
    }
    try {
      mountPreparedCharacterFigure(this, thisFigureContainer, prepared, presetPosition);
      if (!stageObj.isExiting) {
        this.notifyTargetReferenceBoxChanged(stageObj.key);
      }
      this.requestRender();
    } catch (error) {
      logger.warn(`组合角色装配失败：${url}`, error);
    }
  };

  this.loadStageAsset(figureUuid, setup, request);
}
