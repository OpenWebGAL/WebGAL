import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { getBooleanArgByKey, getNumberArgByKey, getStringArgByKey } from '@/Core/util/getSentenceArg';
import PixiStage, { IAnimationObject } from '@/Core/controller/stage/pixi/PixiController';
import { logger } from '@/Core/util/logger';
import { webgalStore } from '@/store/store';
import { generateTimelineObj } from '@/Core/controller/stage/pixi/animations/timeline';
import cloneDeep from 'lodash/cloneDeep';
import { baseTransform, ITransform } from '@/store/stageInterface';
import { AnimationFrame, IUserAnimation } from '../Modules/animations';
import { generateTransformAnimationObj } from '@/Core/controller/stage/pixi/animations/generateTransformAnimationObj';
import { WebGAL } from '@/Core/WebGAL';
import { getAnimateDuration, registerTimelineAnimation, removeTimelineAnimation } from '../Modules/animationFunctions';

/**
 * 设置变换
 * @param sentence
 */
export const setTransform = (sentence: ISentence): IPerform => {
  const animationName = (Math.random() * 10).toString(16);
  const animationString = sentence.content;
  let animationObj: AnimationFrame[];

  const duration = getNumberArgByKey(sentence, 'duration') ?? 500;
  const ease = getStringArgByKey(sentence, 'ease') ?? '';
  const writeDefault = getBooleanArgByKey(sentence, 'writeDefault') ?? false;
  const target = getStringArgByKey(sentence, 'target') ?? '0';
  const keep = getBooleanArgByKey(sentence, 'keep') ?? false;

  const performInitName = `animation-${target}`;
  WebGAL.gameplay.performController.unmountPerform(performInitName, true);

  try {
    const frame = JSON.parse(animationString) as AnimationFrame;
    animationObj = generateTransformAnimationObj(target, frame, duration, ease);
    console.log('animationObj:', animationObj);
  } catch (e) {
    // 解析都错误了，歇逼吧
    animationObj = [];
  }

  const newAnimation: IUserAnimation = { name: animationName, effects: animationObj };
  WebGAL.animationManager.addAnimation(newAnimation);
  const animationDuration = getAnimateDuration(animationName);

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
