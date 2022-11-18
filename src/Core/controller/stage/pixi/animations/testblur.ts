import { RUNTIME_GAMEPLAY } from '@/Core/runtime/gamePlay';
import { setBlurFilter } from '@/Core/util/etc/setBlurFilter';

export function generateTestblurAnimationObj(targetKey: string, duration: number) {
  const target = RUNTIME_GAMEPLAY.pixiStage!.getStageObjByKey(targetKey);
  setBlurFilter(target!.pixiContainer);

  // 先设置一个通用的初态

  // TODO：通用初态设置
  /**
   * 在此书写为动画设置初态的操作
   */
  function setStartState() {
    if (target) {
      target.pixiContainer.alpha = 0;
      // @ts-ignore
      target.pixiContainer.blurFilter.blur = 0;
    }
  }

  // TODO：通用终态设置
  /**
   * 在此书写为动画设置终态的操作
   */
  function setEndState() {
    if (target) {
      target.pixiContainer.alpha = 1;
      // @ts-ignore
      target.pixiContainer.blurFilter.blur = 5;
    }
  }

  /**
   * 在此书写动画每一帧执行的函数
   * @param delta
   */
  function tickerFunc(delta: number) {
    if (target) {
      const sprite = target.pixiContainer;
      const baseDuration = RUNTIME_GAMEPLAY.pixiStage!.frameDuration;
      const currentAddOplityDelta = (duration / baseDuration) * delta;
      const increasement = 1 / currentAddOplityDelta;
      const decreasement = 5 / currentAddOplityDelta;
      if (sprite.alpha < 1) {
        sprite.alpha += increasement;
      }
      // @ts-ignore
      if (sprite.blurFilter.blur < 5) {
        // @ts-ignore
        sprite.blurFilter.blur += decreasement;
      }
    }
  }

  return {
    setStartState,
    setEndState,
    tickerFunc,
  };
}
