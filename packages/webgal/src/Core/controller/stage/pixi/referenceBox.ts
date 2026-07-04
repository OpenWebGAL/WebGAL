import type { ReferenceBox, ReferenceBoxQueryResultPayload } from '@/types/editorPreviewProtocol';

interface PointLike {
  x: number;
  y: number;
}

interface SizeLike {
  width: number;
  height: number;
}

interface BoundsLike extends SizeLike {
  x: number;
  y: number;
}

interface ReferenceBoxContainer {
  getBasePosition(): PointLike;
  getReferenceLocalBounds(): BoundsLike | undefined;
}

export interface ReferenceBoxStageObject {
  pixiContainer: ReferenceBoxContainer | null;
  sourceType: 'img' | 'live2d' | 'spine' | 'gif' | 'video' | 'stage';
}

export type QueryTargetReferenceBoxResult = ReferenceBoxQueryResultPayload;

function createReferenceBox(origin: PointLike, localBounds: BoundsLike, stageSize: SizeLike): ReferenceBox {
  const anchorX = localBounds.width === 0 ? 0.5 : -localBounds.x / localBounds.width;
  const anchorY = localBounds.height === 0 ? 0.5 : -localBounds.y / localBounds.height;

  return {
    originX: origin.x,
    originY: origin.y,
    width: localBounds.width,
    height: localBounds.height,
    anchorX,
    anchorY,
    stageWidth: stageSize.width,
    stageHeight: stageSize.height,
  };
}

function createStageFrameReferenceBox(stageSize: SizeLike): ReferenceBox {
  return {
    originX: stageSize.width / 2,
    originY: stageSize.height / 2,
    width: stageSize.width,
    height: stageSize.height,
    anchorX: 0.5,
    anchorY: 0.5,
    stageWidth: stageSize.width,
    stageHeight: stageSize.height,
  };
}

export function queryStageObjectReferenceBox(
  target: string,
  stageObject: ReferenceBoxStageObject | undefined,
  stageSize: SizeLike,
): QueryTargetReferenceBoxResult {
  if (!stageObject) {
    return {
      target,
      status: 'missing',
    };
  }

  if (stageObject.sourceType === 'stage') {
    return {
      target,
      status: 'ready',
      box: createStageFrameReferenceBox(stageSize),
    };
  }

  if (!stageObject.pixiContainer) {
    return {
      target,
      status: 'loading',
      reason: 'Pixi 容器不可用',
    };
  }

  const localBounds = stageObject.pixiContainer.getReferenceLocalBounds();
  if (!localBounds) {
    return {
      target,
      status: 'loading',
      reason: 'reference bounds 不可用',
    };
  }

  return {
    target,
    status: 'ready',
    box: createReferenceBox(stageObject.pixiContainer.getBasePosition(), localBounds, stageSize),
  };
}
