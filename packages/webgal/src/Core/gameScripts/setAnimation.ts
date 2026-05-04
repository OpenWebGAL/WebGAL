import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { getBooleanArgByKey, getStringArgByKey } from '@/Core/util/getSentenceArg';
import { IAnimationObject } from '@/Core/controller/stage/pixi/PixiController';
import { logger } from '@/Core/util/logger';

import { applyAnimationEndState, getAnimateDuration } from '@/Core/Modules/animationFunctions';
import { WebGAL } from '@/Core/WebGAL';
import { generateTimelineObj } from '@/Core/controller/stage/pixi/animations/timeline';

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
  const parallel = getBooleanArgByKey(sentence, 'parallel') ?? false;

  const key = `${target}-${animationName}-${animationDuration}`;
  const performInitName = `animation-${target}`;
  const performName = parallel ? `${performInitName}#${animationName}` : performInitName;
  let keepAnimationStopped = false;

  if (!parallel) WebGAL.gameplay.performController.unmountPerform(performInitName, true);
  const animationTimeline = applyAnimationEndState(animationName, target, writeDefault, !parallel);

  const startFunction = () => {
    if (keep && keepAnimationStopped) {
      return;
    }
    WebGAL.gameplay.pixiStage?.stopPresetAnimationOnTarget(target);
    const animationObj: IAnimationObject | null = animationTimeline
      ? generateTimelineObj(animationTimeline, target, animationDuration, false)
      : null;
    if (animationObj) {
      logger.debug(`动画${animationName}作用在${target}`, animationDuration);
      WebGAL.gameplay.pixiStage?.registerAnimation(animationObj, key, target);
    }
  };
  const stopFunction = () => {
    if (keep) {
      WebGAL.gameplay.pixiStage?.removeAnimationWithoutSetEndState(key);
      keepAnimationStopped = true;
      return;
    }
    WebGAL.gameplay.pixiStage?.removeAnimationWithSetEffects(key);
  };

  return {
    performName: performName,
    duration: animationDuration,
    isHoldOn: keep,
    startFunction,
    stopFunction,
    blockingNext: () => false,
    blockingAuto: () => !keep,
  };
};
