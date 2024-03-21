import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { getSentenceArgByKey } from '@/Core/util/getSentenceArg';
import { IAnimationObject } from '@/Core/controller/stage/pixi/PixiController';
import { logger } from '@/Core/util/logger';
import { webgalStore } from '@/store/store';
import { generateTimelineObj } from '@/Core/controller/stage/pixi/animations/timeline';
import cloneDeep from 'lodash/cloneDeep';
import { baseTransform, ITransform } from '@/store/stageInterface';
import { IUserAnimation } from '../Modules/animations';
import { generateTransformAnimationObj } from '@/Core/controller/stage/pixi/animations/generateTransformAnimationObj';
import { WebGAL } from '@/Core/WebGAL';

/**
 * 设置变换
 * @param sentence
 */
export const setTransform = (sentence: ISentence): IPerform => {
  const startDialogKey = webgalStore.getState().stage.currentDialogKey;
  const animationName = (Math.random() * 10).toString(16);
  const animationString = sentence.content;
  let animationObj: (ITransform & {
    duration: number;
  })[];
  const duration = getSentenceArgByKey(sentence, 'duration');
  const target = (getSentenceArgByKey(sentence, 'target')?.toString() ?? '0') as string;
  try {
    const frame = JSON.parse(animationString) as ITransform & { duration: number };
    animationObj = generateTransformAnimationObj(target, frame, duration);
  } catch (e) {
    // 解析都错误了，歇逼吧
    animationObj = [];
  }

  const newAnimation: IUserAnimation = { name: animationName, effects: animationObj };
  WebGAL.animationManager.addAnimation(newAnimation);
  const animationDuration = getAnimateDuration(animationName);

  const key = `${target}-${animationName}-${animationDuration}`;
  let stopFunction = () => {};
  setTimeout(() => {
    WebGAL.gameplay.pixiStage?.stopPresetAnimationOnTarget(target);
    const animationObj: IAnimationObject | null = getAnimationObject(animationName, target, animationDuration);
    if (animationObj) {
      logger.debug(`动画${animationName}作用在${target}`, animationDuration);
      WebGAL.gameplay.pixiStage?.registerAnimation(animationObj, key, target);
    }
  }, 0);
  stopFunction = () => {
    setTimeout(() => {
      const endDialogKey = webgalStore.getState().stage.currentDialogKey;
      const isHasNext = startDialogKey !== endDialogKey;
      WebGAL.gameplay.pixiStage?.removeAnimationWithSetEffects(key);
    }, 0);
  };

  return {
    performName: key,
    duration: animationDuration,
    isHoldOn: false,
    stopFunction,
    blockingNext: () => false,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };
};

function getAnimationObject(animationName: string, target: string, duration: number) {
  const effect = WebGAL.animationManager.getAnimations().find((ani) => ani.name === animationName);
  if (effect) {
    const mappedEffects = effect.effects.map((effect) => {
      const newEffect = cloneDeep({ ...baseTransform, duration: 0 });
      Object.assign(newEffect, effect);
      newEffect.duration = effect.duration;
      return newEffect;
    });
    logger.debug('装载自定义动画', mappedEffects);
    return generateTimelineObj(mappedEffects, target, duration);
  }
  return null;
}

function getAnimateDuration(animationName: string) {
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
