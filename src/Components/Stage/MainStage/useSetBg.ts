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
    const thisBgKey = 'main';
    if (bgName !== '') {
      const currentBg = RUNTIME_GAMEPLAY.pixiStage?.getBgByKey(thisBgKey);
      if (currentBg) {
        if (currentBg.url !== bgName) {
          removeBg(currentBg);
        }
      }
      RUNTIME_GAMEPLAY.pixiStage?.addBg(thisBgKey, bgName).then((res) => {
        if (res) {
          logger.debug('重设背景');
          // 如果有等待注册的动画
          if (RUNTIME_GAMEPLAY.pixiStage!.getPendingTicker(thisBgKey)) {
            const pendingTicker = RUNTIME_GAMEPLAY.pixiStage!.getPendingTicker(thisBgKey)!;
            RUNTIME_GAMEPLAY.pixiStage!.registerTicker(
              pendingTicker.tickerGeneraterFn(pendingTicker.key, pendingTicker.duration),
              pendingTicker.key,
              pendingTicker.target,
            );
            RUNTIME_GAMEPLAY.pixiStage?.removePendingTicker(thisBgKey);
          }
          // 否则走默认动画
          else RUNTIME_GAMEPLAY.pixiStage!.registerTicker(generateBgSoftInFn(thisBgKey, 1000), 'bg-softin', thisBgKey);
        }
      });
    } else {
      const currentBg = RUNTIME_GAMEPLAY.pixiStage?.getBgByKey(thisBgKey);
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
