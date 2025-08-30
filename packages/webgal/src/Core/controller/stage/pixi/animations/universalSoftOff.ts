import { WebGAL } from '@/Core/WebGAL';

export function generateUniversalSoftOffAnimationObj(targetKey: string, duration: number) {
  const target = WebGAL.gameplay.pixiStage!.getStageObjByKey(targetKey);
  let elapsedTime = 0;

  // 先设置一个通用的初态

  /**
   * 在此书写为动画设置初态的操作
   */
  function setStartState() {
    elapsedTime = 0; // Reset timer when animation starts
    if (target) {
      // It's good practice to ensure the starting alpha is 1
      // in case the animation is chained or re-run.
      target.pixiContainer.alpha = 1;
    }
  }

  /**
   * 在此书写为动画设置终态的操作
   */
  function setEndState() {
    if (target) {
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

      // Increment the elapsed time by the duration of the last frame
      elapsedTime += baseDuration;

      // Ensure elapsedTime does not exceed the total duration
      const realElapsedTime = Math.min(elapsedTime, duration);

      // Calculate the progress of the animation as a value from 0 to 1
      const progress = realElapsedTime / duration;

      // Apply the Cubic Ease-In function
      // The formula is: progress^3
      const easedProgress = Math.pow(progress, 3);

      // To fade out, we subtract the eased progress from 1
      // As easedProgress goes from 0 to 1 (slowly then quickly),
      // alpha will go from 1 to 0 (slowly then quickly).
      targetContainer.alpha = 1 - easedProgress;
    }
  }

  return {
    setStartState,
    setEndState,
    tickerFunc,
  };
}
