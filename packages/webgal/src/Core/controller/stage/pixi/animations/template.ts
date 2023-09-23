import { WebGAL } from '@/Core/WebGAL';

/**
 * 动画创建模板
 * @param targetKey 作用目标
 * @param duration 持续时间
 */
export function generateTemplateAnimationObj(targetKey: string, duration: number) {
  const target = WebGAL.gameplay.pixiStage!.getStageObjByKey(targetKey);

  // 先设置一个通用的初态

  // TODO：通用初态设置
  /**
   * 在此书写为动画设置初态的操作
   */
  function setStartState() {}

  // TODO：通用终态设置
  /**
   * 在此书写为动画设置终态的操作
   */
  function setEndState() {}

  /**
   * 在此书写动画每一帧执行的函数
   * @param delta
   */
  function tickerFunc(delta: number) {
    if (target) {
      // 要操控的精灵
      const sprite = target.pixiContainer;
      // 每一帧的时间
      const baseDuration = WebGAL.gameplay.pixiStage!.frameDuration;

      /**
       * 在下面书写具体的动画
       */

      // 具体的操作......
    }
  }

  return {
    setStartState,
    setEndState,
    tickerFunc,
  };
}
