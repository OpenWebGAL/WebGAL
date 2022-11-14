import { IStageState } from '@/store/stageInterface';
import { useEffect } from 'react';
import { RUNTIME_GAMEPLAY } from '@/Core/runtime/gamePlay';
import { logger } from '@/Core/util/etc/logger';
import { generateUniversalSoftInAnimationObj } from '@/Core/controller/stage/pixi/animations/universalSoftIn';
import { IStageObject } from '@/Core/controller/stage/pixi/PixiController';
import { generateUniversalSoftOffAnimationObj } from '@/Core/controller/stage/pixi/animations/universalSoftOff';

export function useSetFigure(stageState: IStageState) {
  const { figNameLeft, figName, figNameRight } = stageState;

  /**
   * 设置立绘
   */
  useEffect(() => {
    /**
     * 特殊处理：中间立绘
     */
    const thisFigKey = 'fig-center';
    const softInAniKey = 'fig-center-softin';
    if (figName !== '') {
      const currentFigCenter = RUNTIME_GAMEPLAY.pixiStage?.getStageObjByKey(thisFigKey);
      if (currentFigCenter) {
        if (currentFigCenter.sourceUrl !== figName) {
          removeFig(currentFigCenter, softInAniKey);
        }
      }
      RUNTIME_GAMEPLAY.pixiStage?.addFigure(thisFigKey, figName, 'center');
      logger.debug('中立绘已重设');

      RUNTIME_GAMEPLAY.pixiStage!.registerAnimation(
        generateUniversalSoftInAnimationObj(thisFigKey, 300),
        softInAniKey,
        thisFigKey,
      );
    } else {
      logger.debug('移除中立绘');
      const currentFigCenter = RUNTIME_GAMEPLAY.pixiStage?.getStageObjByKey(thisFigKey);
      if (currentFigCenter) {
        if (currentFigCenter.sourceUrl !== figName) {
          removeFig(currentFigCenter, softInAniKey);
        }
      }
    }
  }, [figName]);

  useEffect(() => {
    /**
     * 特殊处理：左侧立绘
     */
    const thisFigKey = 'fig-left';
    const softInAniKey = 'fig-left-softin';
    if (figNameLeft !== '') {
      const currentFigLeft = RUNTIME_GAMEPLAY.pixiStage?.getStageObjByKey(thisFigKey);
      if (currentFigLeft) {
        if (currentFigLeft.sourceUrl !== figNameLeft) {
          removeFig(currentFigLeft, softInAniKey);
        }
      }
      RUNTIME_GAMEPLAY.pixiStage?.addFigure(thisFigKey, figNameLeft, 'left');
      logger.debug('左立绘已重设');
      RUNTIME_GAMEPLAY.pixiStage!.registerAnimation(
        generateUniversalSoftInAnimationObj(thisFigKey, 300),
        softInAniKey,
        thisFigKey,
      );
    } else {
      const currentFigLeft = RUNTIME_GAMEPLAY.pixiStage?.getStageObjByKey(thisFigKey);
      if (currentFigLeft) {
        if (currentFigLeft.sourceUrl !== figNameLeft) {
          removeFig(currentFigLeft, softInAniKey);
        }
      }
    }
  }, [figNameLeft]);

  useEffect(() => {
    /**
     * 特殊处理：右侧立绘
     */
    const thisFigKey = 'fig-right';
    const softInAniKey = 'fig-right-softin';
    if (figNameRight !== '') {
      const currentFigRight = RUNTIME_GAMEPLAY.pixiStage?.getStageObjByKey(thisFigKey);
      if (currentFigRight) {
        if (currentFigRight.sourceUrl !== figNameRight) {
          removeFig(currentFigRight, softInAniKey);
        }
      }
      RUNTIME_GAMEPLAY.pixiStage?.addFigure(thisFigKey, figNameRight, 'right');
      logger.debug('右立绘已重设');
      // 如果有等待注册的动画
      RUNTIME_GAMEPLAY.pixiStage!.registerAnimation(
        generateUniversalSoftInAnimationObj(thisFigKey, 300),
        softInAniKey,
        thisFigKey,
      );
    } else {
      const currentFigRight = RUNTIME_GAMEPLAY.pixiStage?.getStageObjByKey(thisFigKey);
      if (currentFigRight) {
        if (currentFigRight.sourceUrl !== figNameRight) {
          removeFig(currentFigRight, softInAniKey);
        }
      }
    }
  }, [figNameRight]);
}

function removeFig(figObj: IStageObject, enterTikerKey: string) {
  RUNTIME_GAMEPLAY.pixiStage?.removeAnimationWithSetEffects(enterTikerKey);
  const oldFigKey = figObj.key;
  figObj.key = figObj.key + '-off';
  RUNTIME_GAMEPLAY.pixiStage?.removeStageObjectByKey(oldFigKey);
  const figKey = figObj.key;
  const leaveKey = figKey + '-softoff';
  RUNTIME_GAMEPLAY.pixiStage!.registerAnimation(generateUniversalSoftOffAnimationObj(figKey, 200), leaveKey, figKey);
  setTimeout(() => {
    RUNTIME_GAMEPLAY.pixiStage?.removeAnimationWithSetEffects(leaveKey);
    RUNTIME_GAMEPLAY.pixiStage?.removeStageObjectByKey(figKey);
  }, 250);
}
