import { IEffect, IStageState } from '@/store/stageInterface';
import { useEffect } from 'react';
import { logger } from '@/Core/util/etc/logger';
import { generateUniversalSoftInAnimationObj } from '@/Core/controller/stage/pixi/animations/universalSoftIn';
import { IStageObject } from '@/Core/controller/stage/pixi/PixiController';
import { generateUniversalSoftOffAnimationObj } from '@/Core/controller/stage/pixi/animations/universalSoftOff';
import { WebGAL } from '@/main';

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
      const currentFigCenter = WebGAL.gameplay.pixiStage?.getStageObjByKey(thisFigKey);
      if (currentFigCenter) {
        if (currentFigCenter.sourceUrl !== figName) {
          removeFig(currentFigCenter, softInAniKey, stageState.effects);
        }
      }
      WebGAL.gameplay.pixiStage?.addFigure(thisFigKey, figName, 'center');
      logger.debug('中立绘已重设');
      WebGAL.gameplay.pixiStage!.registerPresetAnimation(
        generateUniversalSoftInAnimationObj(thisFigKey, 300),
        softInAniKey,
        thisFigKey,
        stageState.effects,
      );
      setTimeout(() => WebGAL.gameplay.pixiStage!.removeAnimation(softInAniKey), 300);
    } else {
      logger.debug('移除中立绘');
      const currentFigCenter = WebGAL.gameplay.pixiStage?.getStageObjByKey(thisFigKey);
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
      const currentFigLeft = WebGAL.gameplay.pixiStage?.getStageObjByKey(thisFigKey);
      if (currentFigLeft) {
        if (currentFigLeft.sourceUrl !== figNameLeft) {
          removeFig(currentFigLeft, softInAniKey, stageState.effects);
        }
      }
      WebGAL.gameplay.pixiStage?.addFigure(thisFigKey, figNameLeft, 'left');
      logger.debug('左立绘已重设');
      WebGAL.gameplay.pixiStage!.registerPresetAnimation(
        generateUniversalSoftInAnimationObj(thisFigKey, 300),
        softInAniKey,
        thisFigKey,
        stageState.effects,
      );
      setTimeout(() => WebGAL.gameplay.pixiStage!.removeAnimation(softInAniKey), 300);
    } else {
      const currentFigLeft = WebGAL.gameplay.pixiStage?.getStageObjByKey(thisFigKey);
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
      const currentFigRight = WebGAL.gameplay.pixiStage?.getStageObjByKey(thisFigKey);
      if (currentFigRight) {
        if (currentFigRight.sourceUrl !== figNameRight) {
          removeFig(currentFigRight, softInAniKey, stageState.effects);
        }
      }
      WebGAL.gameplay.pixiStage?.addFigure(thisFigKey, figNameRight, 'right');
      logger.debug('右立绘已重设');
      WebGAL.gameplay.pixiStage!.registerPresetAnimation(
        generateUniversalSoftInAnimationObj(thisFigKey, 300),
        softInAniKey,
        thisFigKey,
        stageState.effects,
      );
      setTimeout(() => WebGAL.gameplay.pixiStage!.removeAnimation(softInAniKey), 300);
    } else {
      const currentFigRight = WebGAL.gameplay.pixiStage?.getStageObjByKey(thisFigKey);
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
        const currentFigThisKey = WebGAL.gameplay.pixiStage?.getStageObjByKey(thisFigKey);
        if (currentFigThisKey) {
          if (currentFigThisKey.sourceUrl !== fig.name) {
            removeFig(currentFigThisKey, softInAniKey, stageState.effects);
            WebGAL.gameplay.pixiStage?.addFigure(thisFigKey, fig.name, fig.basePosition);
            logger.debug(`${fig.key}立绘已重设`);
            WebGAL.gameplay.pixiStage!.registerPresetAnimation(
              generateUniversalSoftInAnimationObj(thisFigKey, 300),
              softInAniKey,
              thisFigKey,
              stageState.effects,
            );
            setTimeout(() => WebGAL.gameplay.pixiStage!.removeAnimation(softInAniKey), 300);
          }
        } else {
          WebGAL.gameplay.pixiStage?.addFigure(thisFigKey, fig.name, fig.basePosition);
          logger.debug(`${fig.key}立绘已重设`);
          WebGAL.gameplay.pixiStage!.registerPresetAnimation(
            generateUniversalSoftInAnimationObj(thisFigKey, 300),
            softInAniKey,
            thisFigKey,
            stageState.effects,
          );
          setTimeout(() => WebGAL.gameplay.pixiStage!.removeAnimation(softInAniKey), 300);
        }
      } else {
        const currentFigThisKey = WebGAL.gameplay.pixiStage?.getStageObjByKey(thisFigKey);
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
    const currentFigures = WebGAL.gameplay.pixiStage?.getFigureObjects();
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
  WebGAL.gameplay.pixiStage?.removeAnimationWithSetEffects(enterTikerKey);
  const oldFigKey = figObj.key;
  figObj.key = figObj.key + '-off';
  WebGAL.gameplay.pixiStage?.removeStageObjectByKey(oldFigKey);
  const figKey = figObj.key;
  const leaveKey = figKey + '-softoff';
  WebGAL.gameplay.pixiStage!.registerPresetAnimation(
    generateUniversalSoftOffAnimationObj(figKey, 200),
    leaveKey,
    figKey,
    effects,
  );
  setTimeout(() => {
    WebGAL.gameplay.pixiStage?.removeAnimation(leaveKey);
    WebGAL.gameplay.pixiStage?.removeStageObjectByKey(figKey);
  }, 250);
}
