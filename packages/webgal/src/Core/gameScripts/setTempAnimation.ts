import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { getBooleanArgByKey, getStringArgByKey } from '@/Core/util/getSentenceArg';
import { IAnimationObject } from '@/Core/controller/stage/pixi/PixiController';
import { logger } from '@/Core/util/logger';
import { IUserAnimation } from '../Modules/animations';
import { applyAnimationEndState, getAnimateDuration } from '@/Core/Modules/animationFunctions';
import { WebGAL } from '@/Core/WebGAL';
import { v4 as uuid } from 'uuid';
import { generateTimelineObj } from '@/Core/controller/stage/pixi/animations/timeline';

/**
 * 设置临时动画
 * @param sentence
 */
export const setTempAnimation = (sentence: ISentence): IPerform => {
  const animationName = uuid();
  const animationString = sentence.content;
  let animationObj;
  try {
    animationObj = JSON.parse(animationString);
  } catch (e) {
    animationObj = [];
  }
  const newAnimation: IUserAnimation = { name: animationName, effects: animationObj };
  WebGAL.animationManager.addAnimation(newAnimation);
  const animationDuration = getAnimateDuration(animationName);
  const target = getStringArgByKey(sentence, 'target') ?? '0';
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
