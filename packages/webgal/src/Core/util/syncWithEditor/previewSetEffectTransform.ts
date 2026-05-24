import type { ITransform } from '@/Core/Modules/stage/stageInterface';
import type { SetEffectPayload } from '@/types/editorPreviewProtocol';

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
