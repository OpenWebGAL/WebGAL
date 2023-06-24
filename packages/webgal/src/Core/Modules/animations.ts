import { baseTransform, ITransform } from '@/store/stageInterface';
import { WebGAL } from '@/main';
import cloneDeep from 'lodash/cloneDeep';
import { logger } from '@/Core/util/etc/logger';
import { generateTimelineObj } from '@/Core/controller/stage/pixi/animations/timeline';

export interface IUserAnimation {
  name: string;
  effects: Array<ITransform & { duration: number }>;
}

export class AnimationManager {
  public nextEnterAnimationName = '';
  public nextExitAnimationName = '';
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
