import { IEffect, IStageState } from '@/store/stageInterface';
import { useEffect } from 'react';
import { RUNTIME_GAMEPLAY } from '@/Core/runtime/gamePlay';
import { logger } from '@/Core/util/etc/logger';
import { generateUniversalSoftInAnimationObj } from '@/Core/controller/stage/pixi/animations/universalSoftIn';
import { IStageObject } from '@/Core/controller/stage/pixi/PixiController';
import { generateUniversalSoftOffAnimationObj } from '@/Core/controller/stage/pixi/animations/universalSoftOff';

export function useSetFigure(stageState: IStageState) {
  const { figNameLeft, figName, figNameRight, freeFigure } = stageState;

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
          removeFig(currentFigCenter, softInAniKey, stageState.effects);
        }
      }
      RUNTIME_GAMEPLAY.pixiStage?.addFigure(thisFigKey, figName, 'center');
      logger.debug('中立绘已重设');
      RUNTIME_GAMEPLAY.pixiStage!.registerPresetAnimation(
        generateUniversalSoftInAnimationObj(thisFigKey, 300),
        softInAniKey,
        thisFigKey,
        stageState.effects,
      );
      setTimeout(() => RUNTIME_GAMEPLAY.pixiStage!.removeAnimation(softInAniKey), 300);
    } else {
      logger.debug('移除中立绘');
      const currentFigCenter = RUNTIME_GAMEPLAY.pixiStage?.getStageObjByKey(thisFigKey);
      if (currentFigCenter) {
        if (currentFigCenter.sourceUrl !== figName) {
          removeFig(currentFigCenter, softInAniKey, stageState.effects);
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
          removeFig(currentFigLeft, softInAniKey, stageState.effects);
        }
      }
      RUNTIME_GAMEPLAY.pixiStage?.addFigure(thisFigKey, figNameLeft, 'left');
      logger.debug('左立绘已重设');
      RUNTIME_GAMEPLAY.pixiStage!.registerPresetAnimation(
        generateUniversalSoftInAnimationObj(thisFigKey, 300),
        softInAniKey,
        thisFigKey,
        stageState.effects,
      );
      setTimeout(() => RUNTIME_GAMEPLAY.pixiStage!.removeAnimation(softInAniKey), 300);
    } else {
      const currentFigLeft = RUNTIME_GAMEPLAY.pixiStage?.getStageObjByKey(thisFigKey);
      if (currentFigLeft) {
        if (currentFigLeft.sourceUrl !== figNameLeft) {
          removeFig(currentFigLeft, softInAniKey, stageState.effects);
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
          removeFig(currentFigRight, softInAniKey, stageState.effects);
        }
      }
      RUNTIME_GAMEPLAY.pixiStage?.addFigure(thisFigKey, figNameRight, 'right');
      logger.debug('右立绘已重设');
      RUNTIME_GAMEPLAY.pixiStage!.registerPresetAnimation(
        generateUniversalSoftInAnimationObj(thisFigKey, 300),
        softInAniKey,
        thisFigKey,
        stageState.effects,
      );
      setTimeout(() => RUNTIME_GAMEPLAY.pixiStage!.removeAnimation(softInAniKey), 300);
    } else {
      const currentFigRight = RUNTIME_GAMEPLAY.pixiStage?.getStageObjByKey(thisFigKey);
      if (currentFigRight) {
        if (currentFigRight.sourceUrl !== figNameRight) {
          removeFig(currentFigRight, softInAniKey, stageState.effects);
        }
      }
    }
  }, [figNameRight]);

  useEffect(() => {
    // 自由立绘
    for (const fig of freeFigure) {
      /**
       * 特殊处理：自由立绘
       */
      const thisFigKey = `${fig.key}`;
      const softInAniKey = `${fig.key}-softin`;
      /**
       * 非空
       */
      if (fig.name !== '') {
        const currentFigThisKey = RUNTIME_GAMEPLAY.pixiStage?.getStageObjByKey(thisFigKey);
        if (currentFigThisKey) {
          if (currentFigThisKey.sourceUrl !== fig.name) {
            removeFig(currentFigThisKey, softInAniKey, stageState.effects);
            RUNTIME_GAMEPLAY.pixiStage?.addFigure(thisFigKey, fig.name, fig.basePosition);
            logger.debug(`${fig.key}立绘已重设`);
            RUNTIME_GAMEPLAY.pixiStage!.registerPresetAnimation(
              generateUniversalSoftInAnimationObj(thisFigKey, 300),
              softInAniKey,
              thisFigKey,
              stageState.effects,
            );
            setTimeout(() => RUNTIME_GAMEPLAY.pixiStage!.removeAnimation(softInAniKey), 300);
          }
        } else {
          RUNTIME_GAMEPLAY.pixiStage?.addFigure(thisFigKey, fig.name, fig.basePosition);
          logger.debug(`${fig.key}立绘已重设`);
          RUNTIME_GAMEPLAY.pixiStage!.registerPresetAnimation(
            generateUniversalSoftInAnimationObj(thisFigKey, 300),
            softInAniKey,
            thisFigKey,
            stageState.effects,
          );
          setTimeout(() => RUNTIME_GAMEPLAY.pixiStage!.removeAnimation(softInAniKey), 300);
        }
      } else {
        const currentFigThisKey = RUNTIME_GAMEPLAY.pixiStage?.getStageObjByKey(thisFigKey);
        if (currentFigThisKey) {
          if (currentFigThisKey.sourceUrl !== fig.name) {
            removeFig(currentFigThisKey, softInAniKey, stageState.effects);
          }
        }
      }
    }

    /**
     * 移除不在状态表中的立绘
     */
    const currentFigures = RUNTIME_GAMEPLAY.pixiStage?.figureObjects;
    if (currentFigures) {
      for (const existFigure of currentFigures) {
        if (existFigure.key === 'fig-left' || existFigure.key === 'fig-center' || existFigure.key === 'fig-right') {
          // 什么也不做
        } else {
          const existKey = existFigure.key;
          const existFigInState = freeFigure.findIndex((fig) => fig.key === existKey);
          if (existFigInState < 0) {
            const softInAniKey = `${existFigure.key}-softin`;
            removeFig(existFigure, softInAniKey, stageState.effects);
          }
        }
      }
    }
  }, [freeFigure]);
}

function removeFig(figObj: IStageObject, enterTikerKey: string, effects: IEffect[]) {
  RUNTIME_GAMEPLAY.pixiStage?.removeAnimationWithSetEffects(enterTikerKey);
  const oldFigKey = figObj.key;
  figObj.key = figObj.key + '-off';
  RUNTIME_GAMEPLAY.pixiStage?.removeStageObjectByKey(oldFigKey);
  const figKey = figObj.key;
  const leaveKey = figKey + '-softoff';
  RUNTIME_GAMEPLAY.pixiStage!.registerPresetAnimation(
    generateUniversalSoftOffAnimationObj(figKey, 200),
    leaveKey,
    figKey,
    effects,
  );
  setTimeout(() => {
    RUNTIME_GAMEPLAY.pixiStage?.removeAnimation(leaveKey);
    RUNTIME_GAMEPLAY.pixiStage?.removeStageObjectByKey(figKey);
  }, 250);
}
