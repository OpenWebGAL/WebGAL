import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { getBooleanArgByKey, getNumberArgByKey, getStringArgByKey } from '@/Core/util/getSentenceArg';
import { IAnimationObject } from '@/Core/controller/stage/pixi/PixiController';
import { logger } from '@/Core/util/logger';
import { AnimationFrame, IUserAnimation } from '../Modules/animations';
import { generateTransformAnimationObj } from '@/Core/controller/stage/pixi/animations/generateTransformAnimationObj';
import { WebGAL } from '@/Core/WebGAL';
import { applyAnimationEndState, getAnimateDuration } from '../Modules/animationFunctions';
import { v4 as uuid } from 'uuid';
import { generateTimelineObj } from '@/Core/controller/stage/pixi/animations/timeline';
/**
 * 设置变换
 * @param sentence
 */
export const setTransform = (sentence: ISentence): IPerform => {
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
  const performName = parallel ? `${performInitName}#${animationName}` : performInitName;

  if (!parallel) WebGAL.gameplay.performController.unmountPerform(performInitName, true);

  try {
    const frame = JSON.parse(animationString) as AnimationFrame;
    // 保持 writeDefault 的旧语义；是否写完整字段由 parallel 单独控制
    animationObj = generateTransformAnimationObj(target, frame, duration, ease, !parallel);
    console.log('animationObj:', animationObj);
  } catch (e) {
    // 解析都错误了，歇逼吧
    animationObj = [];
  }

  const newAnimation: IUserAnimation = { name: animationName, effects: animationObj };
  WebGAL.animationManager.addAnimation(newAnimation);
  const animationDuration = getAnimateDuration(animationName);
  const animationTimeline = applyAnimationEndState(animationName, target, writeDefault, !parallel);
  const key = `${target}-${animationName}-${animationDuration}`;
  let keepAnimationStopped = false;
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
