import { IStageState } from '@/interface/stateInterface/stageInterface';
import { useEffect } from 'react';
import { RUNTIME_GAMEPLAY } from '@/Core/runtime/gamePlay';
import { logger } from '@/Core/util/etc/logger';
import { IStageObject } from '@/Core/controller/stage/pixi/PixiController';
import { generateUniversalSoftOffFn } from '@/Core/controller/stage/pixi/animations/universalSoftOff';
import { generateUniversalSoftInFn } from '@/Core/controller/stage/pixi/animations/universalSoftIn';

export function useSetBg(stageState: IStageState) {
  const bgName = stageState.bgName;

  /**
   * 设置背景
   */
  useEffect(() => {
    const thisBgKey = 'main';
    if (bgName !== '') {
      const currentBg = RUNTIME_GAMEPLAY.pixiStage?.getStageObjByKey(thisBgKey);
      if (currentBg) {
        if (currentBg.sourceUrl !== bgName) {
          removeBg(currentBg);
        }
      }
      RUNTIME_GAMEPLAY.pixiStage?.addBg(thisBgKey, bgName).then((res) => {
        if (res) {
          logger.debug('重设背景');
          // 走默认动画
          RUNTIME_GAMEPLAY.pixiStage!.registerTicker(
            generateUniversalSoftInFn(thisBgKey, 1000),
            'bg-softin',
            thisBgKey,
          );
        }
      });
    } else {
      const currentBg = RUNTIME_GAMEPLAY.pixiStage?.getStageObjByKey(thisBgKey);
      if (currentBg) {
        removeBg(currentBg);
      }
    }
  }, [bgName]);
}

function removeBg(bgObject: IStageObject) {
  RUNTIME_GAMEPLAY.pixiStage?.removeTicker('bg-softin');
  bgObject.key = 'main-off';
  RUNTIME_GAMEPLAY.pixiStage!.registerTicker(generateUniversalSoftOffFn('main-off', 1000), 'bg-softoff', 'main-off');
  setTimeout(() => {
    RUNTIME_GAMEPLAY.pixiStage?.removeTicker('bg-softoff');
    RUNTIME_GAMEPLAY.pixiStage?.removeStageObjectByKey('main-off');
  }, 1000);
}
