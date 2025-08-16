import { baseTransform, IEffect, IStageState, ITransform } from '@/store/stageInterface';

import { WebGAL } from '@/Core/WebGAL';
import PixiStage from '@/Core/controller/stage/pixi/PixiController';

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
          // @ts-ignore 没有引入新的子对象
          PixiStage.assignTransform(container, convertTransform(effect.transform));
        }
      } else {
        const targetPixiContainer = WebGAL.gameplay.pixiStage?.getStageObjByKey(key);
        if (targetPixiContainer) {
          const container = targetPixiContainer.pixiContainer;
          // @ts-ignore 没有引入新的子对象
          PixiStage.assignTransform(container, convertTransform(baseTransform));
        }
      }
    }
  }
}

function convertTransform(transform: ITransform | undefined) {
  if (!transform) {
    return {};
  }
  const { position, ...rest } = transform;
  return { ...rest, x: position.x, y: position.y };
}
