import { RUNTIME_GAMEPLAY } from '@/Core/runtime/gamePlay';

export function generateUniversalSoftOffFn(targetKey: string, duration: number) {
  const target = RUNTIME_GAMEPLAY.pixiStage!.getStageObjByKey(targetKey);
  return function (delta: number) {
    if (target) {
      const sprite = target.pixiSprite;
      const baseDuration = 1000 / 60;
      const currentAddOplityDelta = (duration / baseDuration) * delta;
      const decreasement = 1 / currentAddOplityDelta;
      if (sprite.alpha > 0) {
        sprite.alpha -= decreasement;
      }
    }
  };
}
