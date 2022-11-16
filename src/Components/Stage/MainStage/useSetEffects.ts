import { RUNTIME_GAMEPLAY } from '@/Core/runtime/gamePlay';
import { baseTransform, IStageState } from '@/store/stageInterface';

export function setStageObjectEffects(stageState: IStageState) {
  const effects = stageState.effects;
  setTimeout(() => {
    const stageObjects = RUNTIME_GAMEPLAY.pixiStage?.getAllStageObj() ?? [];
    for (const stageObj of stageObjects) {
      const key = stageObj.key;
      const effect = effects.find((effect) => effect.target === key);
      const lockedStageTargets = RUNTIME_GAMEPLAY.pixiStage?.getAllLockedObject() ?? [];
      if (!lockedStageTargets.includes(key)) {
        if (effect) {
          const targetPixiContainer = RUNTIME_GAMEPLAY.pixiStage?.getStageObjByKey(key);
          if (targetPixiContainer) {
            const container = targetPixiContainer.pixiContainer;
            Object.assign(container, effect.transform);
          }
        } else {
          const targetPixiContainer = RUNTIME_GAMEPLAY.pixiStage?.getStageObjByKey(key);
          if (targetPixiContainer) {
            const container = targetPixiContainer.pixiContainer;
            Object.assign(container, baseTransform);
          }
        }
      }
    }
  }, 10);
}
