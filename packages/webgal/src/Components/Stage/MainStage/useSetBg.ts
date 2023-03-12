import { IStageState } from '@/store/stageInterface';
import { useEffect } from 'react';
import { RUNTIME_GAMEPLAY } from '@/Core/runtime/gamePlay';
import { logger } from '@/Core/util/etc/logger';
import { IStageObject } from '@/Core/controller/stage/pixi/PixiController';
import { generateUniversalSoftOffAnimationObj } from '@/Core/controller/stage/pixi/animations/universalSoftOff';
import { generateUniversalSoftInAnimationObj } from '@/Core/controller/stage/pixi/animations/universalSoftIn';
import { setEbg } from '@/Core/util/setEbg';

export function useSetBg(stageState: IStageState) {
  const bgName = stageState.bgName;

  /**
   * 设置背景
   */
  useEffect(() => {
    const thisBgKey = 'bg-main';
    if (bgName !== '') {
      const currentBg = RUNTIME_GAMEPLAY.pixiStage?.getStageObjByKey(thisBgKey);
      if (currentBg) {
        if (currentBg.sourceUrl !== bgName) {
          removeBg(currentBg);
        }
      }
      RUNTIME_GAMEPLAY.pixiStage?.addBg(thisBgKey, bgName);
      setEbg(bgName);
      logger.debug('重设背景');
      // 走默认动画
      RUNTIME_GAMEPLAY.pixiStage!.registerPresetAnimation(
        generateUniversalSoftInAnimationObj(thisBgKey, 1000),
        'bg-main-softin',
        thisBgKey,
        stageState.effects,
      );
      setTimeout(() => RUNTIME_GAMEPLAY.pixiStage!.removeAnimation('bg-main-softin'), 1000);
    } else {
      const currentBg = RUNTIME_GAMEPLAY.pixiStage?.getStageObjByKey(thisBgKey);
      if (currentBg) {
        removeBg(currentBg);
      }
    }
  }, [bgName]);
}

function removeBg(bgObject: IStageObject) {
  RUNTIME_GAMEPLAY.pixiStage?.removeAnimationWithSetEffects('bg-main-softin');
  const oldBgKey = bgObject.key;
  bgObject.key = 'bg-main-off';
  RUNTIME_GAMEPLAY.pixiStage?.removeStageObjectByKey(oldBgKey);
  RUNTIME_GAMEPLAY.pixiStage!.registerAnimation(
    generateUniversalSoftOffAnimationObj('bg-main-off', 1000),
    'bg-main-softoff',
    'bg-main-off',
  );
  setTimeout(() => {
    RUNTIME_GAMEPLAY.pixiStage?.removeAnimation('bg-main-softoff');
    RUNTIME_GAMEPLAY.pixiStage?.removeStageObjectByKey('bg-main-off');
  }, 1000);
}
