import { IStageState } from '@/store/stageInterface';
import { useEffect } from 'react';
import { logger } from '@/Core/util/etc/logger';
import { IStageObject } from '@/Core/controller/stage/pixi/PixiController';
import { generateUniversalSoftOffAnimationObj } from '@/Core/controller/stage/pixi/animations/universalSoftOff';
import { generateUniversalSoftInAnimationObj } from '@/Core/controller/stage/pixi/animations/universalSoftIn';
import { setEbg } from '@/Core/util/setEbg';
import { WebGAL } from '@/main';

export function useSetBg(stageState: IStageState) {
  const bgName = stageState.bgName;

  /**
   * 设置背景
   */
  useEffect(() => {
    const thisBgKey = 'bg-main';
    if (bgName !== '') {
      const currentBg = WebGAL.gameplay.pixiStage?.getStageObjByKey(thisBgKey);
      if (currentBg) {
        if (currentBg.sourceUrl !== bgName) {
          removeBg(currentBg);
        }
      }
      WebGAL.gameplay.pixiStage?.addBg(thisBgKey, bgName);
      setEbg(bgName);
      logger.debug('重设背景');
      // 走默认动画
      WebGAL.gameplay.pixiStage!.registerPresetAnimation(
        generateUniversalSoftInAnimationObj(thisBgKey, 1000),
        'bg-main-softin',
        thisBgKey,
        stageState.effects,
      );
      setTimeout(() => WebGAL.gameplay.pixiStage!.removeAnimation('bg-main-softin'), 1000);
    } else {
      const currentBg = WebGAL.gameplay.pixiStage?.getStageObjByKey(thisBgKey);
      if (currentBg) {
        removeBg(currentBg);
      }
    }
  }, [bgName]);
}

function removeBg(bgObject: IStageObject) {
  WebGAL.gameplay.pixiStage?.removeAnimationWithSetEffects('bg-main-softin');
  const oldBgKey = bgObject.key;
  bgObject.key = 'bg-main-off';
  WebGAL.gameplay.pixiStage?.removeStageObjectByKey(oldBgKey);
  WebGAL.gameplay.pixiStage!.registerAnimation(
    generateUniversalSoftOffAnimationObj('bg-main-off', 1000),
    'bg-main-softoff',
    'bg-main-off',
  );
  setTimeout(() => {
    WebGAL.gameplay.pixiStage?.removeAnimation('bg-main-softoff');
    WebGAL.gameplay.pixiStage?.removeStageObjectByKey('bg-main-off');
  }, 1000);
}
