import { logger } from '@/Core/util/logger';
import { generateUniversalSoftOffAnimationObj } from '@/Core/controller/stage/pixi/animations/universalSoftOff';
import cloneDeep from 'lodash/cloneDeep';
import { baseTransform, ITransform } from '@/Core/Modules/stage/stageInterface';
import { generateTimelineObj } from '@/Core/controller/stage/pixi/animations/timeline';
import { WebGAL } from '@/Core/WebGAL';
import PixiStage, { IAnimationObject } from '@/Core/controller/stage/pixi/PixiController';
import { IUserAnimation } from './animations';
import { pickBy } from 'lodash';
import { DEFAULT_BG_OUT_DURATION, DEFAULT_FIG_OUT_DURATION } from '../constants';
import { stageStateManager } from '@/Core/Modules/stage/stageStateManager';
import { AnimationFrame } from '@/Core/Modules/animations';

// eslint-disable-next-line max-params
export function getAnimationObject(
  animationName: string,
  target: string,
  duration: number,
  writeDefault: boolean,
  writeFullEffect = true,
) {
  const mappedEffects = getAnimationTimeline(animationName, target, writeDefault, writeFullEffect);
  if (mappedEffects) {
    return generateTimelineObj(mappedEffects, target, duration);
  }
  return null;
}

export function applyAnimationEndState(
  animationName: string,
  target: string,
  writeDefault: boolean,
  writeFullEffect = true,
) {
  const mappedEffects = getAnimationTimeline(animationName, target, writeDefault, writeFullEffect);
  if (!mappedEffects || mappedEffects.length === 0) return null;
  const { duration, ease, ...endState } = mappedEffects[mappedEffects.length - 1];
  stageStateManager.updateEffect({ target, transform: endState });
  return mappedEffects;
}

export function getAnimationTimeline(
  animationName: string,
  target: string,
  writeDefault: boolean,
  writeFullEffect = true,
  sourceTransformOverride?: ITransform,
): AnimationFrame[] | null {
  const effect = WebGAL.animationManager.getAnimations().find((ani) => ani.name === animationName);
  if (effect) {
    const unionKeys = new Set<string>();
    const unionScaleKeys = new Set<string>();
    const unionPositionKeys = new Set<string>();
    if (!writeFullEffect) {
      effect.effects.forEach((effect) => {
        Object.keys(effect).forEach((k) => unionKeys.add(k));
        if (effect.scale) Object.keys(effect.scale).forEach((k) => unionScaleKeys.add(k));
        if (effect.position) Object.keys(effect.position).forEach((k) => unionPositionKeys.add(k));
      });
    }
    const useRelativeFrames = !writeDefault && effect.frameMode === 'relative';
    const sourceTransform = writeDefault
      ? baseTransform
      : cloneDeep(sourceTransformOverride ?? getAnimationSourceTransform(target, useRelativeFrames));
    const mappedEffects = effect.effects.map((effect) => {
      let newEffect;

      if (writeFullEffect) {
        newEffect = cloneDeep({ ...sourceTransform, duration: 0, ease: '' });
      } else {
        const targetScale = pickBy(sourceTransform.scale || {}, (source, key) => unionScaleKeys.has(key));
        const targetPosition = pickBy(sourceTransform.position || {}, (s, key) => unionPositionKeys.has(key));
        const originalTransform = { ...pickBy(sourceTransform, (source, key) => unionKeys.has(key)) };
        if (unionScaleKeys.size > 0) originalTransform.scale = targetScale;
        if (unionPositionKeys.size > 0) originalTransform.position = targetPosition;
        newEffect = cloneDeep({ ...originalTransform, duration: 0, ease: '' });
      }

      const composedFrame = useRelativeFrames ? composeAnimationFrame(sourceTransform, effect) : effect;
      PixiStage.assignTransform(newEffect, composedFrame, false);
      newEffect.duration = effect.duration;
      newEffect.ease = effect.ease;
      return newEffect;
    });
    logger.debug('装载自定义动画', mappedEffects);
    return mappedEffects;
  }
  return null;
}

function composeAnimationFrame(base: ITransform, frame: AnimationFrame): AnimationFrame {
  const next = cloneDeep(frame);
  if (next.position) {
    if (next.position.x !== undefined) next.position.x += base.position?.x ?? 0;
    if (next.position.y !== undefined) next.position.y += base.position?.y ?? 0;
  }
  if (next.scale) {
    if (next.scale.x !== undefined) next.scale.x *= base.scale?.x ?? 1;
    if (next.scale.y !== undefined) next.scale.y *= base.scale?.y ?? 1;
  }
  if (next.rotation !== undefined) next.rotation += base.rotation ?? 0;
  if (next.alpha !== undefined) next.alpha *= base.alpha ?? 1;
  return next;
}

function getAnimationSourceTransform(target: string, useLiveTargetFallback: boolean): ITransform {
  const targetSetEffect = stageStateManager
    .getCalculationStageState()
    .effects.find((effect) => effect.target === target);
  const liveTargetTransform = useLiveTargetFallback ? getCurrentTargetTransform(target) : null;
  return cloneDeep(targetSetEffect?.transform ?? liveTargetTransform ?? baseTransform);
}

function getCurrentTargetTransform(target: string): ITransform | null {
  const container = WebGAL.gameplay.pixiStage?.getStageObjByKey(target)?.pixiContainer;
  if (!container) return null;

  const transform = cloneDeep(baseTransform);
  const containerRecord = container as unknown as Record<string, unknown>;
  const transformRecord = transform as unknown as Record<string, unknown>;
  for (const key of Object.keys(baseTransform)) {
    const value = containerRecord[key];
    if (typeof value === 'number') transformRecord[key] = value;
  }
  transform.alpha = container.alphaFilterVal ?? container.alpha ?? transform.alpha;
  transform.position = transform.position ?? { x: 0, y: 0 };
  transform.scale = transform.scale ?? { x: 1, y: 1 };
  transform.position.x = container.x ?? transform.position.x ?? 0;
  transform.position.y = container.y ?? transform.position.y ?? 0;
  transform.scale.x = container.scale?.x ?? transform.scale.x ?? 1;
  transform.scale.y = container.scale?.y ?? transform.scale.y ?? 1;
  transform.rotation = container.rotation ?? transform.rotation;
  return transform;
}

export function getAnimateDuration(animationName: string) {
  const effect = WebGAL.animationManager.getAnimations().find((ani) => ani.name === animationName);
  if (effect) {
    let duration = 0;
    effect.effects.forEach((e) => {
      duration += e.duration;
    });
    return duration;
  }
  return 0;
}

/**
 * 取退出动画。
 *
 * 入场动画不在这里产出：它由 changeFigure/changeBg 作为普通演出返回，
 * 终态在演算期写入 effects，因此不需要视图层反推该播哪个动画。
 */
export function getExitAnimation(
  target: string,
  isBg = false,
  realTarget?: string, // 用于立绘和背景移除时，以当前时间打上特殊标记
): {
  duration: number;
  animation: IAnimationObject | null;
} {
  let duration = isBg ? DEFAULT_BG_OUT_DURATION : DEFAULT_FIG_OUT_DURATION;
  const animationSettings = stageStateManager
    .getCalculationStageState()
    .animationSettings.find((setting) => setting.target === target);
  duration = animationSettings?.exitDuration ?? duration;
  // 走默认动画
  let animation: IAnimationObject | null = generateUniversalSoftOffAnimationObj(realTarget ?? target, duration);
  const animationName = animationSettings?.exitAnimationName;
  if (animationName) {
    logger.debug('取代默认退出动画', target);
    animation = getAnimationObject(
      animationName,
      realTarget ?? target,
      getAnimateDuration(animationName),
      false,
      !(animationSettings?.exitAnimationIgnoreDefault ?? false),
    );
    duration = getAnimateDuration(animationName);
  }
  if (animationSettings) {
    // 退出动画拿完后，删了这个设定
    stageStateManager.removeAnimationSettingsByTargetOff(target);
    logger.debug('删除退出动画设定', target);
  }
  return { duration, animation };
}
