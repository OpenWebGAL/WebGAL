import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/controller/perform/performInterface';
import { getSentenceArgByKey } from '@/Core/util/getSentenceArg';
import { webgalAnimations } from '@/Core/controller/stage/pixi/animations';
import { IAnimationObject } from '@/Core/controller/stage/pixi/PixiController';
import { RUNTIME_GAMEPLAY } from '@/Core/runtime/gamePlay';
import { logger } from '@/Core/util/etc/logger';

/**
 * 设置背景动画
 * @param sentence
 */
export const setAnimation = (sentence: ISentence): IPerform => {
  const animationName = sentence.content;
  const animationDuration = (getSentenceArgByKey(sentence, 'duration') ?? 0) as number;
  const target = (getSentenceArgByKey(sentence, 'target') ?? 0) as string;
  const isHasNext = (getSentenceArgByKey(sentence, 'next') ?? false) as boolean;
  const key = `${target}-${animationName}-${animationDuration}`;
  const animationFunction: Function | null = getAnimationObject(animationName);
  let stopFunction: Function = () => {};
  if (animationFunction) {
    logger.debug(`动画${animationName}作用在${target}`, animationDuration);
    const animationObj: IAnimationObject = animationFunction(target, animationDuration);
    RUNTIME_GAMEPLAY.pixiStage?.stopPresetAnimationOnTarget(target);
    RUNTIME_GAMEPLAY.pixiStage?.registerAnimation(animationObj, key, target);
    stopFunction = () => RUNTIME_GAMEPLAY.pixiStage?.removeAnimationWithSetEffects(key, !isHasNext);
  }
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

function getAnimationObject(animationName: string): Function | null {
  const result = webgalAnimations.find((e) => e.name === animationName);
  logger.debug('装载动画', result);
  if (result) {
    return result.animationGenerateFunc;
  }
  return null;
}
