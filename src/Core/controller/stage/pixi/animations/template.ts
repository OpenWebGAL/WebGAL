import { RUNTIME_GAMEPLAY } from '@/Core/runtime/gamePlay';

/**
 * 动画创建模板
 * @param targetKey 作用目标
 * @param duration 持续时间
 */
export function generateTemplateFn(targetKey: string, duration: number) {
  const target = RUNTIME_GAMEPLAY.pixiStage!.getStageObjByKey(targetKey);

  // 先设置一个通用的初态
  // TODO：通用初态设置
  /**
   * 在此书写为动画设置初态的操作
   */

  return function (delta: number) {
    if (target) {
      // 要操控的精灵
      const sprite = target.pixiSprite;
      // 每一帧的时间
      const baseDuration = RUNTIME_GAMEPLAY.pixiStage!.frameDuration;

      /**
       * 在下面书写具体的动画
       */

      // 具体的操作......
    }
  };
}
