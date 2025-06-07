import { generateUniversalSoftInAnimationObj } from '@/Core/controller/stage/pixi/animations/universalSoftIn';
import { logger } from '@/Core/util/logger';
import { generateUniversalSoftOffAnimationObj } from '@/Core/controller/stage/pixi/animations/universalSoftOff';
import { webgalStore } from '@/store/store';
import cloneDeep from 'lodash/cloneDeep';
import { baseTransform } from '@/store/stageInterface';
import { generateTimelineObj } from '@/Core/controller/stage/pixi/animations/timeline';
import { WebGAL } from '@/Core/WebGAL';
import PixiStage, { IAnimationObject } from '@/Core/controller/stage/pixi/PixiController';

// eslint-disable-next-line max-params
export function getAnimationObject(animationName: string, target: string, duration: number, writeDefault: boolean) {
  const effect = WebGAL.animationManager.getAnimations().find((ani) => ani.name === animationName);
  if (effect) {
    const mappedEffects = effect.effects.map((effect) => {
      const targetSetEffect = webgalStore.getState().stage.effects.find((e) => e.target === target);
      let newEffect;

      if (!writeDefault && targetSetEffect && targetSetEffect.transform) {
        newEffect = cloneDeep({ ...targetSetEffect.transform, duration: 0, ease: '' });
      } else {
        newEffect = cloneDeep({ ...baseTransform, duration: 0, ease: '' });
      }

      PixiStage.assignTransform(newEffect, effect);
      newEffect.duration = effect.duration;
      newEffect.ease = effect.ease;
      return newEffect;
    });
    logger.debug('装载自定义动画', mappedEffects);
    return generateTimelineObj(mappedEffects, target, duration);
  }
  return null;
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

// eslint-disable-next-line max-params
export function getEnterExitAnimation(
  target: string,
  type: 'enter' | 'exit',
  isBg = false,
  realTarget?: string, // 用于立绘和背景移除时，以当前时间打上特殊标记
): {
  duration: number;
  animation: IAnimationObject | null;
} {
  if (type === 'enter') {
    let duration = 500;
    if (isBg) {
      duration = 1500;
    }
    // 走默认动画
    let animation: IAnimationObject | null = generateUniversalSoftInAnimationObj(realTarget ?? target, duration);
    const animarionName = WebGAL.animationManager.nextEnterAnimationName.get(target);
    if (animarionName) {
      logger.debug('取代默认进入动画', target);
      animation = getAnimationObject(animarionName, realTarget ?? target, getAnimateDuration(animarionName), false);
      duration = getAnimateDuration(animarionName);
      // 用后重置
      WebGAL.animationManager.nextEnterAnimationName.delete(target);
    }
    return { duration, animation };
  } else {
    let duration = 750;
    if (isBg) {
      duration = 1500;
    }
    // 走默认动画
    let animation: IAnimationObject | null = generateUniversalSoftOffAnimationObj(realTarget ?? target, duration);
    const animarionName = WebGAL.animationManager.nextExitAnimationName.get(target);
    if (animarionName) {
      logger.debug('取代默认退出动画', target);
      animation = getAnimationObject(animarionName, realTarget ?? target, getAnimateDuration(animarionName), false);
      duration = getAnimateDuration(animarionName);
      // 用后重置
      WebGAL.animationManager.nextExitAnimationName.delete(target);
    }
    return { duration, animation };
  }
}
