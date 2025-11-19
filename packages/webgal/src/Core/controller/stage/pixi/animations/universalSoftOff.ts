import { WebGAL } from '@/Core/WebGAL';

export function generateUniversalSoftOffAnimationObj(targetKey: string, duration: number) {
  const target = WebGAL.gameplay.pixiStage!.getStageObjByKey(targetKey);
  let elapsedTime = 0;

  // 新增变量，用于存储动画开始时的初始透明度
  let startAlpha = 1;

  /**
   * 在此书写为动画设置初态的操作
   */
  function setStartState() {
    elapsedTime = 0; // 重置计时器
    if (target?.pixiContainer) {
      // 修正：不再强制设为1，而是记录当前的透明度
      startAlpha = target.pixiContainer.alpha;
    }
  }

  /**
   * 在此书写为动画设置终态的操作
   */
  function setEndState() {
    if (target?.pixiContainer) {
      // 终态是完全透明，这保持不变
      target.pixiContainer.alpha = 0;
    }
  }

  /**
   * 在此书写动画每一帧执行的函数
   * @param delta
   */
  function tickerFunc(delta: number) {
    if (target) {
      const targetContainer = target.pixiContainer;
      const baseDuration = WebGAL.gameplay.pixiStage!.frameDuration;

      elapsedTime += baseDuration;

      const realElapsedTime = Math.min(elapsedTime, duration);
      const progress = realElapsedTime / duration;

      // 使用 Cubic Ease-In 函数
      const easedProgress = Math.pow(progress, 3);

      // 修正：基于初始透明度 startAlpha 进行计算
      // 公式：最终值 = 初始值 + (目标值 - 初始值) * 进度
      // 在这里，目标值是 0，所以公式简化为：
      // alpha = startAlpha + (0 - startAlpha) * easedProgress
      // alpha = startAlpha * (1 - easedProgress)
      if (targetContainer) targetContainer.alpha = startAlpha * (1 - easedProgress);
    }
  }

  return {
    setStartState,
    setEndState,
    tickerFunc,
  };
}
