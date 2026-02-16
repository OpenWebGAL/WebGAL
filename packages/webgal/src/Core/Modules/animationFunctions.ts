import { generateUniversalSoftInAnimationObj } from '@/Core/controller/stage/pixi/animations/universalSoftIn';
import { logger } from '@/Core/util/logger';
import { generateUniversalSoftOffAnimationObj } from '@/Core/controller/stage/pixi/animations/universalSoftOff';
import { webgalStore } from '@/store/store';
import cloneDeep from 'lodash/cloneDeep';
import { baseTransform } from '@/store/stageInterface';
import { generateTimelineObj } from '@/Core/controller/stage/pixi/animations/timeline';
import { WebGAL } from '@/Core/WebGAL';
import PixiStage, { IAnimationObject } from '@/Core/controller/stage/pixi/PixiController';
import {
  DEFAULT_BG_IN_DURATION,
  DEFAULT_BG_OUT_DURATION,
  DEFAULT_FIG_IN_DURATION,
  DEFAULT_FIG_OUT_DURATION,
} from '../constants';
import { stageActions } from '@/store/stageReducer';

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

      PixiStage.assignTransform(newEffect, effect, false);
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
    let duration = DEFAULT_FIG_IN_DURATION;
    if (isBg) {
      duration = DEFAULT_BG_IN_DURATION;
    }
    duration =
      webgalStore.getState().stage.animationSettings.find((setting) => setting.target === target)?.enterDuration ??
      duration;
    // 走默认动画
    let animation: IAnimationObject | null = generateUniversalSoftInAnimationObj(realTarget ?? target, duration);

    const transformState = webgalStore.getState().stage.effects;
    const targetEffect = transformState.find((effect) => effect.target === target);

    const animationName = webgalStore
      .getState()
      .stage.animationSettings.find((setting) => setting.target === target)?.enterAnimationName;
    if (animationName && !targetEffect) {
      logger.debug('取代默认进入动画', target);
      animation = getAnimationObject(animationName, realTarget ?? target, getAnimateDuration(animationName), false);
      duration = getAnimateDuration(animationName);
    }
    return { duration, animation };
  } else {
    // exit
    let duration = DEFAULT_FIG_OUT_DURATION;
    if (isBg) {
      duration = DEFAULT_BG_OUT_DURATION;
    }
    const animationSettings = webgalStore
      .getState()
      .stage.animationSettings.find((setting) => setting.target === target);
    duration = animationSettings?.exitDuration ?? duration;
    // 走默认动画
    let animation: IAnimationObject | null = generateUniversalSoftOffAnimationObj(realTarget ?? target, duration);
    const animationName = animationSettings?.exitAnimationName;
    if (animationName) {
      logger.debug('取代默认退出动画', target);
      animation = getAnimationObject(animationName, realTarget ?? target, getAnimateDuration(animationName), false);
      duration = getAnimateDuration(animationName);
    }
    if (animationSettings) {
      // 退出动画拿完后，删了这个设定
      webgalStore.dispatch(stageActions.removeAnimationSettingsByTargetOff(target));
      logger.debug('删除退出动画设定', target);
    }
    return { duration, animation };
  }
}
