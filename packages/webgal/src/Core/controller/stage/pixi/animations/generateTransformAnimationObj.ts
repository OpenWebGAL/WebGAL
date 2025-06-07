import { AnimationFrame } from '@/Core/Modules/animations';
import { webgalStore } from '@/store/store';
import isNull from 'lodash/isNull';

type AnimationObj = Array<AnimationFrame>;

// eslint-disable-next-line max-params
export function generateTransformAnimationObj(
  target: string,
  applyFrame: AnimationFrame,
  duration: number | string | boolean | null,
  ease: string,
): AnimationObj {
  let animationObj;
  // 获取那个 target 的当前变换
  const transformState = webgalStore.getState().stage.effects;
  const targetEffect = transformState.find((effect) => effect.target === target);

  applyFrame.duration = 500;
  if (!isNull(duration) && typeof duration === 'number') {
    applyFrame.duration = duration;
  }
  applyFrame.ease = ease;
  animationObj = [applyFrame];

  // 找到 effect
  if (targetEffect) {
    const effectWithDuration = { ...targetEffect!.transform!, duration: 0, ease };
    animationObj.unshift(effectWithDuration);
  } else {
    // 应用默认effect，也就是最终的 effect 的 alpha = 0 版本
    const effectWithDuration = { ...applyFrame, alpha: 0, duration: 0, ease };
    animationObj.unshift(effectWithDuration);
  }
  return animationObj;
}
