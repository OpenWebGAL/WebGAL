import * as popmotion from 'popmotion';
import get from 'lodash/get';
import set from 'lodash/set';
import { WebGAL } from '@/Core/WebGAL';
import { IAnimationObject } from '@/Core/controller/stage/pixi/PixiController';
import type { WebGALPixiContainer } from '@/Core/controller/stage/pixi/WebGALPixiContainer';
import { ITransform } from '@/Core/Modules/stage/stageInterface';
import { ANIMATABLE_PATHS, IAnimationTrack, ITrackPoint } from '@/Core/Modules/animationTracks';

/**
 * 动画创建模板
 * @param tracks 各属性的关键帧轨道，见 buildAnimationTracks
 * @param targetKey 作用目标
 * @param duration 持续时间
 */
export function generateTimelineObj(tracks: IAnimationTrack[], targetKey: string, duration: number): IAnimationObject {
  const container = WebGAL.gameplay.pixiStage!.getStageObjByKey(targetKey)?.pixiContainer;
  let animateInstance: ReturnType<typeof popmotion.animate> | null = null;

  /**
   * 把动画在 time 时刻的状态写入容器
   */
  function applyStateAt(time: number) {
    if (!container) return;
    for (const track of tracks) {
      setContainerValue(container, track.path, sampleTrack(track.points, time));
    }
  }

  /**
   * 在此书写为动画设置初态的操作
   */
  function setStartState() {
    applyStateAt(0);
    if (duration > 0) {
      animateInstance = popmotion.animate({
        from: 0,
        to: duration,
        duration,
        ease: popmotion.linear,
        onUpdate: (time) => applyStateAt(time),
      });
    }
  }

  /**
   * 在此书写为动画设置终态的操作
   */
  function setEndState() {
    forceStopWithoutSetEndState();
    applyStateAt(duration);
  }

  /**
   * 在此书写动画每一帧执行的函数。时间由 popmotion 驱动，这里不需要做什么
   * @param delta
   */
  function tickerFunc(delta: number) {}

  function forceStopWithoutSetEndState() {
    if (animateInstance) animateInstance.stop();
    animateInstance = null;
  }

  return {
    setStartState,
    setEndState,
    tickerFunc,
    forceStopWithoutSetEndState,
  };
}

/**
 * 取轨道在 time 时刻的值
 */
function sampleTrack(points: ITrackPoint[], time: number): number {
  // 本区间的插值终点：第一个晚于 time 的关键点
  const nextIndex = points.findIndex((point) => point.time > time);
  // 在最后一个关键点之后：保持最后的值
  if (nextIndex === -1) return points[points.length - 1].value;
  // 在第一个关键点之前：保持第一个关键点的值
  if (nextIndex === 0) return points[0].value;
  // 本区间的起点。时间相同的多个关键点中，靠后的是跳变后的状态，正好是 nextIndex 的前一个
  const prev = points[nextIndex - 1];
  const next = points[nextIndex];
  const progress = (time - prev.time) / (next.time - prev.time);
  return prev.value + (next.value - prev.value) * stringToEasing(next.ease)(progress);
}

/**
 * 变换属性在容器上的对应属性：透明度由 alpha 滤镜实现，位置由 WebGALPixiContainer 代理的 x、y 实现，
 * 与 assignPixiTransform 的写法一致。其余属性同名
 */
const CONTAINER_PROPERTY: Partial<Record<string, string>> = {
  alpha: 'alphaFilterVal',
  'position.x': 'x',
  'position.y': 'y',
};

function getContainerValue(container: WebGALPixiContainer, path: string): number {
  return get(container, CONTAINER_PROPERTY[path] ?? path);
}

function setContainerValue(container: WebGALPixiContainer, path: string, value: number) {
  set(container, CONTAINER_PROPERTY[path] ?? path, value);
}

/**
 * 从容器读取当前变换，用于演算状态中已没有记录的舞台对象（如正在退场的立绘）
 */
export function readContainerTransform(container: WebGALPixiContainer): ITransform {
  const transform: ITransform = {};
  ANIMATABLE_PATHS.forEach((path) => set(transform, path, getContainerValue(container, path)));
  return transform;
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
