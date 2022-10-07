import { IStageState } from '@/interface/stateInterface/stageInterface';
import { useEffect } from 'react';
import { RUNTIME_GAMEPLAY } from '@/Core/runtime/gamePlay';
import { logger } from '@/Core/util/etc/logger';
import { generateUniversalSoftInFn } from '@/Core/controller/stage/pixi/animations/universalSoftIn';
import { IFigure } from '@/Core/controller/stage/pixi/PixiController';
import { generateUniversalSoftOffFn } from '@/Core/controller/stage/pixi/animations/universalSoftOff';

export function useSetFigure(stageState: IStageState) {
  const { figNameLeft, figName, figNameRight } = stageState;

  /**
   * 设置立绘
   */
  useEffect(() => {
    /**
     * 特殊处理：中间立绘
     */
    const softInAniKey = 'center-figer-softin';
    if (figName !== '') {
      const currentFigCenter = RUNTIME_GAMEPLAY.pixiStage?.getFigureByKey('center');
      if (currentFigCenter) {
        if (currentFigCenter.url !== figName) {
          removeFig(currentFigCenter, softInAniKey);
        }
      }
      RUNTIME_GAMEPLAY.pixiStage?.addFigure('center', figName, 'center').then((res) => {
        if (res) {
          logger.debug('中立绘已重设');
          RUNTIME_GAMEPLAY.pixiStage!.registerTicker(generateUniversalSoftInFn('center', 300), softInAniKey, 'center');
        }
      });
    } else {
      logger.debug('移除中立绘');
      const currentFigCenter = RUNTIME_GAMEPLAY.pixiStage?.getFigureByKey('center');
      if (currentFigCenter) {
        if (currentFigCenter.url !== figName) {
          removeFig(currentFigCenter, softInAniKey);
        }
      }
    }
  }, [figName]);

  useEffect(() => {
    /**
     * 特殊处理：左侧立绘
     */
    const softInAniKey = 'left-figer-softin';
    if (figNameLeft !== '') {
      const currentFigLeft = RUNTIME_GAMEPLAY.pixiStage?.getFigureByKey('left');
      if (currentFigLeft) {
        if (currentFigLeft.url !== figNameLeft) {
          removeFig(currentFigLeft, softInAniKey);
        }
      }
      RUNTIME_GAMEPLAY.pixiStage?.addFigure('left', figNameLeft, 'left').then((res) => {
        if (res) {
          logger.debug('左立绘已重设');
          RUNTIME_GAMEPLAY.pixiStage!.registerTicker(generateUniversalSoftInFn('left', 300), softInAniKey, 'left');
        }
      });
    } else {
      const currentFigLeft = RUNTIME_GAMEPLAY.pixiStage?.getFigureByKey('left');
      if (currentFigLeft) {
        if (currentFigLeft.url !== figNameLeft) {
          removeFig(currentFigLeft, softInAniKey);
        }
      }
    }
  }, [figNameLeft]);

  useEffect(() => {
    /**
     * 特殊处理：右侧立绘
     */
    const softInAniKey = 'right-figer-softin';
    if (figNameRight !== '') {
      const currentFigRight = RUNTIME_GAMEPLAY.pixiStage?.getFigureByKey('right');
      if (currentFigRight) {
        if (currentFigRight.url !== figNameRight) {
          removeFig(currentFigRight, softInAniKey);
        }
      }
      RUNTIME_GAMEPLAY.pixiStage?.addFigure('right', figNameRight, 'right').then((res) => {
        if (res) {
          logger.debug('右立绘已重设');
          RUNTIME_GAMEPLAY.pixiStage!.registerTicker(generateUniversalSoftInFn('right', 300), softInAniKey, 'right');
        }
      });
    } else {
      const currentFigRight = RUNTIME_GAMEPLAY.pixiStage?.getFigureByKey('right');
      if (currentFigRight) {
        if (currentFigRight.url !== figNameRight) {
          removeFig(currentFigRight, softInAniKey);
        }
      }
    }
  }, [figNameRight]);
}

function removeFig(figObj: IFigure, enterTikerKey: string) {
  RUNTIME_GAMEPLAY.pixiStage?.removeTicker(enterTikerKey);
  figObj.key = figObj.key + '-off';
  const figKey = figObj.key;
  const leaveKey = figKey + 'off';
  RUNTIME_GAMEPLAY.pixiStage!.registerTicker(generateUniversalSoftOffFn(figKey, 200), leaveKey, figKey);
  setTimeout(() => {
    RUNTIME_GAMEPLAY.pixiStage?.removeTicker(leaveKey);
    RUNTIME_GAMEPLAY.pixiStage?.removeFigure(figKey);
  }, 250);
}
