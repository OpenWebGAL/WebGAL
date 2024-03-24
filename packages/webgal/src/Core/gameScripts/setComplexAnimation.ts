import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { getSentenceArgByKey } from '@/Core/util/getSentenceArg';
import { webgalAnimations } from '@/Core/controller/stage/pixi/animations';
import { IAnimationObject } from '@/Core/controller/stage/pixi/PixiController';
import { logger } from '@/Core/util/logger';
import { webgalStore } from '@/store/store';

import { WebGAL } from '@/Core/WebGAL';

/**
 * 设置背景动画
 * @param sentence
 */
export const setComplexAnimation = (sentence: ISentence): IPerform => {
  const startDialogKey = webgalStore.getState().stage.currentDialogKey;
  const animationName = sentence.content;
  const animationDuration = (getSentenceArgByKey(sentence, 'duration') ?? 0) as number;
  const target = (getSentenceArgByKey(sentence, 'target')?.toString() ?? '0') as string;
  const key = `${target}-${animationName}-${animationDuration}`;
  const animationFunction: Function | null = getAnimationObject(animationName);
  let stopFunction: () => void = () => {};
  if (animationFunction) {
    logger.debug(`动画${animationName}作用在${target}`, animationDuration);
    const animationObj: IAnimationObject = animationFunction(target, animationDuration);
    WebGAL.gameplay.pixiStage?.stopPresetAnimationOnTarget(target);
    WebGAL.gameplay.pixiStage?.registerAnimation(animationObj, key, target);
    stopFunction = () => {
      const endDialogKey = webgalStore.getState().stage.currentDialogKey;
      const isHasNext = startDialogKey !== endDialogKey;
      WebGAL.gameplay.pixiStage?.removeAnimationWithSetEffects(key);
    };
  }
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

function getAnimationObject(animationName: string): Function | null {
  const result = webgalAnimations.find((e) => e.name === animationName);
  logger.debug('装载动画', result);
  if (result) {
    return result.animationGenerateFunc;
  }
  return null;
}
