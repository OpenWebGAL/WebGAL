import { baseTransform, IEffect, IStageState } from '@/store/stageInterface';
// import { logger } from '@/Core/util/etc/logger';
import { setBlurFilter } from '@/Core/util/etc/setBlurFilter';
import { WebGAL } from '@/main';

export function setStageObjectEffects(stageState: IStageState) {
  const effects = stageState.effects;
  setTimeout(() => {
    setStageEffects(effects);
  }, 10);
}

export function setStageEffects(effects: IEffect[]) {
  const stageObjects = WebGAL.gameplay.pixiStage?.getAllStageObj() ?? [];
  for (const stageObj of stageObjects) {
    const key = stageObj.key;
    const effect = effects.find((effect) => effect.target === key);
    const lockedStageTargets = WebGAL.gameplay.pixiStage?.getAllLockedObject() ?? [];
    if (!lockedStageTargets.includes(key)) {
      if (effect) {
        // logger.debug('应用effects', key);
        const targetPixiContainer = WebGAL.gameplay.pixiStage?.getStageObjByKey(key);
        if (targetPixiContainer) {
          const container = targetPixiContainer.pixiContainer;
          setBlurFilter(container);
          Object.assign(container, effect.transform);
        }
      } else {
        const targetPixiContainer = WebGAL.gameplay.pixiStage?.getStageObjByKey(key);
        if (targetPixiContainer) {
          const container = targetPixiContainer.pixiContainer;
          setBlurFilter(container);
          Object.assign(container, baseTransform);
        }
      }
    }
  }
}
