import { baseTransform } from '@/Core/Modules/stage/stageInterface';
import type { ITransform } from '@/Core/Modules/stage/stageInterface';
import { isUndefined, omitBy } from 'lodash';
import type { WebGALPixiContainer } from './WebGALPixiContainer';

type PixiTransformPatch = ITransform & {
  x?: number;
  y?: number;
  alphaFilterVal?: number;
};

export function assignPixiTransform<T extends PixiTransformPatch>(
  target: T | undefined,
  source?: PixiTransformPatch,
  convertAlpha = true,
) {
  if (!target || !source) return;
  const targetScale = target.scale;
  const targetPosition = target.position;
  if (targetScale) Object.assign(targetScale, omitBy(source.scale || {}, isUndefined));
  if (targetPosition) Object.assign(targetPosition, omitBy(source.position || {}, isUndefined));
  Object.assign(target, omitBy(source, isUndefined));
  target.scale = targetScale;
  target.position = targetPosition;
  if (convertAlpha) {
    const sourceAlpha = source.alpha;
    if (sourceAlpha !== undefined) {
      target.alpha = 1;
      target.alphaFilterVal = sourceAlpha;
    }
  }
}

function toPixiTransformPatch(transform: ITransform): PixiTransformPatch {
  const { position, ...rest } = transform;
  return omitBy({ ...rest, x: position?.x, y: position?.y }, isUndefined);
}

export function applyTransformToPixiContainer(
  container: WebGALPixiContainer | null | undefined,
  transform?: ITransform,
) {
  if (!container) return;
  assignPixiTransform(container, toPixiTransformPatch(transform ?? baseTransform));
}
