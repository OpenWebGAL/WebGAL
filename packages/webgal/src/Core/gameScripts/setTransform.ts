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
import { getAnimateDurationFromObj, getAnimationObject } from '../Modules/animationFunctions';
import { v4 as uuid } from 'uuid';
/**
 * 设置变换
 * @param sentence
 */
export const setTransform = (sentence: ISentence): IPerform => {
  const startDialogKey = webgalStore.getState().stage.currentDialogKey;
  const animationName = uuid();
  const animationString = sentence.content;
  let animationObj: AnimationFrame[];

  const duration = getNumberArgByKey(sentence, 'duration') ?? 500;
  const ease = getStringArgByKey(sentence, 'ease') ?? '';
  const writeDefault = getBooleanArgByKey(sentence, 'writeDefault') ?? false;
  const target = getStringArgByKey(sentence, 'target') ?? '0';
  const keep = getBooleanArgByKey(sentence, 'keep') ?? false;
  const parallel = getBooleanArgByKey(sentence, 'parallel') ?? false;

  const performInitName = `animation-${target}`;

  if (!parallel) WebGAL.gameplay.performController.unmountPerform(performInitName, true);

  try {
    const frame = JSON.parse(animationString) as AnimationFrame;
    // writeDefault时需要完整的当前effect，其他时候不需要
    animationObj = generateTransformAnimationObj(target, frame, duration, ease, writeDefault);
    console.log('animationObj:', animationObj);
  } catch (e) {
    // 解析都错误了，歇逼吧
    animationObj = [];
  }

  const newAnimation: IUserAnimation = { name: animationName, effects: animationObj };
  WebGAL.animationManager.addAnimation(newAnimation);
  const animationDuration = getAnimateDurationFromObj(newAnimation);
  const key = `${target}-${animationName}-${animationDuration}`;
  let keepAnimationStopped = false;
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
  const stopFunction = () => {
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
    isParallel: parallel,
  };
};
