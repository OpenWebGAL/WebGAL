import { generateUniversalSoftInAnimationObj } from '@/Core/controller/stage/pixi/animations/universalSoftIn';
import { logger } from '@/Core/util/logger';
import { generateUniversalSoftOffAnimationObj } from '@/Core/controller/stage/pixi/animations/universalSoftOff';
import { webgalStore } from '@/store/store';
import cloneDeep from 'lodash/cloneDeep';
import { baseTransform, IEffect, ITransform } from '@/store/stageInterface';
import { generateTimelineObj } from '@/Core/controller/stage/pixi/animations/timeline';
import { WebGAL } from '@/Core/WebGAL';
import PixiStage, { IAnimationObject, IStageObject } from '@/Core/controller/stage/pixi/PixiController';
import { DEFAULT_FADING_DURATION } from '../constants';
import { AnimationFrame, IUserAnimation } from './animations';
import { generateTransformAnimationObj } from '../controller/stage/pixi/animations/generateTransformAnimationObj';
import { getNumberArgByKey, getStringArgByKey } from '../util/getSentenceArg';
import { ISentence } from '../controller/scene/sceneInterface';

// eslint-disable-next-line max-params
export function getAnimationObject(animationName: string, target: string, duration: number, writeDefault: boolean) {
  const effect = WebGAL.animationManager.getAnimations().find((ani) => ani.name === animationName);
  if (effect) {
    const mappedEffects = effect.effects.map((effect) => {
      const targetSetEffect = webgalStore.getState().stage.effects.find((e) => e.target === target);
      let newEffect;

      if (!writeDefault && targetSetEffect && targetSetEffect.transform) {
        newEffect = cloneDeep({ ...targetSetEffect.transform, duration: 0, ease: '' });
      } else {
        newEffect = cloneDeep({ ...baseTransform, duration: 0, ease: '' });
      }

      PixiStage.assignTransform(newEffect, effect);
      newEffect.duration = effect.duration;
      newEffect.ease = effect.ease;
      return newEffect;
    });
    logger.debug('装载自定义动画', mappedEffects);
    return generateTimelineObj(mappedEffects, target, duration);
  }
  return null;
}

export function getAnimateDuration(animationName: string) {
  const effect = WebGAL.animationManager.getAnimations().find((ani) => ani.name === animationName);
  if (effect) {
    let duration = 0;
    effect.effects.forEach((e) => {
      duration += e.duration;
    });
    return duration;
  }
  return 0;
}

/***
 * 获取入场或退场动画的对象
 * @param target 目标对象
 * @param type 动画类型，'enter' 或 'exit'
 * @param realTarget 真正的目标对象，用于立绘和背景移除时，打上特殊标记
 */
// eslint-disable-next-line max-params
export function getEnterExitAnimation(
  target: string,
  type: 'enter' | 'exit',
  realTarget?: string,
): {
  duration: number;
  animation: IAnimationObject | null;
} {
  let duration = DEFAULT_FADING_DURATION;
  // 走默认动画
  let animation: IAnimationObject | null = null;
  let animationName: string | undefined;
  if (type === 'enter') {
    animation = generateUniversalSoftInAnimationObj(realTarget ?? target, duration);
    animationName = WebGAL.animationManager.nextEnterAnimationName.get(target);
  } else {
    animation = generateUniversalSoftOffAnimationObj(realTarget ?? target, duration);
    animationName = WebGAL.animationManager.nextExitAnimationName.get(target);
  }

  const transformState = webgalStore.getState().stage.effects;
  const targetEffect = transformState.find((effect) => effect.target === target);

  if (animationName && !targetEffect) {
    logger.debug(`取代默认${type === 'enter' ? '入场' : '退场'}动画`, target);
    animation = getAnimationObject(animationName, realTarget ?? target, getAnimateDuration(animationName), false);
    duration = getAnimateDuration(animationName);
    // 用后重置
    if (type === 'enter') {
      WebGAL.animationManager.nextEnterAnimationName.delete(target);
    } else {
      WebGAL.animationManager.nextExitAnimationName.delete(target);
    }
  }
  return { duration, animation };
}

/**
 * 创建默认的入场或退场动画
 * @param type 动画类型，'enter' 或 'exit'
 * @param target 目标对象
 * @param frame 应用的动画帧
 * @param duration 动画持续时间
 * @param ease 缓动类型
 */
// eslint-disable-next-line max-params
export function createDefaultEnterExitAnimation(
  type: 'enter' | 'exit',
  target: string,
  frame: AnimationFrame,
  duration: number,
  ease: string,
) {
  const animationObj = generateTransformAnimationObj(target, frame, duration, ease, type);
  const animationName = (Math.random() * 10).toString(16);
  const newAnimation: IUserAnimation = { name: animationName, effects: animationObj };
  WebGAL.animationManager.addAnimation(newAnimation);
  if (type === 'enter') {
    WebGAL.animationManager.nextEnterAnimationName.set(target, animationName);
  } else {
    WebGAL.animationManager.nextExitAnimationName.set(target, animationName);
  }
}

// eslint-disable-next-line max-params
export function createEnterExitAnimation(
  sentence: ISentence,
  targetKey: string,
  defaultDuration: number,
  currentTransform: ITransform,
): number {
  // 处理 transform 和 默认 transform
  const transformString = getStringArgByKey(sentence, 'transform');
  const ease = getStringArgByKey(sentence, 'ease') ?? '';
  let duration = getNumberArgByKey(sentence, 'duration') ?? defaultDuration;

  if (transformString) {
    console.log(transformString);
    try {
      const transform = JSON.parse(transformString.toString()) as ITransform;
      const enterFrame = { ...transform, duration: 0, ease: '' };
      const exitFrame = { ...currentTransform, duration: 0, ease: '' };
      createDefaultEnterExitAnimation('enter', targetKey, enterFrame, duration, ease);
      createDefaultEnterExitAnimation('exit', targetKey, exitFrame, duration, ease);
    } catch (e) {
      // 解析都错误了，歇逼吧
      applyDefaultTransform();
    }
  } else {
    applyDefaultTransform();
  }

  function applyDefaultTransform() {
    const enterFrame = { ...baseTransform, duration: 0, ease: '' };
    const exitFrame = { ...currentTransform, duration: 0, ease: '' };
    createDefaultEnterExitAnimation('enter', targetKey, enterFrame, duration, ease);
    createDefaultEnterExitAnimation('exit', targetKey, exitFrame, duration, ease);
  }

  const enterAnimation = getStringArgByKey(sentence, 'enter');
  const exitAnimation = getStringArgByKey(sentence, 'exit');
  if (enterAnimation) {
    WebGAL.animationManager.nextEnterAnimationName.set(targetKey, enterAnimation);
    duration = getAnimateDuration(enterAnimation);
  }
  if (exitAnimation) {
    WebGAL.animationManager.nextExitAnimationName.set(targetKey, exitAnimation);
    duration = getAnimateDuration(exitAnimation);
  }

  return duration;
}

export function getOldTargetSuffix(): string {
  return '-old';
}

export function getOldTargetKey(targetKey: string): string {
  const dateString = String(new Date().getTime());
  return targetKey + dateString + getOldTargetSuffix();
}

export function getEnterAnimationKey(targetKey: string): string {
  return targetKey + '-enter';
}

export function getExitAnimationKey(targetKey: string): string {
  return targetKey + '-exit';
}

/**
 * 移除指定的场景对象及其动画
 * @param targetKey 目标对象的 key
 * @param currentEffects 当前场景效果列表
 */
export function removeStageObjectWithAnimationByKey(targetKey: string, currentEffects: IEffect[]) {
  // 移除入场动画
  const enterAnimationKey = getEnterAnimationKey(targetKey);
  WebGAL.gameplay.pixiStage?.removeAnimation(enterAnimationKey, false);
  // 快进，跳过退出动画
  if (WebGAL.gameplay.isFast) {
    logger.debug('快速模式，立刻关闭立绘');
    WebGAL.gameplay.pixiStage?.removeStageObjectByKey(targetKey);
    return;
  }
  const oldTarget = WebGAL.gameplay.pixiStage?.getStageObjByKey(targetKey);
  if (oldTarget) {
    // 修改旧目标的 key, 以避免和新目标冲突
    const oldTargetKey = getOldTargetKey(targetKey);
    oldTarget.key = oldTargetKey;
    // 注册退场动画
    const exitAnimationKey = getExitAnimationKey(targetKey);
    const { duration, animation } = getEnterExitAnimation(targetKey, 'exit', oldTargetKey);
    WebGAL.gameplay.pixiStage?.registerPresetAnimation(animation, exitAnimationKey, oldTargetKey, currentEffects);
    // 在动画结束后移除对象及其动画
    setTimeout(() => {
      WebGAL.gameplay.pixiStage?.removeAnimation(exitAnimationKey, false, false);
      WebGAL.gameplay.pixiStage?.removeStageObjectByKey(oldTargetKey);
    }, duration);
  }
}

/***
 * 添加或移除场景对象
 * @param targetKey 目标对象的 key
 * @param newUrl 新的资源地址
 * @param currentEffects 当前场景效果列表
 * @param addFunction 添加函数
 */
// eslint-disable-next-line max-params
export function addOrRemoveStageObject(
  targetKey: string,
  newUrl: string,
  currentEffects: IEffect[],
  addFunction: Function,
) {
  if (newUrl !== '') {
    // 如果对象存在且地址不同，移除旧对象, 并添加新对象
    const currentStageObject = WebGAL.gameplay.pixiStage?.getStageObjByKey(targetKey);
    if (currentStageObject) {
      if (currentStageObject.sourceUrl !== newUrl) {
        logger.debug(`移除目标 ${targetKey}: ${currentStageObject.sourceUrl}`);
        removeStageObjectWithAnimationByKey(targetKey, currentEffects);
        // 添加新对象
        logger.debug(`新增目标 ${targetKey}: ${newUrl}`);
        addFunction();
        // 注册入场动画
        const enterAnimationKey = getEnterAnimationKey(targetKey);
        const { duration, animation } = getEnterExitAnimation(targetKey, 'enter');
        WebGAL.gameplay.pixiStage!.registerPresetAnimation(animation, enterAnimationKey, targetKey, currentEffects);
      }
    } else {
      // 如果对象不存在，添加新对象
      logger.debug(`新增目标 ${targetKey}: ${newUrl}`);
      addFunction();
      // 注册入场动画
      const enterAnimationKey = getEnterAnimationKey(targetKey);
      const { duration, animation } = getEnterExitAnimation(targetKey, 'enter');
      WebGAL.gameplay.pixiStage!.registerPresetAnimation(animation, enterAnimationKey, targetKey, currentEffects);
    }
  } else {
    // 如果新地址为空，移除对象
    logger.debug(`移除目标 ${targetKey}`);
    removeStageObjectWithAnimationByKey(targetKey, currentEffects);
  }
}
