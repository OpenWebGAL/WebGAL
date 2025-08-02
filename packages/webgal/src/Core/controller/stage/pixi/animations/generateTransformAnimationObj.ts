import { AnimationFrame } from '@/Core/Modules/animations';
import { webgalStore } from '@/store/store';
import isNull from 'lodash/isNull';

type AnimationObj = Array<AnimationFrame>;

// eslint-disable-next-line max-params
export function generateTransformAnimationObj(
  target: string,
  applyFrame: AnimationFrame,
  duration: number,
  ease: string,
  type: 'enter' | 'exit' | 'normal',
): AnimationObj {
  let animationObj: AnimationFrame[] = [];
  // 获取那个 target 的当前变换
  const transformState = webgalStore.getState().stage.effects;
  const targetEffect = transformState.find((effect) => effect.target === target);

  switch (type) {
    case 'normal': {
      if (targetEffect) {
        // 找到存在的 effect 时, 将该 effect 作为起始状态
        const effectWithDuration = { ...targetEffect!.transform!, duration: 0, ease };
        let newFrame = { ...applyFrame, duration, ease };
        animationObj.push(effectWithDuration);
        animationObj.push(newFrame);
        break;
      } else {
        // 找不到 effect 时, 作为 enter 动画考虑
        // eslint-disable-next-line no-param-reassign
        type = 'enter';
        // 不加 break, 继续执行接下来的 case
      }
    }
    // eslint-disable-next-line no-fallthrough
    case 'enter': {
      // 在最开头加上 applyFrame 的 alpha 0 版本, 实现透明度淡入动画
      const effectWithDuration = { ...applyFrame, alpha: 0, duration: 0, ease };
      let newFrame = { ...applyFrame, duration, ease };
      animationObj.push(effectWithDuration);
      animationObj.push(newFrame);
      break;
    }
    case 'exit': {
      // 在最末尾加上 applyFrame 的 alpha 0 版本, 实现透明度淡出动画
      // 按理说应该拿 targetEffect 才对, 但是退场动画在调用这个函数前
      // 就已经把 effect 清掉了, 故需要手动传进来
      let newFrame = { ...applyFrame, duration: 0, ease };
      const effectWithDuration = { ...applyFrame, alpha: 0, duration, ease };
      animationObj.push(newFrame);
      animationObj.push(effectWithDuration);
    }
  }

  return animationObj;
}
