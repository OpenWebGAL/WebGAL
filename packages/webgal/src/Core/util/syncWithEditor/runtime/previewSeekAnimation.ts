import cloneDeep from 'lodash/cloneDeep';
import merge from 'lodash/merge';
import set from 'lodash/set';
import { WebGAL } from '@/Core/WebGAL';
import { baseTransform } from '@/Core/Modules/stage/stageInterface';
import { stageStateManager } from '@/Core/Modules/stage/stageStateManager';
import { normalizeAnimation } from '@/Core/Modules/animations';
import { buildAnimationTracks } from '@/Core/Modules/animationTracks';
import { sampleTrack } from '@/Core/controller/stage/pixi/animations/timeline';
import { applyStageEffectToTarget } from '@/Core/controller/stage/pixi/syncPixiStageState';
import type { SeekAnimationPayload } from '@/types/editorPreviewProtocol';

/**
 * 把动画在 time 时刻的状态写入目标，供编辑器拖动时间轴时预览。
 * 基准状态优先取编辑器给出的 baseTransform，否则取演算状态中目标的变换；结果只写入容器，不写入舞台状态
 */
export function seekAnimationPreview({ target, animation, time, baseTransform: previewBase }: SeekAnimationPayload) {
  const targetEffect = stageStateManager.getCalculationStageState().effects.find((e) => e.target === target);
  const base = merge(cloneDeep(baseTransform), previewBase ?? targetEffect?.transform);
  const tracks = buildAnimationTracks(normalizeAnimation(animation, {}), { base, writeFullEffect: false });
  // 从基准状态出发写入各轨道的值，这样动画中删掉的属性也会回到基准状态
  const state = cloneDeep(base);
  tracks.forEach((track) => set(state, track.path, sampleTrack(track.points, time)));
  WebGAL.gameplay.pixiStage?.removeAnimationByTargetKey(target);
  applyStageEffectToTarget(target, state);
}
