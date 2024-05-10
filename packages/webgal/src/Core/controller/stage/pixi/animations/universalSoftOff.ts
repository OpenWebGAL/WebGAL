import { WebGAL } from '@/Core/WebGAL';

export function generateUniversalSoftOffAnimationObj(targetKey: string, duration: number) {
  const target = WebGAL.gameplay.pixiStage!.getStageObjByKey(targetKey);

  // 先设置一个通用的初态

  /**
   * 在此书写为动画设置初态的操作
   */
  function setStartState() {}

  /**
   * 在此书写为动画设置终态的操作
   */
  function setEndState() {
    if (target) target.pixiContainer.alphaFilterVal = 0;
  }

  /**
   * 在此书写动画每一帧执行的函数
   * @param delta
   */
  function tickerFunc(delta: number) {
    if (target) {
      const targetContainer = target.pixiContainer;
      const baseDuration = WebGAL.gameplay.pixiStage!.frameDuration;
      const currentAddOplityDelta = (duration / baseDuration) * delta;
      const decreasement = 1 / currentAddOplityDelta;
      if (targetContainer.alphaFilterVal > 0) {
        targetContainer.alphaFilterVal -= decreasement;
      }
    }
  }

  return {
    setStartState,
    setEndState,
    tickerFunc,
  };
}
