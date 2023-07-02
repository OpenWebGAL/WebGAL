import { baseTransform, ITransform } from '@/store/stageInterface';
import { WebGAL } from '@/main';
import cloneDeep from 'lodash/cloneDeep';
import { logger } from '@/Core/util/etc/logger';
import { generateTimelineObj } from '@/Core/controller/stage/pixi/animations/timeline';
import { generateUniversalSoftInAnimationObj } from '@/Core/controller/stage/pixi/animations/universalSoftIn';
import { generateUniversalSoftOffAnimationObj } from '@/Core/controller/stage/pixi/animations/universalSoftOff';

export interface IUserAnimation {
  name: string;
  effects: Array<ITransform & { duration: number }>;
}

export class AnimationManager {
  public nextEnterAnimationName: Map<string, string> = new Map();
  public nextExitAnimationName: Map<string, string> = new Map();
  private animations: Array<IUserAnimation> = [];

  public addAnimation(animation: IUserAnimation) {
    this.animations.push(animation);
  }
  public getAnimations() {
    return this.animations;
  }
}

export function getAnimationObject(animationName: string, target: string, duration: number) {
  const effect = WebGAL.animationManager.getAnimations().find((ani) => ani.name === animationName);
  if (effect) {
    const mappedEffects = effect.effects.map((effect) => {
      const newEffect = cloneDeep({ ...baseTransform, duration: 0 });
      Object.assign(newEffect, effect);
      newEffect.duration = effect.duration / 1000;
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

export function getEnterExitAnimation(
  target: string,
  type: 'enter' | 'exit',
): {
  duration: number;
  animation: {
    setStartState: () => void;
    tickerFunc: (delta: number) => void;
    setEndState: () => void;
  } | null;
} {
  if (type === 'enter') {
    let duration = 300;
    // 走默认动画
    let animation: {
      setStartState: () => void;
      tickerFunc: (delta: number) => void;
      setEndState: () => void;
    } | null = generateUniversalSoftInAnimationObj(target, duration);
    const animarionName = WebGAL.animationManager.nextEnterAnimationName.get(target);
    if (animarionName) {
      logger.debug('取代默认进入动画', target);
      animation = getAnimationObject(animarionName, target, getAnimateDuration(animarionName));
      duration = getAnimateDuration(animarionName);
      // 用后重置
      WebGAL.animationManager.nextEnterAnimationName.delete(target);
    }
    return { duration, animation };
  } else {
    let duration = 300;
    // 走默认动画
    let animation: {
      setStartState: () => void;
      tickerFunc: (delta: number) => void;
      setEndState: () => void;
    } | null = generateUniversalSoftOffAnimationObj(target, duration);
    const animarionName = WebGAL.animationManager.nextExitAnimationName.get(target);
    if (animarionName) {
      logger.debug('取代默认退出动画', target);
      animation = getAnimationObject(animarionName, target, getAnimateDuration(animarionName));
      duration = getAnimateDuration(animarionName);
      // 用后重置
      WebGAL.animationManager.nextExitAnimationName.delete(target);
    }
    return { duration, animation };
  }
}
