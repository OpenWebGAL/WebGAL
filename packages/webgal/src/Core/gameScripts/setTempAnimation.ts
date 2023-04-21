import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/controller/perform/performInterface';
import { getSentenceArgByKey } from '@/Core/util/getSentenceArg';
import { IAnimationObject } from '@/Core/controller/stage/pixi/PixiController';
import { RUNTIME_GAMEPLAY } from '@/Core/runtime/gamePlay';
import { logger } from '@/Core/util/etc/logger';
import { webgalStore } from '@/store/store';
import { IUserAnimation, RUNTIME_USER_ANIMATIONS } from '@/Core/runtime/etc';
import { generateTimelineObj } from '@/Core/controller/stage/pixi/animations/timeline';
import cloneDeep from 'lodash/cloneDeep';
import { baseTransform } from '@/store/stageInterface';

/**
 * 设置临时动画
 * @param sentence
 */
export const setTempAnimation = (sentence: ISentence): IPerform => {
  const startDialogKey = webgalStore.getState().stage.currentDialogKey;
  const animationName = (Math.random() * 10).toString(16);
  const animationString = sentence.content;
  let animationObj;
  try {
    animationObj = JSON.parse(animationString);
  } catch (e) {
    animationObj = [];
  }
  const newAnimation: IUserAnimation = { name: animationName, effects: animationObj };
  RUNTIME_USER_ANIMATIONS.push(newAnimation);
  const animationDuration = getAnimateDuration(animationName);
  const target = (getSentenceArgByKey(sentence, 'target') ?? 0) as string;
  const key = `${target}-${animationName}-${animationDuration}`;
  let stopFunction = () => {};
  setTimeout(() => {
    RUNTIME_GAMEPLAY.pixiStage?.stopPresetAnimationOnTarget(target);
    const animationObj: IAnimationObject | null = getAnimationObject(animationName, target, animationDuration);
    if (animationObj) {
      logger.debug(`动画${animationName}作用在${target}`, animationDuration);
      RUNTIME_GAMEPLAY.pixiStage?.registerAnimation(animationObj, key, target);
    }
  }, 0);
  stopFunction = () => {
    setTimeout(() => {
      const endDialogKey = webgalStore.getState().stage.currentDialogKey;
      const isHasNext = startDialogKey !== endDialogKey;
      RUNTIME_GAMEPLAY.pixiStage?.removeAnimationWithSetEffects(key, !isHasNext);
    }, 0);
  };

  return {
    performName: key,
    duration: animationDuration,
    isOver: false,
    isHoldOn: false,
    stopFunction,
    blockingNext: () => false,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };
};

function getAnimationObject(animationName: string, target: string, duration: number) {
  const effect = RUNTIME_USER_ANIMATIONS.find((ani) => ani.name === animationName);
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

function getAnimateDuration(animationName: string) {
  const effect = RUNTIME_USER_ANIMATIONS.find((ani) => ani.name === animationName);
  if (effect) {
    let duration = 0;
    effect.effects.forEach((e) => {
      duration += e.duration;
    });
    return duration;
  }
  return 0;
}
