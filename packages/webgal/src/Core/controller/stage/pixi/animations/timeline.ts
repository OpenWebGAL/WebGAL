import { ITransform } from '@/store/stageInterface';
import * as popmotion from 'popmotion';
import { WebGAL } from '@/Core/WebGAL';
import { webgalStore } from '@/store/store';
import { stageActions } from '@/store/stageReducer';
import omitBy from 'lodash/omitBy';
import isUndefined from 'lodash/isUndefined';
import PixiStage, { IAnimationObject } from '@/Core/controller/stage/pixi/PixiController';
import { AnimationFrame } from '@/Core/Modules/animations';

/**
 * 动画创建模板
 * @param timeline
 * @param targetKey 作用目标
 * @param duration 持续时间
 */
export function generateTimelineObj(
  timeline: Array<AnimationFrame>,
  targetKey: string,
  duration: number,
): IAnimationObject {
  for (const segment of timeline) {
    // Alpha 现在直接使用原生属性，无需转换为 alphaFilterVal
  }
  const target = WebGAL.gameplay.pixiStage!.getStageObjByKey(targetKey);
  let currentDelay = 0;
  const values = [];
  const easeArray: Array<popmotion.Easing> = [];
  const times: number[] = [];
  for (let i = 0; i < timeline.length; i++) {
    const segment = timeline[i];
    const segmentDuration = segment.duration;
    currentDelay += segmentDuration;
    const { position, scale, ...segmentValues } = segment;
    // 不能用 scale，因为 popmotion 不能用嵌套
    values.push({ x: position.x, y: position.y, scaleX: scale.x, scaleY: scale.y, ...segmentValues });
    // Easing 需要比 values 的长度少一个
    if (i > 0) {
      easeArray.push(stringToEasing(segment.ease));
    }
    if (duration !== 0) {
      times.push(currentDelay / duration);
    } else times.push(0);
  }
  const container = target?.pixiContainer;
  let animateInstance: ReturnType<typeof popmotion.animate> | null = null;
  // 只有有 duration 的时候才有动画
  if (duration > 0) {
    animateInstance = popmotion.animate({
      to: values,
      offset: times,
      duration,
      ease: easeArray,
      onUpdate: (updateValue) => {
        if (container) {
          const { scaleX, scaleY, ...val } = updateValue;
          // @ts-ignore
          PixiStage.assignTransform(container, omitBy(val, isUndefined));
          // 因为 popmotion 不能用嵌套，scale 要手动设置
          if (!isUndefined(scaleX)) container.scale.x = scaleX;
          if (!isUndefined(scaleY)) container.scale.y = scaleY;
        }
      },
    });
  }

  const { duration: sliceDuration, ...endState } = getEndStateEffect();
  webgalStore.dispatch(stageActions.updateEffect({ target: targetKey, transform: endState }));

  /**
   * 在此书写为动画设置初态的操作
   */
  function setStartState() {
    if (target?.pixiContainer) {
      // 不能赋值到 position，因为 x 和 y 被 WebGALPixiContainer 代理，而 position 属性没有代理
      const { position, scale, ...state } = getStartStateEffect();
      const assignValue = omitBy({ x: position.x, y: position.y, ...state }, isUndefined);
      // @ts-ignore
      PixiStage.assignTransform(target?.pixiContainer, assignValue);
      if (target?.pixiContainer) {
        if (!isUndefined(scale.x)) {
          target.pixiContainer.scale.x = scale.x;
        }
        if (!isUndefined(scale?.y)) {
          target.pixiContainer.scale.y = scale.y;
        }
      }
    }
  }

  /**
   * 在此书写为动画设置终态的操作
   */
  function setEndState() {
    if (!container) {
      return;
    }
    if (animateInstance) animateInstance.stop();
    animateInstance = null;
    if (target?.pixiContainer) {
      // 不能赋值到 position，因为 x 和 y 被 WebGALPixiContainer 代理，而 position 属性没有代理
      // 不能赋值到 position，因为 x 和 y 被 WebGALPixiContainer 代理，而 position 属性没有代理
      const { position, scale, ...state } = getEndStateEffect();
      const assignValue = omitBy({ x: position.x, y: position.y, ...state }, isUndefined);
      // @ts-ignore
      PixiStage.assignTransform(target?.pixiContainer, assignValue);
      if (target?.pixiContainer) {
        if (!isUndefined(scale.x)) {
          target.pixiContainer.scale.x = scale.x;
        }
        if (!isUndefined(scale?.y)) {
          target.pixiContainer.scale.y = scale.y;
        }
      }
    }
  }

  /**
   * 在此书写动画每一帧执行的函数
   * @param delta
   */
  function tickerFunc(delta: number) {}

  function getStartStateEffect() {
    return timeline[0];
  }

  function getEndStateEffect() {
    return timeline[timeline.length - 1];
  }

  function forceStopWithoutSetEndState() {
    if (animateInstance) animateInstance.stop();
    animateInstance = null;
  }

  return {
    setStartState,
    setEndState,
    tickerFunc,
    getEndStateEffect,
    forceStopWithoutSetEndState,
  };
}

const stringToEasing = (ease: string): popmotion.Easing => {
  let easeType = popmotion.easeInOut;
  switch (ease) {
    case 'easeInOut': {
      easeType = popmotion.easeInOut;
      break;
    }
    case 'easeIn': {
      easeType = popmotion.easeIn;
      break;
    }
    case 'easeOut': {
      easeType = popmotion.easeOut;
      break;
    }
    case 'circInOut': {
      easeType = popmotion.circInOut;
      break;
    }
    case 'circIn': {
      easeType = popmotion.circIn;
      break;
    }
    case 'circOut': {
      easeType = popmotion.circOut;
      break;
    }
    case 'backInOut': {
      easeType = popmotion.backInOut;
      break;
    }
    case 'backIn': {
      easeType = popmotion.backIn;
      break;
    }
    case 'backOut': {
      easeType = popmotion.backOut;
      break;
    }
    case 'bounceInOut': {
      easeType = popmotion.bounceInOut;
      break;
    }
    case 'bounceIn': {
      easeType = popmotion.bounceIn;
      break;
    }
    case 'bounceOut': {
      easeType = popmotion.bounceOut;
      break;
    }
    case 'linear': {
      easeType = popmotion.linear;
      break;
    }
    case 'anticipate': {
      easeType = popmotion.anticipate;
      break;
    }
  }
  return easeType;
};
