import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { getBooleanArgByKey, getStringArgByKey } from '@/Core/util/getSentenceArg';
import { logger } from '@/Core/util/logger';
import { webgalStore } from '@/store/store';

import {
  getAnimateDuration,
  registerTimelineAnimation,
  removeTimelineAnimation,
} from '@/Core/Modules/animationFunctions';
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

  const performInitName = `animation-${target}`;
  WebGAL.gameplay.performController.unmountPerform(performInitName, true);

  const animationKey = `${target}-${animationName}-${animationDuration}`;
  let keepAnimationStopped = false;

  registerTimelineAnimation(
    animationName,
    animationKey,
    target,
    animationDuration,
    writeDefault,
    keep,
    keepAnimationStopped,
  );

  const stopFunction = () => {
    keepAnimationStopped = removeTimelineAnimation(animationKey, keep);
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
