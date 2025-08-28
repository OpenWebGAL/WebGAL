import { WebGAL } from '@/Core/WebGAL';

export function generateUniversalSoftInAnimationObj(targetKey: string, duration: number) {
  const target = WebGAL.gameplay.pixiStage!.getStageObjByKey(targetKey);
  let elapsedTime = 0;

  // 先设置一个通用的初态
  /**
   * 在此书写为动画设置初态的操作
   */
  function setStartState() {
    elapsedTime = 0; // Reset timer when animation starts
    if (target) {
      target.pixiContainer.alpha = 0;
    }
  }

  // TODO：通用终态设置
  /**
   * 在此书写为动画设置终态的操作
   */
  function setEndState() {
    if (target) {
      target.pixiContainer.alpha = 1;
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

      // Increment the elapsed time by the duration of the last frame
      elapsedTime += baseDuration;

      // Ensure elapsedTime does not exceed the total duration
      const realElapsedTime = Math.min(elapsedTime, duration);

      // Calculate the progress of the animation as a value from 0 to 1
      const progress = realElapsedTime / duration;

      // Apply the Cubic Ease-Out function
      // The formula is: 1 - (1 - progress)^3
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      // Set the sprite's alpha to the eased value
      sprite.alpha = easedProgress;
    }
  }

  return {
    setStartState,
    setEndState,
    tickerFunc,
  };
}
