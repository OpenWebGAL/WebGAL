import * as PIXI from 'pixi.js';
import { v4 as uuid } from 'uuid';
import type { CharacterCanvas } from '@/Core/character/characterTemplate';
import type PixiStage from '@/Core/controller/stage/pixi/PixiController';
import type { IStageObject } from '@/Core/controller/stage/pixi/PixiController';
import { WebGALPixiContainer } from '@/Core/controller/stage/pixi/WebGALPixiContainer';
import type { PreparedCharacter } from '@/Core/controller/stage/pixi/assets/characterAssets';
import {
  characterResource,
  resourceKey,
  type ResourceRequest,
} from '@/Core/controller/stage/pixi/assets/resourceTypes';
import { getFigureBaseX, type ICharacterFigure, type IFigurePosition } from '@/Core/Modules/stage/stageInterface';

/** 计算组合角色在舞台上的基准坐标与缩放，与单图立绘 addFigure 保持一致。 */
export function computeCharacterStageLayout(
  canvas: CharacterCanvas,
  stageWidth: number,
  stageHeight: number,
  presetPosition: IFigurePosition = 'center',
) {
  const targetScale =
    canvas.width > 0 && canvas.height > 0 ? Math.min(stageWidth / canvas.width, stageHeight / canvas.height) : 1;
  const targetWidth = canvas.width * targetScale;
  const targetHeight = canvas.height * targetScale;
  const pivotY = stageHeight / 2;
  const baseY = targetHeight < stageHeight ? pivotY + (stageHeight - targetHeight) / 2 : pivotY;
  const baseX = getFigureBaseX(presetPosition, stageWidth, targetWidth);
  return { targetScale, targetWidth, targetHeight, pivotY, baseX, baseY };
}

/** 承载固定逻辑画布尺寸的组合立绘容器，保证滤镜与参考包围盒按画布整体计算。 */
export class CharacterCanvasContainer extends PIXI.Container {
  public constructor(public readonly canvasWidth: number, public readonly canvasHeight: number) {
    super();
  }

  protected override _calculateBounds(): void {
    this._bounds.addFrame(this.transform, 0, 0, this.canvasWidth, this.canvasHeight);
  }
}

export function getCharacterIdentity(character: Pick<ICharacterFigure, 'name' | 'basePosition'>): string {
  return JSON.stringify([character.name, character.basePosition]);
}

function mountPreparedCharacter(
  stage: PixiStage,
  container: WebGALPixiContainer,
  prepared: PreparedCharacter,
  presetPosition: IFigurePosition,
): void {
  const { canvas, layers } = prepared;
  const layout = computeCharacterStageLayout(canvas, stage.stageWidth, stage.stageHeight, presetPosition);
  const canvasContainer = new CharacterCanvasContainer(canvas.width, canvas.height);
  canvasContainer.pivot.set(canvas.width / 2, canvas.height / 2);
  canvasContainer.scale.set(layout.targetScale, layout.targetScale);
  canvasContainer.position.set(0, layout.pivotY);

  for (const layer of layers) {
    if (layer.texture.width <= 0 || layer.texture.height <= 0) continue;
    const sprite = new PIXI.Sprite(layer.texture);
    const sx = layer.scaleX ?? layer.scale ?? 1;
    const sy = layer.scaleY ?? layer.scale ?? 1;
    const drawW = layer.width ?? layer.texture.width * sx;
    const drawH = layer.height ?? layer.texture.height * sy;
    if (layer.width !== undefined && layer.height !== undefined) {
      sprite.width = layer.width;
      sprite.height = layer.height;
    } else if (sx !== 1 || sy !== 1) {
      sprite.scale.set(sx, sy);
    }
    if (layer.rotation) {
      // 围绕图层中心旋转，再把中心放回原局部坐标框的几何中心
      sprite.anchor.set(0.5, 0.5);
      sprite.position.set(layer.x + drawW / 2, layer.y + drawH / 2);
      sprite.rotation = layer.rotation;
    } else {
      sprite.position.set(layer.x, layer.y);
    }
    canvasContainer.addChild(sprite);
  }

  for (const child of [...container.children]) {
    if (child instanceof CharacterCanvasContainer) {
      container.removeChild(child);
      child.destroy({ children: true });
    }
  }
  container.setBaseY(layout.baseY);
  container.setBaseX(layout.baseX);
  container.pivot.set(0, layout.pivotY);
  container.addChild(canvasContainer);
}

function loadCharacterIntoStage(
  stage: PixiStage,
  stageObj: IStageObject,
  basePosition: IFigurePosition,
  request: ResourceRequest,
): void {
  const requestId = uuid();
  stageObj.characterRequestId = requestId;
  stageObj.characterResourceKey = resourceKey(request);

  stage.loadStageAsset(
    stageObj.uuid,
    () => {
      if (stageObj.characterRequestId !== requestId || !stageObj.pixiContainer) return;
      // 退场期间保留已有立绘画面，避免淡出途中发生换装闪烁。
      if (stageObj.isExiting && stageObj.pixiContainer.children.length > 0) return;
      const prepared = stage.assets.getReady<PreparedCharacter>(request);
      if (!prepared) return;

      mountPreparedCharacter(stage, stageObj.pixiContainer, prepared, basePosition);
      // 换装完成后交接长期持有权，使旧套装纹理可被 AssetManager 统一回收。
      stage.assets.release(stageObj.uuid);
      stage.assets.retain(stageObj.uuid, request);
      if (!stageObj.isExiting) stage.notifyTargetReferenceBoxChanged(stageObj.key);
      stage.requestRender();
    },
    request,
  );
}

/** 同步注册组合角色舞台对象，资源就绪后按模板图层装配到画布容器中。 */
export function addCharacterFigureImpl(this: PixiStage, key: string, character: ICharacterFigure): void {
  if (this.figureObjects.some((entry) => entry.key === key)) {
    this.removeStageObjectByKey(key);
  }
  const container = new WebGALPixiContainer();
  const metadata = this.getFigureMetadataByKey(key);
  if (metadata?.zIndex !== undefined) container.zIndex = metadata.zIndex;
  if (metadata?.blendMode !== undefined) container.blendMode = metadata.blendMode;

  // 冷启动加载前先写入默认槽位坐标，确保同步挂载的动画与变换基准一致。
  container.setBaseX(getFigureBaseX(character.basePosition, this.stageWidth, 0));
  container.setBaseY(this.stageHeight / 2);
  container.pivot.set(0, this.stageHeight / 2);
  this.figureContainer.addChild(container);

  const request = characterResource(character.name, character);
  const stageObj: IStageObject = {
    uuid: uuid(),
    key,
    pixiContainer: container,
    sourceUrl: request.url,
    sourceType: 'character',
    sourceExt: 'json',
    characterIdentity: getCharacterIdentity(character),
    characterResourceKey: resourceKey(request),
  };
  this.figureObjects.push(stageObj);
  loadCharacterIntoStage(this, stageObj, character.basePosition, request);
}

/** 在保留外层容器、相对偏移与进行中动画的前提下原地更新组合角色部件。 */
export function updateCharacterFigureImpl(this: PixiStage, key: string, character: ICharacterFigure): void {
  const stageObj = this.getStageObjByKey(key);
  if (!stageObj || stageObj.sourceType !== 'character' || !stageObj.pixiContainer) return;
  loadCharacterIntoStage(this, stageObj, character.basePosition, characterResource(character.name, character));
}
