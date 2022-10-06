import { RUNTIME_GAMEPLAY } from '@/Core/runtime/gamePlay';

export function generateBgSoftInFn(targetKey: string, duration: number) {
  const target = RUNTIME_GAMEPLAY.pixiStage!.getBgByKey(targetKey);
  if (target) target.pixiSprite.alpha = 0;
  return function (delta: number) {
    if (target) {
      const sprite = target.pixiSprite;
      const baseDuration = 1000 / 60;
      const currentAddOplityDelta = (duration / baseDuration) * delta;
      const increasement = 1 / currentAddOplityDelta;
      if (sprite.alpha < 1) {
        sprite.alpha += increasement;
      }
    }
  };
}
