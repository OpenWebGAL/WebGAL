import { IStageState } from '@/interface/stateInterface/stageInterface';
import { useEffect } from 'react';
import { RUNTIME_GAMEPLAY } from '@/Core/runtime/gamePlay';
import { generateBgSoftInFn } from '@/Core/controller/stage/pixi/animations/bgSoftIn';
import { logger } from '@/Core/util/etc/logger';

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
          RUNTIME_GAMEPLAY.pixiStage?.removeBg('main');
          RUNTIME_GAMEPLAY.pixiStage?.removeTicker('bg-softin');
        }
      }
      RUNTIME_GAMEPLAY.pixiStage?.addBg('main', bgName).then((res) => {
        if (res) {
          logger.debug('重设背景');
          RUNTIME_GAMEPLAY.pixiStage!.getBgByKey('main')!.pixiSprite.alpha = 0;
          RUNTIME_GAMEPLAY.pixiStage!.registerTicker(generateBgSoftInFn('main', 1000), 'bg-softin', 'main');
        }
      });
    } else {
      RUNTIME_GAMEPLAY.pixiStage?.removeBg('main');
      RUNTIME_GAMEPLAY.pixiStage?.removeTicker('bg-softin');
    }
  }, [bgName]);
}
