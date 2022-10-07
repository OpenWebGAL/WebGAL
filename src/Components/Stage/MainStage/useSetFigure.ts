import { IStageState } from '@/interface/stateInterface/stageInterface';
import { useEffect } from 'react';
import { RUNTIME_GAMEPLAY } from '@/Core/runtime/gamePlay';
import { logger } from '@/Core/util/etc/logger';

export function useSetFigure(stageState: IStageState) {
  const { figNameLeft, figName, figNameRight } = stageState;

  /**
   * 设置立绘
   */
  useEffect(() => {
    /**
     * 特殊处理：中间立绘
     */
    if (figName !== '') {
      const currentFigCenter = RUNTIME_GAMEPLAY.pixiStage?.getFigureByKey('center');
      if (currentFigCenter) {
        if (currentFigCenter.url !== figName) {
          RUNTIME_GAMEPLAY.pixiStage?.removeFigure('center');
        }
      }
      RUNTIME_GAMEPLAY.pixiStage?.addFigure('center', figName, 'center').then((res) => {
        if (res) {
          logger.debug('中立绘已重设');
          logger.debug('重设为', figName);
        }
      });
    } else {
      logger.debug('移除中立绘');
      RUNTIME_GAMEPLAY.pixiStage?.removeFigure('center');
    }
  }, [figName]);

  useEffect(() => {
    /**
     * 特殊处理：左侧立绘
     */
    if (figNameLeft !== '') {
      const currentFigLeft = RUNTIME_GAMEPLAY.pixiStage?.getFigureByKey('left');
      if (currentFigLeft) {
        if (currentFigLeft.url !== figNameLeft) {
          RUNTIME_GAMEPLAY.pixiStage?.removeFigure('left');
        }
      }
      RUNTIME_GAMEPLAY.pixiStage?.addFigure('left', figNameLeft, 'left').then((res) => {
        if (res) {
          logger.debug('左立绘已重设');
        }
      });
    } else {
      RUNTIME_GAMEPLAY.pixiStage?.removeFigure('left');
    }
  }, [figNameLeft]);

  useEffect(() => {
    /**
     * 特殊处理：右侧立绘
     */
    if (figNameRight !== '') {
      const currentFigRight = RUNTIME_GAMEPLAY.pixiStage?.getFigureByKey('right');
      if (currentFigRight) {
        if (currentFigRight.url !== figNameRight) {
          RUNTIME_GAMEPLAY.pixiStage?.removeFigure('right');
        }
      }
      RUNTIME_GAMEPLAY.pixiStage?.addFigure('right', figNameRight, 'right').then((res) => {
        if (res) {
          logger.debug('右立绘已重设');
        }
      });
    } else {
      RUNTIME_GAMEPLAY.pixiStage?.removeFigure('right');
    }
  }, [figNameRight]);
}
