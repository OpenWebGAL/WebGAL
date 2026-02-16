import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { getBooleanArgByKey, getStringArgByKey } from '@/Core/util/getSentenceArg';
import { IAnimationObject } from '@/Core/controller/stage/pixi/PixiController';
import { logger } from '@/Core/util/logger';
import { webgalStore } from '@/store/store';

import { getAnimateDuration, getAnimationObject } from '@/Core/Modules/animationFunctions';
import { WebGAL } from '@/Core/WebGAL';

/**
 * 设置背景动画
 * @param sentence
 */
export const setAnimation = (sentence: ISentence): IPerform => {
  const animationName = sentence.content;
  const animationDuration = getAnimateDuration(animationName);
  let target = getStringArgByKey(sentence, 'target') ?? '';
  target = target !== '' ? target : 'default_id';
  const writeDefault = getBooleanArgByKey(sentence, 'writeDefault') ?? false;
  const keep = getBooleanArgByKey(sentence, 'keep') ?? false;

  const key = `${target}-${animationName}-${animationDuration}`;
  const performInitName = `animation-${target}`;
  let keepAnimationStopped = false;

  WebGAL.gameplay.performController.unmountPerform(performInitName, true);

  let stopFunction;
  setTimeout(() => {
    if (keep && keepAnimationStopped) {
      return;
    }
    WebGAL.gameplay.pixiStage?.stopPresetAnimationOnTarget(target);
    const animationObj: IAnimationObject | null = getAnimationObject(
      animationName,
      target,
      animationDuration,
      writeDefault,
    );
    if (animationObj) {
      logger.debug(`动画${animationName}作用在${target}`, animationDuration);
      WebGAL.gameplay.pixiStage?.registerAnimation(animationObj, key, target);
    }
  }, 0);
  stopFunction = () => {
    if (keep) {
      WebGAL.gameplay.pixiStage?.removeAnimationWithoutSetEndState(key);
      keepAnimationStopped = true;
      return;
    }
    setTimeout(() => {
      WebGAL.gameplay.pixiStage?.removeAnimationWithSetEffects(key);
    }, 0);
  };

  return {
    performName: performInitName,
    duration: animationDuration,
    isHoldOn: keep,
    stopFunction,
    blockingNext: () => false,
    blockingAuto: () => !keep,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };
};
