import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { getNumberArgByKey, getStringArgByKey } from '@/Core/util/getSentenceArg';
import { webgalAnimations } from '@/Core/controller/stage/pixi/animations';
import { IAnimationObject } from '@/Core/controller/stage/pixi/PixiController';
import { logger } from '@/Core/util/logger';

import { WebGAL } from '@/Core/WebGAL';
import { stageStateManager } from '@/Core/Modules/stage/stageStateManager';

/**
 * 设置背景动画
 * @param sentence
 */
export const setComplexAnimation = (sentence: ISentence): IPerform => {
  const startDialogKey = stageStateManager.getCalculationStageState().currentDialogKey;
  const animationName = sentence.content;
  const animationDuration = getNumberArgByKey(sentence, 'duration') ?? 0;
  const target = getStringArgByKey(sentence, 'target') ?? '0';

  const key = `${target}-${animationName}-${animationDuration}`;
  const animationFunction: Function | null = getAnimationObject(animationName);
  let stopFunction: () => void = () => {};
  let startFunction: () => void = () => {};
  if (animationFunction) {
    const calculationAnimationObj: IAnimationObject = animationFunction(target, animationDuration);
    const endStateEffect = calculationAnimationObj.getEndStateEffect?.();
    if (endStateEffect) {
      stageStateManager.updateEffect({ target, transform: endStateEffect });
    }
    startFunction = () => {
      logger.debug(`动画${animationName}作用在${target}`, animationDuration);
      const animationObj: IAnimationObject = animationFunction(target, animationDuration);
      WebGAL.gameplay.pixiStage?.stopPresetAnimationOnTarget(target);
      WebGAL.gameplay.pixiStage?.registerAnimation(animationObj, key, target);
    };
    stopFunction = () => {
      const endDialogKey = stageStateManager.getCalculationStageState().currentDialogKey;
      const isHasNext = startDialogKey !== endDialogKey;
      WebGAL.gameplay.pixiStage?.removeAnimationWithSetEffects(key);
    };
  }
  return {
    performName: key,
    duration: animationDuration,
    isHoldOn: false,
    startFunction,
    stopFunction,
    blockingNext: () => false,
    blockingAuto: () => true,
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
