import { WebGAL } from '@/Core/WebGAL';

export function generateUniversalSoftInAnimationObj(targetKey: string, duration: number) {
  const target = WebGAL.gameplay.pixiStage!.getStageObjByKey(targetKey);
  let elapsedTime = 0;

  // 新增变量，用于存储动画开始时的初始透明度
  let startAlpha = 0;

  /**
   * 在此书写为动画设置初态的操作
   */
  function setStartState() {
    elapsedTime = 0; // Reset timer when animation starts
    if (target?.pixiContainer) {
      // 修正：不再强制设为 0，而是记录当前的透明度
      startAlpha = target.pixiContainer.alphaFilterVal;
    }
  }

  /**
   * 在此书写为动画设置终态的操作
   */
  function setEndState() {
    if (target?.pixiContainer) {
      // 终态是完全不透明，这保持不变
      target.pixiContainer.alphaFilterVal = 1;
    }
  }

  /**
   * 在此书写动画每一帧执行的函数
   * @param delta
   */
  function tickerFunc(delta: number) {
    if (target) {
      const sprite = target.pixiContainer;
      const baseDuration = WebGAL.gameplay.pixiStage!.frameDuration;

      elapsedTime += baseDuration;

      const realElapsedTime = Math.min(elapsedTime, duration);
      const progress = realElapsedTime / duration;

      // 使用 Cubic Ease-Out 函数，这对于“进入”动画感觉更自然
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      // 修正：使用线性插值公式 (lerp)
      // 公式：最终值 = 初始值 + (目标值 - 初始值) * 进度
      // 在这里，目标值是 1，所以公式为：
      // alpha = startAlpha + (1 - startAlpha) * easedProgress
      if (sprite) sprite.alphaFilterVal = startAlpha + (1 - startAlpha) * easedProgress;
    }
  }

  return {
    setStartState,
    setEndState,
    tickerFunc,
  };
}
