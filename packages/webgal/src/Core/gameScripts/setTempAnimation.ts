import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { getBooleanArgByKey, getStringArgByKey, resolveTransformArgs } from '@/Core/util/getSentenceArg';
import { IAnimationObject } from '@/Core/controller/stage/pixi/PixiController';
import { logger } from '@/Core/util/logger';
import { applyAnimationEndState, getAnimateDuration } from '@/Core/Modules/animationFunctions';
import { WebGAL } from '@/Core/WebGAL';
import { v4 as uuid } from 'uuid';
import { generateTimelineObj } from '@/Core/controller/stage/pixi/animations/timeline';
import { IAnimationOverrides, IAnimationV2, normalizeAnimation } from '@/Core/Modules/animations';

/**
 * 设置临时动画
 * @param sentence
 */
export const setTempAnimation = (sentence: ISentence): IPerform => {
  const animationName = uuid();
  const { rawAnimation, overrides } = readTempAnimation(sentence);
  WebGAL.animationManager.addAnimation(animationName, rawAnimation, overrides);
  const animationDuration = getAnimateDuration(animationName);
  const target = getStringArgByKey(sentence, 'target') ?? '0';
  const keep = getBooleanArgByKey(sentence, 'keep') ?? false;
  const parallel = getBooleanArgByKey(sentence, 'parallel') ?? false;
  const { writeDefault, writeFullEffect } = resolveTransformArgs(sentence, parallel);

  const key = `${target}-${animationName}-${animationDuration}`;
  const performInitName = `animation-${target}`;
  const performName = parallel ? `${performInitName}#${animationName}` : performInitName;
  let keepAnimationStopped = false;

  if (!parallel) WebGAL.gameplay.performController.unmountPerform(performInitName, true);
  const animationTimeline = applyAnimationEndState(animationName, target, writeDefault, writeFullEffect);

  const startFunction = () => {
    if (keep && keepAnimationStopped) {
      return;
    }
    const animationObj: IAnimationObject | null = animationTimeline
      ? generateTimelineObj(animationTimeline, target, animationDuration)
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
    // 终态已在命令函数阶段写入 effects，这里只把容器推到终态，不回写演算状态
    WebGAL.gameplay.pixiStage?.removeAnimation(key);
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

/**
 * 解析语句中的临时动画，规则与 setTempAnimation 注册动画时相同
 */
export function parseTempAnimation(sentence: ISentence): IAnimationV2 {
  const { rawAnimation, overrides } = readTempAnimation(sentence);
  return normalizeAnimation(rawAnimation, overrides);
}

/**
 * 读取语句中的动画 JSON 与 relative、inherit 参数。
 * 传入 relative 或 inherit 时，关键帧数组也按 v2 处理；v2 对象中的对应字段会被覆盖
 */
function readTempAnimation(sentence: ISentence): { rawAnimation: unknown; overrides: IAnimationOverrides } {
  let rawAnimation;
  try {
    rawAnimation = JSON.parse(sentence.content);
  } catch (e) {
    rawAnimation = [];
  }
  const relative = getBooleanArgByKey(sentence, 'relative');
  const inherit = getBooleanArgByKey(sentence, 'inherit');
  return { rawAnimation, overrides: { relative, inherit } };
}
