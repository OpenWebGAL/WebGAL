/**
 * @file 把动画拆成每个属性一条的关键帧轨道。
 *
 * 相对动画、帧继承以及 v1 / v2 的行为差异都在这里处理，产出的轨道中全部是绝对值，
 * 播放时（见 generateTimelineObj）只需按时间在轨道上插值。
 */
import get from 'lodash/get';
import set from 'lodash/set';
import { baseTransform, ITransform } from '@/Core/Modules/stage/stageInterface';
import { AnimationFrame, IAnimationV2, RelativeCalc } from '@/Core/Modules/animations';

/**
 * 轨道上的关键点
 */
export interface ITrackPoint {
  /** 距动画开始的时间（毫秒） */
  time: number;
  value: number;
  /** 从上一个关键点到达本点所用的缓动 */
  ease: string;
}

export interface IAnimationTrack {
  /** 属性路径，如 'alpha'、'position.x' */
  path: string;
  /** 按时间先后排列；时间相同的关键点构成跳变 */
  points: ITrackPoint[];
}

export interface ITrackContext {
  /** 当前基准状态：相对计算的基准，也是关键帧中缺省属性的取值 */
  base: ITransform;
  /** v1 的 writeFullEffect：动画中未涉及的属性也取 base 的值 */
  writeFullEffect: boolean;
}

/**
 * 所有可动画的属性路径，以 baseTransform 为准；position、scale 展开为两轴
 */
export const ANIMATABLE_PATHS = Object.entries(baseTransform).flatMap(([key, value]) =>
  typeof value === 'object' ? Object.keys(value).map((axis) => `${key}.${axis}`) : [key],
);

/**
 * 未在 relativeCalc 中指定时，各属性的默认计算方式；表中没有的属性为 absolute
 */
const DEFAULT_RELATIVE_CALC: Partial<Record<string, RelativeCalc>> = {
  position: 'add',
  rotation: 'add',
  blur: 'add',
  bevel: 'add',
  bevelThickness: 'add',
  bevelRotation: 'add',
  bevelSoftness: 'add',
  bloom: 'add',
  bloomBlur: 'add',
  scale: 'multiplyWithZeroFallback',
};

export function buildAnimationTracks(animation: IAnimationV2, context: ITrackContext): IAnimationTrack[] {
  if (animation.keyframes.length === 0) return [];
  return getAnimatedPaths(animation, context.writeFullEffect).map((path) => ({
    path,
    points: buildTrackPoints(animation, path, readValue(context.base, path)),
  }));
}

/**
 * 动画终态：每条轨道最后一个关键点的值
 */
export function getTracksEndState(tracks: IAnimationTrack[]): ITransform {
  const endState: ITransform = {};
  tracks.forEach((track) => set(endState, track.path, track.points[track.points.length - 1].value));
  return endState;
}

/**
 * 动画会改变哪些属性：关键帧中出现过的属性。v1 开启 writeFullEffect 时为全部属性
 */
function getAnimatedPaths(animation: IAnimationV2, writeFullEffect: boolean): string[] {
  if (animation.version === 1 && writeFullEffect) return ANIMATABLE_PATHS;
  return ANIMATABLE_PATHS.filter((path) => animation.keyframes.some((frame) => hasValue(frame, path)));
}

function buildTrackPoints(animation: IAnimationV2, path: string, baseValue: number): ITrackPoint[] {
  const calc = getRelativeCalc(animation, path);
  const points: ITrackPoint[] = [];
  let time = 0;
  for (const frame of animation.keyframes) {
    time += frame.duration;
    if (hasValue(frame, path)) {
      points.push({ time, value: applyRelativeCalc(calc, baseValue, get(frame, path)), ease: frame.ease });
    } else if (!animation.inherit) {
      // 不继承时，关键帧中未指定的属性取当前基准状态；继承时直接跳过，由前后关键帧插值
      points.push({ time, value: baseValue, ease: frame.ease });
    }
  }
  // 第一个关键帧之前：v2 从当前基准状态过渡到第一个关键帧；
  // v1 保持第一个关键帧的值，不需要额外的点，因为采样时早于第一个点会取第一个点的值
  if (animation.version === 2) {
    points.unshift({ time: 0, value: baseValue, ease: 'linear' });
  }
  return points;
}

/**
 * 属性的相对计算方式。position.x 这样的嵌套属性按顶层属性名（position）查找，即设置同时作用于两轴
 */
function getRelativeCalc(animation: IAnimationV2, path: string): RelativeCalc {
  if (!animation.relative) return 'absolute';
  const key = path.split('.')[0];
  return animation.relativeCalc[key] ?? DEFAULT_RELATIVE_CALC[key] ?? 'absolute';
}

function applyRelativeCalc(calc: RelativeCalc, baseValue: number, frameValue: number): number {
  switch (calc) {
    case 'add':
      return baseValue + frameValue;
    case 'multiply':
      return baseValue * frameValue;
    case 'multiplyWithZeroFallback':
      return (baseValue === 0 ? 1 : baseValue) * frameValue;
    case 'absolute':
      return frameValue;
  }
}

function hasValue(frame: AnimationFrame, path: string): boolean {
  return typeof get(frame, path) === 'number';
}

/**
 * 读取变换中的属性值，变换中没有时取 baseTransform 的值（演算状态中的变换可能不完整）
 */
function readValue(transform: ITransform, path: string): number {
  return get(transform, path) ?? get(baseTransform, path);
}
