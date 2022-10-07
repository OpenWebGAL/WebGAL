import { IStageState } from '@/interface/stateInterface/stageInterface';
import { useEffect } from 'react';
import { RUNTIME_GAMEPLAY } from '@/Core/runtime/gamePlay';
import { generateBgSoftInFn } from '@/Core/controller/stage/pixi/animations/bgSoftIn';
import { logger } from '@/Core/util/etc/logger';
import { IBackground } from '@/Core/controller/stage/pixi/PixiController';
import { generateUniversalSoftOffFn } from '@/Core/controller/stage/pixi/animations/universalSoftOff';

export function useSetBg(stageState: IStageState) {
  const bgName = stageState.bgName;

  /**
   * 设置背景
   */
  useEffect(() => {
    if (bgName !== '') {
      const currentBg = RUNTIME_GAMEPLAY.pixiStage?.getBgByKey('main');
      if (currentBg) {
        if (currentBg.url !== bgName) {
          removeBg(currentBg);
        }
      }
      RUNTIME_GAMEPLAY.pixiStage?.addBg('main', bgName).then((res) => {
        if (res) {
          logger.debug('重设背景');
          RUNTIME_GAMEPLAY.pixiStage!.registerTicker(generateBgSoftInFn('main', 1000), 'bg-softin', 'main');
        }
      });
    } else {
      const currentBg = RUNTIME_GAMEPLAY.pixiStage?.getBgByKey('main');
      if (currentBg) {
        removeBg(currentBg);
      }
    }
  }, [bgName]);
}

function removeBg(bgObject: IBackground) {
  RUNTIME_GAMEPLAY.pixiStage?.removeTicker('bg-softin');
  bgObject.key = 'main-off';
  RUNTIME_GAMEPLAY.pixiStage!.registerTicker(generateUniversalSoftOffFn('main-off', 1000), 'bg-softoff', 'main-off');
  setTimeout(() => {
    RUNTIME_GAMEPLAY.pixiStage?.removeTicker('bg-softoff');
    RUNTIME_GAMEPLAY.pixiStage?.removeBg('main-off');
  }, 1000);
}
