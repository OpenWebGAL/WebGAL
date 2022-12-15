import { RUNTIME_GAMEPLAY } from '@/Core/runtime/gamePlay';
import { baseTransform, IEffect, IStageState } from '@/store/stageInterface';
// import { logger } from '@/Core/util/etc/logger';
import { setBlurFilter } from '@/Core/util/etc/setBlurFilter';

export function setStageObjectEffects(stageState: IStageState) {
  const effects = stageState.effects;
  setTimeout(() => {
    setStageEffects(effects);
  }, 10);
}

export function setStageEffects(effects: IEffect[]) {
  const stageObjects = RUNTIME_GAMEPLAY.pixiStage?.getAllStageObj() ?? [];
  for (const stageObj of stageObjects) {
    const key = stageObj.key;
    const effect = effects.find((effect) => effect.target === key);
    const lockedStageTargets = RUNTIME_GAMEPLAY.pixiStage?.getAllLockedObject() ?? [];
    if (!lockedStageTargets.includes(key)) {
      if (effect) {
        // logger.debug('应用effects', key);
        const targetPixiContainer = RUNTIME_GAMEPLAY.pixiStage?.getStageObjByKey(key);
        if (targetPixiContainer) {
          const container = targetPixiContainer.pixiContainer;
          setBlurFilter(container);
          Object.assign(container, effect.transform);
        }
      } else {
        const targetPixiContainer = RUNTIME_GAMEPLAY.pixiStage?.getStageObjByKey(key);
        if (targetPixiContainer) {
          const container = targetPixiContainer.pixiContainer;
          setBlurFilter(container);
          Object.assign(container, baseTransform);
        }
      }
    }
  }
}
