import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { getBooleanArgByKey, getStringArgByKey } from '@/Core/util/getSentenceArg';
import { logger } from '@/Core/util/logger';
import { webgalStore } from '@/store/store';
import { generateTimelineObj } from '@/Core/controller/stage/pixi/animations/timeline';
import cloneDeep from 'lodash/cloneDeep';
import { baseTransform } from '@/store/stageInterface';
import { IUserAnimation } from '../Modules/animations';
import {
  getAnimateDuration,
  registerTimelineAnimation,
  removeTimelineAnimation,
} from '@/Core/Modules/animationFunctions';
import { WebGAL } from '@/Core/WebGAL';

/**
 * 设置临时动画
 * @param sentence
 */
export const setTempAnimation = (sentence: ISentence): IPerform => {
  const animationName = (Math.random() * 10).toString(16);
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

  const performInitName = `animation-${target}`;
  WebGAL.gameplay.performController.unmountPerform(performInitName, true);

  const animationKey = `${target}-${animationName}-${animationDuration}`;
  let keepAnimationStopped = false;

  setTimeout(() => {
    if (keep && keepAnimationStopped) {
      return;
    }
    registerTimelineAnimation(animationName, animationKey, target, animationDuration, writeDefault);
  }, 0);

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
