import { ITransform } from '@/Core/Modules/stage/stageInterface';
import pickBy from 'lodash/pickBy';

/**
 * 关键帧。duration 为从上一关键帧到本帧的时长（毫秒），ease 为到达本帧这一区间所用的缓动
 */
export type AnimationFrame = ITransform & { duration: number; ease: string };

/**
 * 相对动画中，帧中的值与当前基准状态的计算方式
 */
export type RelativeCalc = 'add' | 'multiply' | 'multiplyWithZeroFallback' | 'absolute';

const RELATIVE_CALCS: RelativeCalc[] = ['add', 'multiply', 'multiplyWithZeroFallback', 'absolute'];

/**
 * 统一后的动画格式（Animation v2），详见 dev-docs/Animation v2.md
 */
export interface IAnimationV2 {
  /** 1 表示由旧接口（关键帧数组）转换而来，按 v1 的行为执行 */
  version: 1 | 2;
  /** 帧中的值是否基于当前基准状态变换 */
  relative: boolean;
  /** 是否启用帧继承：各属性按自己的关键帧分别插值 */
  inherit: boolean;
  /** 按属性名覆盖相对动画的计算方式，只包含合法值 */
  relativeCalc: Partial<Record<string, RelativeCalc>>;
  keyframes: AnimationFrame[];
}

export interface IUserAnimation {
  name: string;
  animation: IAnimationV2;
}

/**
 * setTempAnimation 传入的参数，会覆盖动画中对应字段的值；null 表示未传入
 */
export interface IAnimationOverrides {
  relative?: boolean | null;
  inherit?: boolean | null;
}

export class AnimationManager {
  private animations: Array<IUserAnimation> = [];

  /**
   * 注册动画。无论传入的是旧接口的关键帧数组还是 v2 对象，都统一转换为 v2 格式保存
   */
  public addAnimation(name: string, rawAnimation: unknown, overrides: IAnimationOverrides = {}) {
    this.animations.push({ name, animation: normalizeAnimation(rawAnimation, overrides) });
  }

  public getAnimations() {
    return this.animations;
  }
}

export function normalizeAnimation(rawAnimation: unknown, overrides: IAnimationOverrides): IAnimationV2 {
  // 旧接口：顶层直接是关键帧数组。只有 setTempAnimation 传入了 relative 或 inherit 时才按 v2 处理
  if (Array.isArray(rawAnimation)) {
    const hasOverrides = isBoolean(overrides.relative) || isBoolean(overrides.inherit);
    return hasOverrides ? toV2({ keyframes: rawAnimation }, overrides) : toV1(rawAnimation);
  }
  // 顶层是对象：按 version 处理，缺省或非法时为 2
  if (isObject(rawAnimation)) {
    return rawAnimation.version === 1 ? toV1(rawAnimation.keyframes) : toV2(rawAnimation, overrides);
  }
  return toV1([]);
}

function toV1(keyframes: unknown): IAnimationV2 {
  // v1 中帧的值都是绝对值，也没有帧继承
  return { version: 1, relative: false, inherit: false, relativeCalc: {}, keyframes: normalizeKeyframes(keyframes) };
}

function toV2(rawAnimation: Record<string, unknown>, overrides: IAnimationOverrides): IAnimationV2 {
  return {
    version: 2,
    relative: toBoolean(overrides.relative ?? rawAnimation.relative, true),
    inherit: toBoolean(overrides.inherit ?? rawAnimation.inherit, true),
    relativeCalc: normalizeRelativeCalc(rawAnimation.relativeCalc),
    keyframes: normalizeKeyframes(rawAnimation.keyframes),
  };
}

function normalizeKeyframes(keyframes: unknown): AnimationFrame[] {
  if (!Array.isArray(keyframes)) return [];
  return keyframes.filter(isObject).map((frame) => {
    const duration = typeof frame.duration === 'number' && frame.duration >= 0 ? frame.duration : 0;
    const ease = typeof frame.ease === 'string' ? frame.ease : 'easeInOut';
    return { ...frame, duration, ease } as AnimationFrame;
  });
}

function normalizeRelativeCalc(relativeCalc: unknown): IAnimationV2['relativeCalc'] {
  if (!isObject(relativeCalc)) return {};
  // 非法的计算方式视为未指定，之后按默认计算方式处理
  return pickBy(relativeCalc, (calc) => RELATIVE_CALCS.includes(calc as RelativeCalc)) as IAnimationV2['relativeCalc'];
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

function toBoolean(value: unknown, fallback: boolean): boolean {
  return isBoolean(value) ? value : fallback;
}
