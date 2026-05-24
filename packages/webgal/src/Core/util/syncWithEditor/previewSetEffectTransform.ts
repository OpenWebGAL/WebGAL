import { baseTransform } from '../../Modules/stage/stageInterface';
import type { ITransform } from '../../Modules/stage/stageInterface';
import type { SetEffectPayload } from '../../../types/editorPreviewProtocol';

type SetEffectTransformInput = SetEffectPayload['transform'];

export function mergeSetEffectPreviewTransform(
  baseline: ITransform,
  transform?: SetEffectTransformInput,
): ITransform {
  return {
    ...baseline,
    ...(transform ?? {}),
    position: {
      ...baseline.position,
      ...(transform?.position ?? {}),
    },
    scale: {
      ...baseline.scale,
      ...(transform?.scale ?? {}),
    },
  };
}

export function normalizeSetEffectPreviewBaseline(transform?: ITransform): ITransform {
  return mergeSetEffectPreviewTransform(baseTransform, transform);
}
